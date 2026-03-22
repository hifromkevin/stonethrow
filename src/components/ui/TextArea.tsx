import { useEffect, useRef } from 'react';
import { TTextArea } from '@/types';

const TextArea = ({ content, setContent, placeholderText = '' }: TTextArea) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const moveCaretToEnd = () => {
    const el = textareaRef.current;
    if (!el) return;

    const length = el.value.length;
    el.setSelectionRange(length, length);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      autoResizeTextarea();
      moveCaretToEnd();
    });
  }, []);

  return (
    <textarea
      ref={textareaRef}
      rows={1}
      autoFocus
      value={content}
      onChange={(e) => {
        setContent(e.target.value);
        autoResizeTextarea();
      }}
      placeholder={placeholderText}
      className="w-full resize-none overflow-hidden bg-transparent px-0 text-3xl leading-snug font-bold tracking-[0.01em] focus:outline-none"
    />
  );
};
export default TextArea;
