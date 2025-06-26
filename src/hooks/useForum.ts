import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchForumSections,
  fetchForumSection,
  createForumSection,
  updateForumSection,
  deleteForumSection,
  fetchTopics,
  fetchTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  fetchPosts,
  fetchPost,
  createPost,
  updatePost,
  deletePost,
  fetchUser,
  createUser,
  updateUser,
  fetchForumStats,
  fetchSectionTopicCount,
  fetchTopicPostCount,
} from '../api/forumApi';
import { CreateTopicInput, CreatePostInput, CreateSectionInput } from '../types/Forum';

// ===== РАЗДЕЛЫ ФОРУМА =====

export const useForumSections = () => {
  return useQuery({
    queryKey: ['forumSections'],
    queryFn: fetchForumSections,
  });
};

export const useForumSection = (id: string) => {
  return useQuery({
    queryKey: ['forumSection', id],
    queryFn: () => fetchForumSection(id),
    enabled: !!id,
  });
};

export const useCreateForumSection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateSectionInput) => createForumSection(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumSections'] });
    },
  });
};

export const useUpdateForumSection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateSectionInput> }) =>
      updateForumSection(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['forumSections'] });
      queryClient.invalidateQueries({ queryKey: ['forumSection', id] });
    },
  });
};

export const useDeleteForumSection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteForumSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumSections'] });
    },
  });
};

// ===== ТЕМЫ =====

export const useTopics = (sectionId: string) => {
  return useQuery({
    queryKey: ['topics', sectionId],
    queryFn: () => fetchTopics(sectionId),
    enabled: !!sectionId,
  });
};

export const useTopic = (id: string) => {
  return useQuery({
    queryKey: ['topic', id],
    queryFn: () => fetchTopic(id),
    enabled: !!id,
  });
};

export const useCreateTopic = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ input, authorId }: { input: CreateTopicInput; authorId: string }) =>
      createTopic(input, authorId),
    onSuccess: (newTopic, { input }) => {
      queryClient.invalidateQueries({ queryKey: ['topics', input.sectionId] });
      queryClient.invalidateQueries({ queryKey: ['forumSections'] });
      
      queryClient.setQueryData(['topics', input.sectionId], (oldData: any) => {
        if (!oldData) return [newTopic];
        return [newTopic, ...oldData];
      });
    },
  });
};

export const useUpdateTopic = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateTopicInput> }) =>
      updateTopic(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['topic', id] });
    },
  });
};

export const useDeleteTopic = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteTopic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
};

// ===== СООБЩЕНИЯ =====

export const usePosts = (topicId: string) => {
  return useQuery({
    queryKey: ['posts', topicId],
    queryFn: () => fetchPosts(topicId),
    enabled: !!topicId,
  });
};

export const usePost = (id: string) => {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => fetchPost(id),
    enabled: !!id,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ input, authorId: _authorId }: { input: CreatePostInput; authorId: string }) =>
      createPost(input, _authorId),
    onMutate: async ({ input, authorId: _authorId }) => {
      await queryClient.cancelQueries({ queryKey: ['posts', input.topicId] });
      
      const previousPosts = queryClient.getQueryData(['posts', input.topicId]);
      
      queryClient.setQueryData(['posts', input.topicId], (old: any) => {
        if (!old) return [];
        return old;
      });
      
      return { previousPosts };
    },
    onSuccess: (_, { input }) => {
      queryClient.invalidateQueries({ queryKey: ['posts', input.topicId] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['forumSections'] });
      
      queryClient.refetchQueries({ queryKey: ['posts', input.topicId] });
      
      queryClient.refetchQueries({ queryKey: ['topics'] });
    },
    onError: (error, variables, context) => {
      console.error('Failed to create post:', error);
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts', variables.input.topicId], context.previousPosts);
      }
    },
    onSettled: (_data, _error, { input }) => {
      queryClient.invalidateQueries({ queryKey: ['posts', input.topicId] });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      input, 
      editedBy 
    }: { 
      id: string; 
      input: Partial<CreatePostInput>; 
      editedBy?: string;
    }) => updatePost(id, input, editedBy),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// ===== ПОЛЬЗОВАТЕЛИ =====

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: any) => createUser(userData),
    onSuccess: (_, userData) => {
      if (userData.id) {
        queryClient.invalidateQueries({ queryKey: ['user', userData.id] });
      }
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: any }) =>
      updateUser(id, userData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
  });
};

// ===== СТАТИСТИКА ФОРУМА =====

export const useForumStats = () => {
  return useQuery({
    queryKey: ['forumStats'],
    queryFn: fetchForumStats,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

export const useSectionTopicCount = (sectionId: string) => {
  return useQuery({
    queryKey: ['sectionTopicCount', sectionId],
    queryFn: () => fetchSectionTopicCount(sectionId),
    enabled: !!sectionId,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
};

export const useTopicPostCount = (topicId: string) => {
  return useQuery({
    queryKey: ['topicPostCount', topicId],
    queryFn: () => fetchTopicPostCount(topicId),
    enabled: !!topicId,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
}; 