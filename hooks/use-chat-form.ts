import { useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Attachment, ChatRequestOptions } from 'ai';
import { useLocalStorage } from 'usehooks-ts';

interface UseChatFormProps {
  chatId: string;
  handleSubmit: (
    e?: React.FormEvent<HTMLFormElement>,
    options?: ChatRequestOptions,
  ) => void;
  attachments: Array<Attachment>;
  setAttachments: (attachments: Array<Attachment>) => void;
}

export function useChatForm({
  chatId,
  handleSubmit,
  attachments,
  setAttachments,
}: UseChatFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isAuthenticated } = useAuth();
  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  const resetHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '98px';
    }
  }, []);

  const submitForm = useCallback(() => {
    console.log('submitting in the hook');
    if (isAuthenticated) {
      window.history.replaceState({}, '', `/chat/${chatId}`);
    }

    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });

    setAttachments([]);
    setLocalStorageInput('');
    resetHeight();
  }, [
    handleSubmit,
    attachments,
    chatId,
    isAuthenticated,
    setAttachments,
    setLocalStorageInput,
    resetHeight,
  ]);

  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${
        textareaRef.current.scrollHeight + 2
      }px`;
    }
  }, []);

  return {
    textareaRef,
    submitForm,
    adjustHeight,
    resetHeight,
    localStorageInput,
    setLocalStorageInput,
  };
}
