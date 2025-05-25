"use client"
import { useEffect } from 'react';

/**Hook to change title */
export default function useTitle(newTitle: string) {
    useEffect(() => {
      document.title = newTitle + " - Furizon";
    }, []);
  }