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
      autoFocus
      value={content}
      onChange={(e) => {
        setContent(e.target.value);
        autoResizeTextarea();
      }}
      placeholder={placeholderText}
      className="w-full resize-none bg-white px-3 text-3xl focus:border-slate-400 focus:outline-none"
    />
  );
};
export default TextArea;
