import useSWR from 'swr';
import { fetcher } from '@/lib/utils';

export function useChat(id: string) {
  const {
    data: chat,
    error,
    isLoading,
    mutate,
  } = useSWR(id ? `/api/chats/${id}` : null, fetcher);

  return {
    chat,
    isLoading,
    error,
    mutate,
  };
}
