"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TOKEN_STORAGE_NAME } from '../../constants';

/**Hook to check login status */
export default function useAuth() {
    const router = useRouter();
  
    useEffect(() => {
      // Check if the token exists in localStorage
      const token = localStorage.getItem(TOKEN_STORAGE_NAME);
      
      // If the token doesn't exist, redirect to login page
      if (!token) {
        router.replace('/login');
      }
  
      // You can also add additional token validation logic here if needed
    }, [router]);
  }