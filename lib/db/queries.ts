import { and, asc, desc, eq, gt, gte, inArray, isNull } from 'drizzle-orm';
import { getDb } from './connection';

import {
  user,
  chat,
  document,
  type Suggestion,
  suggestion,
  type Message,
  message,
  vote,
  userKnowledge,
  starterKit,
  type UserKnowledge,
  charge,
  type UserWithRelations,
} from './schema';
import type { BlockKind } from '@/components/block';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// Export the db object for backward compatibility
export const db = getDb();

export type User = UserWithRelations;

export async function getUser(id: string): Promise<User[]> {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Returning empty user array.');
      return [];
    }

    const users = await db.select().from(user).where(eq(user.id, id));

    if (users.length === 0) {
      return [];
    }

    // Get related data separately
    const [information, createdKits, claimedKits, charges] = await Promise.all([
      db.select().from(userKnowledge).where(eq(userKnowledge.userId, id)),
      db.select().from(starterKit).where(eq(starterKit.creatorId, id)),
      db.select().from(starterKit).where(eq(starterKit.claimerId, id)),
      db.select().from(charge).where(eq(charge.userId, id)),
    ]);

    return users.map((u) => ({
      ...u,
      information,
      createdKits,
      claimedKits,
      charges,
    }));
  } catch (error) {
    console.error('Failed to get user with related data:', error);
    throw error;
  }
}

export async function createUserIfNotExists(address: string): Promise<void> {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot create user.');
      return;
    }

    const existingUser = await getUser(address);
    if (existingUser.length === 0) {
      await db.insert(user).values({
        id: address,
      });
    }
  } catch (error) {
    console.error('Failed to create user');
    // Don't throw the error, just log it
    console.error(error);
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot save chat.');
      return null;
    }

    await createUserIfNotExists(userId); // Ensure user exists
    return await db.insert(chat).values({
      id,
      userId,
      title,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save chat');
    console.error(error);
    return null;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot delete chat.');
      return null;
    }

    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));

    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    console.error(error);
    return null;
  }
}

export async function getChatsByUserId({ userId }: { userId: string }) {
  try {
    console.log('Getting chats for user:', userId);

    if (!db) {
      console.warn('⚠️ Database not available. Returning empty chats array.');
      return [];
    }

    const chats = await db
      .select()
      .from(chat)
      .where(eq(chat.userId, userId))
      .orderBy(desc(chat.createdAt));
    return chats;
  } catch (error) {
    console.error('Failed to get chats by user from database', error);
    return [];
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot get chat.');
      return null;
    }

    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error('Failed to get chat by id from database');
    console.error(error);
    return null;
  }
}

export async function saveMessages({ messages }: { messages: Array<Message> }) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot save messages.');
      return null;
    }

    return await db.insert(message).values(messages);
  } catch (error) {
    console.error('Failed to save messages in database', error);
    return null;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Returning empty messages array.');
      return [];
    }

    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    return [];
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot vote on message.');
      return null;
    }

    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    console.error('Failed to upvote message in database', error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot get votes.');
      return [];
    }
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: BlockKind;
  content: string;
  userId: string;
}) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot save document.');
      return null;
    }
    return await db.insert(document).values({
      id,
      title,
      kind,
      content,
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot get documents.');
      return [];
    }
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot get document.');
      return null;
    }
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot delete documents.');
      return null;
    }
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot save suggestions.');
      return null;
    }
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot get suggestions.');
      return [];
    }
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot get message.');
      return [];
    }
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    console.error('Failed to get message by id from database');
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot delete messages.');
      return null;
    }
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
    return null;
  } catch (error) {
    console.error(
      'Failed to delete messages by id after timestamp from database',
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot update chat visibility.');
      return null;
    }
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    console.error('Failed to update chat visibility in database');
    throw error;
  }
}

export async function saveUserInformation(
  data: Omit<UserKnowledge, 'id' | 'createdAt' | 'deletedAt'>,
) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot save user information.');
      return null;
    }
    return await db.insert(userKnowledge).values({
      ...data,
      createdAt: new Date(),
      deletedAt: null,
    });
  } catch (error) {
    console.error('Failed to save user information');
    throw error;
  }
}

export async function getUserInformation(userId: string) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot get user information.');
      return [];
    }
    return await db
      .select()
      .from(userKnowledge)
      .where(
        and(eq(userKnowledge.userId, userId), isNull(userKnowledge.deletedAt)),
      )
      .orderBy(desc(userKnowledge.createdAt));
  } catch (error) {
    console.error('Failed to get user information');
    throw error;
  }
}

export async function createStarterKit({
  id,
  value,
  userId,
  chargeId,
  claimerId,
}: {
  id?: string;
  value: number;
  userId?: string;
  chargeId?: string;
  claimerId?: string;
}) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot create starter kit.');
      return null;
    }
    if (id) {
      // If id is provided, do an upsert
      return await db
        .insert(starterKit)
        .values({
          id,
          creatorId: userId,
          claimerId,
          value,
          chargeId,
          createdAt: new Date(),
          ...(claimerId && { claimedAt: new Date() }),
        })
        .onConflictDoUpdate({
          target: starterKit.id,
          set: {
            creatorId: userId,
            claimerId,
            value,
            chargeId,
            ...(claimerId && { claimedAt: new Date() }),
          },
        });
    } else {
      // If no id is provided, just do a regular insert
      return await db.insert(starterKit).values({
        creatorId: userId,
        claimerId,
        value,
        chargeId,
        createdAt: new Date(),
        ...(claimerId && { claimedAt: new Date() }),
      });
    }
  } catch (error) {
    console.error('Failed to create starter kit');
    throw error;
  }
}

