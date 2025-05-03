'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { eventBus, EVENTS } from '@/lib/events';
import { toast } from 'sonner';
import { useChatContext } from '@/contexts/chat-context';
import { useAuth } from '@/hooks/use-auth';

export function ActionHandler() {
  const { append } = useChatContext();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // Check if we're in a chat
  const isInChat = pathname?.startsWith('/chat/');

  useEffect(() => {
    const unsubscribe = eventBus.on(
      EVENTS.SEND_CHAT_MESSAGE,
      async (data: { message: string; category: string }) => {
        const { message, category } = data;

        if (message) {
          // If we're not in a chat, we need to navigate to home first
          if (!isInChat && pathname !== '/') {
            // We'll handle this in the sidebar component
            return;
          }

          // If we're authenticated, update the URL
          if (isAuthenticated) {
            window.history.replaceState({}, '', pathname);
          }

          // Show toast notification
          toast.success(`Looking for ${category} actions...`);

          // Append the message directly to the chat
          await append({
            role: 'user',
            content: message,
          });
        }
      },
    );

    return () => {
      unsubscribe();
    };
  }, [append, isAuthenticated, pathname, isInChat]);

  return null; // This component doesn't render anything
}
