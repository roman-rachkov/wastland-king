import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useQueryClient } from '@tanstack/react-query';
import { auth } from '../../services/firebase';
import { useTopic, usePosts, useCreatePost, useUpdatePost } from '../../hooks/useForum';
import { useImageZoom } from '../../hooks/useImageZoom';
import {
  TopicHeader,
  TopicContent,
  PostsList,
  ReplyForm,
  Pagination,
  NewPostForm
} from './TopicPage/index';
import EditPostModal from '../../Components/EditPostModal';
import { PostApi } from '../../types/Forum';

const POSTS_PER_PAGE = 10;

const TopicPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [editingPost, setEditingPost] = useState<PostApi | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Enable image zoom functionality
  useImageZoom();

  // Load topic and posts data
  const { 
    data: topic, 
    isLoading: topicLoading, 
    error: topicError 
  } = useTopic(topicId || '');

  const { 
    data: posts = [], 
    isLoading: postsLoading, 
    error: postsError 
  } = usePosts(topicId || '');

  const queryClient = useQueryClient();
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();

  // Handle successful post creation
  useEffect(() => {
    if (createPostMutation.isSuccess) {
      console.log('Post creation successful, updating UI...');
      
      // Clear input fields
      setNewPostContent('');
      setReplyContent('');
      setReplyTo(null);
      
      // Force refetch posts to ensure we have the latest data
      const refetchPosts = async () => {
        try {
          await queryClient.refetchQueries({ queryKey: ['posts', topicId || ''] });
          console.log('Posts refetched successfully');
        } catch (error) {
          console.error('Error refetching posts:', error);
        }
      };
      
      refetchPosts();
      
      // Reset mutation state after a delay
      setTimeout(() => {
        createPostMutation.reset();
      }, 1000);
    }
  }, [createPostMutation.isSuccess, topicId, queryClient, createPostMutation]);

  // Handle successful post update
  useEffect(() => {
    if (updatePostMutation.isSuccess) {
      console.log('Post update successful, updating UI...');
      
      // Force refetch posts to ensure we have the latest data
      const refetchPosts = async () => {
        try {
          await queryClient.refetchQueries({ queryKey: ['posts', topicId || ''] });
          console.log('Posts refetched after update');
        } catch (error) {
          console.error('Error refetching posts after update:', error);
        }
      };
      
      refetchPosts();
      
      // Reset mutation state after a delay
      setTimeout(() => {
        updatePostMutation.reset();
      }, 1000);
    }
  }, [updatePostMutation.isSuccess, topicId, queryClient, updatePostMutation]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (!user) {
        navigate('/forum/auth');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Calculate pagination
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, endIndex);

  const handleReply = (postId: string) => {
    setReplyTo(postId);
    setReplyContent('');
  };

  const handleCancelReply = () => {
    setReplyTo(null);
    setReplyContent('');
  };

  const handleEdit = (post: PostApi) => {
    console.log('Editing post:', post.id);
    setEditingPost(post); // Use the post directly
    setShowEditModal(true);
  };

  const handleSaveEdit = async (content: string) => {
    if (!editingPost) {
      console.error('No editing post found');
      return;
    }
    
    console.log('Saving edit for post:', editingPost.id);
    
    try {
      await updatePostMutation.mutateAsync({
        id: editingPost.id,
        input: { content },
        editedBy: user?.uid
      });
      
      console.log('Post updated successfully');
      setShowEditModal(false);
      setEditingPost(null);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !topicId || !replyTo || !replyContent.trim()) return;

    try {
      console.log('Creating reply...');
      await createPostMutation.mutateAsync({
        input: {
          content: replyContent,
          topicId: topicId,
          replyTo: replyTo === 'topic' ? undefined : replyTo
        },
        authorId: user.uid
      });
      
      console.log('Reply created successfully');
      // Fields will be cleared in useEffect when mutation succeeds
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  const handleSubmitNewPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !topicId || !newPostContent.trim()) return;

    try {
      console.log('Creating new post...');
      await createPostMutation.mutateAsync({
        input: {
          content: newPostContent,
          topicId: topicId
        },
        authorId: user.uid
      });
      
      console.log('New post created successfully');
      // Fields will be cleared in useEffect when mutation succeeds
      
      // Wait for cache to update, then go to last page
      setTimeout(() => {
        const newTotalPages = Math.ceil((posts.length + 1) / POSTS_PER_PAGE);
        console.log('Navigating to page:', newTotalPages);
        setCurrentPage(newTotalPages);
      }, 500);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (topicLoading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (topicError || !topic) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Loading Error</Alert.Heading>
          <p>
            Failed to load topic data. Please try again later.
          </p>
          <hr />
          <button 
            className="btn btn-outline-danger"
            onClick={() => navigate('/forum')}
          >
            Back to Forum
          </button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <TopicHeader
        topic={topic}
        onBackClick={() => navigate(`/forum/section/${topic.sectionId}`)}
        formatDate={formatDate}
      />

      {/* Topic Content */}
      <TopicContent
        topic={topic}
        onReply={() => handleReply('topic')}
        formatDate={formatDate}
      />

      {/* Reply to Topic */}
      <ReplyForm
        replyTo={replyTo === 'topic' ? 'topic' : ''}
        replyContent={replyContent}
        onContentChange={setReplyContent}
        onSubmit={handleSubmitReply}
        onCancel={handleCancelReply}
        isPending={createPostMutation.isPending}
        title="Reply to Topic"
      />

      {/* Posts */}
      {postsLoading ? (
        <Row className="mb-4">
          <Col>
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading posts...</span>
              </div>
            </div>
          </Col>
        </Row>
      ) : (
        <PostsList
          posts={currentPosts}
          startIndex={startIndex}
          replyTo={replyTo}
          replyContent={replyContent}
          onReply={handleReply}
          onReplyContentChange={setReplyContent}
          onReplySubmit={handleSubmitReply}
          onReplyCancel={handleCancelReply}
          onEdit={handleEdit}
          isPending={createPostMutation.isPending}
          formatDate={formatDate}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* New Post Form */}
      <NewPostForm
        content={newPostContent}
        onContentChange={setNewPostContent}
        onSubmit={handleSubmitNewPost}
        isPending={createPostMutation.isPending}
        error={createPostMutation.error?.message}
        isLocked={topic.isLocked}
      />

      {/* Edit Post Modal */}
      <EditPostModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setEditingPost(null);
        }}
        post={editingPost}
        onSave={handleSaveEdit}
        isPending={updatePostMutation.isPending}
        error={updatePostMutation.error?.message}
      />
    </Container>
  );
};

export default TopicPage;
