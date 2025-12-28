import { useMutation } from '@tanstack/react-query';
import { explainWhyFocused } from './api';

export function useExplainWhyFocused() {
  return useMutation({
    mutationFn: explainWhyFocused,
  });
}
