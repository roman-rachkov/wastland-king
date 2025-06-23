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
      console.log('Topic created successfully, invalidating cache for section:', input.sectionId);
      
      // Invalidate and refetch topics for this section
      queryClient.invalidateQueries({ queryKey: ['topics', input.sectionId] });
      
      // Also invalidate forum sections to update topic count
      queryClient.invalidateQueries({ queryKey: ['forumSections'] });
      
      // Optimistically update the cache
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
    mutationFn: ({ input, authorId }: { input: CreatePostInput; authorId: string }) =>
      createPost(input, authorId),
    onMutate: async ({ input, authorId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts', input.topicId] });
      
      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(['posts', input.topicId]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['posts', input.topicId], (old: any) => {
        if (!old) return [];
        return old;
      });
      
      // Return a context object with the snapshotted value
      return { previousPosts };
    },
    onSuccess: (newPost, { input }) => {
      console.log('Post created successfully, invalidating cache for topic:', input.topicId);
      console.log('New post data:', newPost);
      
      // Aggressively invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['posts', input.topicId] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['forumSections'] });
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ['posts', input.topicId] });
      
      // Also refetch topics to update lastPostAt
      queryClient.refetchQueries({ queryKey: ['topics'] });
    },
    onError: (error, variables, context) => {
      console.error('Error creating post:', error);
      console.error('Post data that failed:', variables);
      
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts', variables.input.topicId], context.previousPosts);
      }
    },
    onSettled: (data, error, { input }) => {
      // Always refetch after error or success
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