export async function claimStarterKit({
  kitId,
  userId,
}: {
  kitId: string;
  userId: string;
}) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot claim starter kit.');
      return null;
    }
    return await db
      .update(starterKit)
      .set({
        claimerId: userId,
        claimedAt: new Date(),
      })
      .where(and(eq(starterKit.id, kitId), isNull(starterKit.claimerId)));
  } catch (error) {
    console.error('Failed to claim starter kit');
    throw error;
  }
}

export async function getClaimedStarterKits(userId: string) {
  try {
    if (!db) {
      console.warn(
        '⚠️ Database not available. Cannot get claimed starter kits.',
      );
      return [];
    }
    return await db
      .select()
      .from(starterKit)
      .where(eq(starterKit.claimerId, userId))
      .orderBy(desc(starterKit.claimedAt));
  } catch (error) {
    console.error('Failed to get claimed starter kits');
    throw error;
  }
}

export async function getCreatedStarterKits(userId: string) {
  try {
    if (!db) {
      console.warn(
        '⚠️ Database not available. Cannot get created starter kits.',
      );
      return [];
    }
    return await db
      .select()
      .from(starterKit)
      .where(eq(starterKit.creatorId, userId))
      .orderBy(desc(starterKit.createdAt));
  } catch (error) {
    console.error('Failed to get created starter kits');
    throw error;
  }
}

export async function useStarterKit({
  kitId,
  amount,
}: {
  kitId: string;
  amount: number;
}) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot use starter kit.');
      return null;
    }
    return await db
      .update(starterKit)
      .set({
        balance: Number(starterKit.balance) + Number(amount),
      })
      .where(eq(starterKit.id, kitId));
  } catch (error) {
    console.error('Failed to use starter kit');
    throw error;
  }
}

export async function getUnclaimedStarterKits(userId: string) {
  try {
    if (!db) {
      console.warn(
        '⚠️ Database not available. Cannot get unclaimed starter kits.',
      );
      return [];
    }
    return await db
      .select()
      .from(starterKit)
      .where(
        and(eq(starterKit.creatorId, userId), isNull(starterKit.claimerId)),
      )
      .orderBy(desc(starterKit.createdAt));
  } catch (error) {
    console.error('Failed to get unclaimed starter kits');
    throw error;
  }
}

export async function deleteUserInformation(id: string) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot delete user information.');
      return null;
    }
    return await db
      .update(userKnowledge)
      .set({ deletedAt: new Date() })
      .where(eq(userKnowledge.id, id));
  } catch (error) {
    console.error('Failed to delete user information');
    throw error;
  }
}

export async function createCharge({
  id,
  userId,
  amount,
  currency,
  product = 'STARTERKIT',
}: {
  id: string;
  userId: string;
  amount: string;
  currency: string;
  product?: 'STARTERKIT';
}) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot create charge.');
      return null;
    }
    return await db.insert(charge).values({
      id,
      userId,
      amount,
      currency,
      product,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to create charge');
    throw error;
  }
}

export async function updateChargeStatus({
  id,
  status,
  payerAddress,
  transactionHash,
  confirmedAt,
  expiresAt,
}: {
  id: string;
  status: 'NEW' | 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'FAILED';
  payerAddress?: string;
  transactionHash?: string;
  confirmedAt?: Date;
  expiresAt?: Date;
}) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot update charge status.');
      return null;
    }
    return await db
      .update(charge)
      .set({
        status,
        ...(payerAddress && { payerAddress }),
        ...(transactionHash && { transactionHash }),
        ...(confirmedAt && { confirmedAt }),
        ...(expiresAt && { expiresAt }),
      })
      .where(eq(charge.id, id));
  } catch (error) {
    console.error('Failed to update charge status');
    throw error;
  }
}

export async function getChargeById(id: string) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot get charge.');
      return null;
    }
    return await db.select().from(charge).where(eq(charge.id, id));
  } catch (error) {
    console.error('Failed to get charge');
    throw error;
  }
}

export async function getUserCharges(userId: string) {
  try {
    if (!db) {
      console.warn('⚠️ Database not available. Cannot get user charges.');
      return [];
    }
    return await db
      .select()
      .from(charge)
      .where(eq(charge.userId, userId))
      .orderBy(desc(charge.createdAt));
  } catch (error) {
    console.error('Failed to get user charges');
    throw error;
  }
}

export async function getAvailableStarterKits() {
  try {
    if (!db) {
      console.warn(
        '⚠️ Database not available. Cannot get available starter kits.',
      );
      return [];
    }
    return await db
      .select()
      .from(starterKit)
      .where(isNull(starterKit.claimerId))
      .orderBy(asc(starterKit.createdAt));
  } catch (error) {
    console.error('Failed to get available starter kits');
    throw error;
  }
}

export async function claimAvailableStarterKit(userId: string) {
  try {
    if (!db) {
      console.warn(
        '⚠️ Database not available. Cannot claim available starter kit.',
      );
      return null;
    }
    // First get the oldest available starter kit
    const [availableKit] = await db
      .select()
      .from(starterKit)
      .where(isNull(starterKit.claimerId))
      .orderBy(asc(starterKit.createdAt))
      .limit(1);

    if (!availableKit) {
      return null;
    }

    // Claim it for the user
    await db
      .update(starterKit)
      .set({
        claimerId: userId,
        claimedAt: new Date(),
      })
      .where(eq(starterKit.id, availableKit.id));

    return availableKit;
  } catch (error) {
    console.error('Failed to claim available starter kit');
    throw error;
  }
}
