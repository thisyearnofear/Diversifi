import { ChatPage } from '@/components/chat-page';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <ChatPage id={resolvedParams.id} />;
}
