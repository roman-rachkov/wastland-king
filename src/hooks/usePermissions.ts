import { useState, useEffect } from 'react';
import { auth } from '../services/firebase';

export const usePermissions = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      
      if (user) {
        // Check if user is admin or moderator
        const adminEmails = ['admin@example.com']; // Add your admin emails
        const moderatorEmails = ['moderator@example.com']; // Add your moderator emails
        
        setIsAdmin(adminEmails.includes(user.email || ''));
        setIsModerator(moderatorEmails.includes(user.email || ''));
      } else {
        setIsAdmin(false);
        setIsModerator(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const canEditPost = (postAuthorId: string) => {
    return user && (user.uid === postAuthorId || isAdmin || isModerator);
  };

  const canModerate = () => {
    return isAdmin || isModerator;
  };

  const canEdit = () => {
    return !!user;
  };

  return {
    user,
    isAdmin,
    isModerator,
    canEditPost,
    canModerate,
    canEdit
  };
}; 