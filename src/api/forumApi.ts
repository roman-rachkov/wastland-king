import { db } from '../services/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ForumSection, 
  TopicApi, 
  PostApi, 
  User, 
  CreateTopicInput,
  CreatePostInput,
  CreateSectionInput 
} from '../types/Forum';
import { auth } from '../services/firebase';

// ===== РАЗДЕЛЫ ФОРУМА =====

export const fetchForumSections = async (): Promise<ForumSection[]> => {
  try {
    const sectionsRef = collection(db, 'forumSections');
    const q = query(sectionsRef, orderBy('order', 'asc'), where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as ForumSection[];
  } catch (error) {
    console.error('Error fetching forum sections:', error);
    throw error;
  }
};

export const fetchForumSection = async (id: string): Promise<ForumSection | null> => {
  try {
    const sectionRef = doc(db, 'forumSections', id);
    const sectionDoc = await getDoc(sectionRef);
    
    if (!sectionDoc.exists()) {
      return null;
    }
    
    return {
      id: sectionDoc.id,
      ...sectionDoc.data(),
      createdAt: sectionDoc.data().createdAt?.toDate() || new Date(),
      updatedAt: sectionDoc.data().updatedAt?.toDate() || new Date(),
    } as ForumSection;
  } catch (error) {
    console.error('Error fetching forum section:', error);
    throw error;
  }
};

export const createForumSection = async (input: CreateSectionInput): Promise<ForumSection> => {
  try {
    const sectionsRef = collection(db, 'forumSections');
    const newSection = {
      ...input,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      readPermissions: input.readPermissions || [],
      writePermissions: input.writePermissions || [],
    };
    
    const docRef = await addDoc(sectionsRef, newSection);
    return {
      id: docRef.id,
      ...newSection,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ForumSection;
  } catch (error) {
    console.error('Error creating forum section:', error);
    throw error;
  }
};

export const updateForumSection = async (id: string, input: Partial<CreateSectionInput>): Promise<void> => {
  try {
    const sectionRef = doc(db, 'forumSections', id);
    await updateDoc(sectionRef, {
      ...input,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating forum section:', error);
    throw error;
  }
};

export const deleteForumSection = async (id: string): Promise<void> => {
  try {
    const sectionRef = doc(db, 'forumSections', id);
    await deleteDoc(sectionRef);
  } catch (error) {
    console.error('Error deleting forum section:', error);
    throw error;
  }
};

// ===== ТЕМЫ =====

export const fetchTopics = async (sectionId: string): Promise<TopicApi[]> => {
  try {
    const topicsRef = collection(db, 'topics');
    const q = query(
      topicsRef, 
      where('sectionId', '==', sectionId),
      where('isActive', '==', true),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    // Sort in memory for sticky topics
    const topics = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      lastPostAt: doc.data().lastPostAt?.toDate(),
      authorName: doc.data().authorName || 'Unknown',
    })) as TopicApi[];
    
    // Sort: sticky topics first, then by updatedAt
    return topics.sort((a, b) => {
      if (a.isSticky && !b.isSticky) return -1;
      if (!a.isSticky && b.isSticky) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
};

export const fetchTopic = async (id: string): Promise<TopicApi | null> => {
  try {
    const topicRef = doc(db, 'topics', id);
    const topicDoc = await getDoc(topicRef);
    
    if (!topicDoc.exists()) {
      return null;
    }
    
    return {
      id: topicDoc.id,
      ...topicDoc.data(),
      createdAt: topicDoc.data().createdAt?.toDate() || new Date(),
      updatedAt: topicDoc.data().updatedAt?.toDate() || new Date(),
      lastPostAt: topicDoc.data().lastPostAt?.toDate(),
    } as TopicApi;
  } catch (error) {
    console.error('Error fetching topic:', error);
    throw error;
  }
};

export const createTopic = async (input: CreateTopicInput, authorId: string): Promise<TopicApi> => {
  try {
    const topicsRef = collection(db, 'topics');
    
    // Get current user info
    const currentUser = auth.currentUser;
    const authorName = currentUser?.displayName || currentUser?.email || 'Unknown';
    
    const newTopic = {
      ...input,
      authorId,
      authorName,
      isSticky: false,
      isLocked: false,
      isActive: true,
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(topicsRef, newTopic);
    return {
      id: docRef.id,
      ...newTopic,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as TopicApi;
  } catch (error) {
    console.error('Error creating topic:', error);
    throw error;
  }
};

export const updateTopic = async (id: string, input: Partial<CreateTopicInput>): Promise<void> => {
  try {
    const topicRef = doc(db, 'topics', id);
    await updateDoc(topicRef, {
      ...input,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating topic:', error);
    throw error;
  }
};

export const deleteTopic = async (id: string): Promise<void> => {
  try {
    const topicRef = doc(db, 'topics', id);
    await deleteDoc(topicRef);
  } catch (error) {
    console.error('Error deleting topic:', error);
    throw error;
  }
};

// ===== СООБЩЕНИЯ =====

export const fetchPosts = async (topicId: string): Promise<PostApi[]> => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef, 
      where('topicId', '==', topicId),
      where('isActive', '==', true),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      editedAt: doc.data().editedAt?.toDate(),
    })) as PostApi[];
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const fetchPost = async (id: string): Promise<PostApi | null> => {
  try {
    const postRef = doc(db, 'posts', id);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      return null;
    }
    
    return {
      id: postDoc.id,
      ...postDoc.data(),
      createdAt: postDoc.data().createdAt?.toDate() || new Date(),
      updatedAt: postDoc.data().updatedAt?.toDate() || new Date(),
      editedAt: postDoc.data().editedAt?.toDate(),
    } as PostApi;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
};

export const createPost = async (input: CreatePostInput, authorId: string): Promise<PostApi> => {
  try {
    const postsRef = collection(db, 'posts');
    
    // Get current user info
    const currentUser = auth.currentUser;
    const authorName = currentUser?.displayName || currentUser?.email || 'Unknown';
    
    const newPost = {
      ...input,
      authorId,
      authorName,
      isActive: true,
      isEdited: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(postsRef, newPost);
    
    // Обновляем lastPostAt в теме (делаем это отдельно, чтобы не блокировать создание поста)
    try {
      const topicRef = doc(db, 'topics', input.topicId);
      await updateDoc(topicRef, {
        lastPostAt: serverTimestamp(),
      });
    } catch (topicUpdateError) {
      console.warn('Failed to update topic lastPostAt:', topicUpdateError);
      // Не прерываем создание поста из-за ошибки обновления темы
    }
    
    return {
      id: docRef.id,
      ...newPost,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as PostApi;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const updatePost = async (id: string, input: Partial<CreatePostInput>, editedBy?: string): Promise<void> => {
  try {
    const postRef = doc(db, 'posts', id);
    await updateDoc(postRef, {
      ...input,
      isEdited: true,
      editedBy,
      editedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

export const deletePost = async (id: string): Promise<void> => {
  try {
    const postRef = doc(db, 'posts', id);
    await deleteDoc(postRef);
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// ===== ПОЛЬЗОВАТЕЛИ =====

export const fetchUser = async (id: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', id);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    return {
      id: userDoc.id,
      ...userDoc.data(),
      createdAt: userDoc.data().createdAt?.toDate() || new Date(),
      updatedAt: userDoc.data().updatedAt?.toDate() || new Date(),
      lastSeen: userDoc.data().lastSeen?.toDate(),
    } as User;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
  try {
    const usersRef = collection(db, 'users');
    const newUser = {
      ...userData,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(usersRef, newUser);
    return {
      id: docRef.id,
      ...newUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// ===== СТАТИСТИКА ФОРУМА =====

export interface ForumStats {
  totalTopics: number;
  totalPosts: number;
  totalUsers: number;
  topicsToday: number;
  postsToday: number;
  usersToday: number;
}

export const fetchForumStats = async (): Promise<ForumStats> => {
  try {
    // Получаем общее количество тем
    const topicsRef = collection(db, 'topics');
    const topicsQuery = query(topicsRef, where('isActive', '==', true));
    const topicsSnapshot = await getDocs(topicsQuery);
    const totalTopics = topicsSnapshot.size;

    // Получаем общее количество постов
    const postsRef = collection(db, 'posts');
    const postsQuery = query(postsRef, where('isActive', '==', true));
    const postsSnapshot = await getDocs(postsQuery);
    const totalPosts = postsSnapshot.size;

    // Получаем общее количество пользователей
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, where('isActive', '==', true));
    const usersSnapshot = await getDocs(usersQuery);
    const totalUsers = usersSnapshot.size;

    // Получаем количество тем за сегодня
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const topicsTodayQuery = query(
      topicsRef, 
      where('isActive', '==', true),
      where('createdAt', '>=', today)
    );
    const topicsTodaySnapshot = await getDocs(topicsTodayQuery);
    const topicsToday = topicsTodaySnapshot.size;

    // Получаем количество постов за сегодня
    const postsTodayQuery = query(
      postsRef, 
      where('isActive', '==', true),
      where('createdAt', '>=', today)
    );
    const postsTodaySnapshot = await getDocs(postsTodayQuery);
    const postsToday = postsTodaySnapshot.size;

    // Получаем количество новых пользователей за сегодня
    const usersTodayQuery = query(
      usersRef, 
      where('isActive', '==', true),
      where('createdAt', '>=', today)
    );
    const usersTodaySnapshot = await getDocs(usersTodayQuery);
    const usersToday = usersTodaySnapshot.size;

    return {
      totalTopics,
      totalPosts,
      totalUsers,
      topicsToday,
      postsToday,
      usersToday,
    };
  } catch (error) {
    console.error('Error fetching forum stats:', error);
    throw error;
  }
};

// Получение количества тем для конкретного раздела
export const fetchSectionTopicCount = async (sectionId: string): Promise<number> => {
  try {
    const topicsRef = collection(db, 'topics');
    const q = query(
      topicsRef, 
      where('sectionId', '==', sectionId),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error fetching section topic count:', error);
    return 0;
  }
};

// Получение количества постов для конкретной темы
export const fetchTopicPostCount = async (topicId: string): Promise<number> => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef, 
      where('topicId', '==', topicId),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error fetching topic post count:', error);
    return 0;
  }
}; 