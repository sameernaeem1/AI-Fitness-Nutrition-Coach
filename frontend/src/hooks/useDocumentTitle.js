import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) {
      document.title = `AI Fitness Coach - ${title}`;
    }
  }, [title]);
}