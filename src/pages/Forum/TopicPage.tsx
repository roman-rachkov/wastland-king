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
import EditPostModal from '../../components/forum/EditPostModal';
import { PostApi } from '../../types/Forum';

const POSTS_PER_PAGE = 10;

const TopicPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [replyTo, setReplyTo] = useState<string | null>(null);
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
    isLoading: postsLoading
  } = usePosts(topicId || '');

  const queryClient = useQueryClient();
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();

  // Handle successful post creation
  useEffect(() => {
    if (createPostMutation.isSuccess) {
      // Clear input fields
      setReplyTo(null);
      
      // Force refetch posts to ensure we have the latest data
      const refetchPosts = async () => {
        try {
          await queryClient.refetchQueries({ queryKey: ['posts', topicId || ''] });
        } catch (error) {
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
      // Force refetch posts to ensure we have the latest data
      const refetchPosts = async () => {
        try {
          await queryClient.refetchQueries({ queryKey: ['posts', topicId || ''] });
        } catch (error) {
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
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleEdit = (post: PostApi) => {
    setEditingPost(post); // Use the post directly
    setShowEditModal(true);
  };

  const handleSaveEdit = async (content: string) => {
    if (!editingPost) {
      return;
    }
    
    try {
      await updatePostMutation.mutateAsync({
        id: editingPost.id,
        input: { content },
        editedBy: user?.uid
      });
      
      setShowEditModal(false);
      setEditingPost(null);
    } catch (error) {
    }
  };

  const handleSubmitReply = async (content: string) => {
    if (!user || !topicId || !replyTo || !content.trim()) return;

    try {
      await createPostMutation.mutateAsync({
        input: {
          content: content,
          topicId: topicId,
          replyTo: replyTo === 'topic' ? undefined : replyTo
        },
        authorId: user.uid
      });
      
    } catch (error) {
    }
  };

  const handleSubmitNewPost = async (content: string) => {
    if (!user || !topicId || !content.trim()) return;

    try {
      await createPostMutation.mutateAsync({
        input: {
          content: content,
          topicId: topicId
        },
        authorId: user.uid
      });
      
      // Wait for cache to update, then go to last page
      setTimeout(() => {
        const newTotalPages = Math.ceil((posts.length + 1) / POSTS_PER_PAGE);
        setCurrentPage(newTotalPages);
      }, 500);
    } catch (error) {
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
      {replyTo === 'topic' && (
        <ReplyForm
          onSubmit={handleSubmitReply}
          onCancel={handleCancelReply}
          isLoading={createPostMutation.isPending}
          error={createPostMutation.error?.message}
        />
      )}

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
          onReply={handleReply}
          onReplySubmit={handleSubmitReply}
          onReplyCancel={handleCancelReply}
          onEdit={handleEdit}
          isLoading={createPostMutation.isPending}
          error={createPostMutation.error?.message}
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
      {!topic.isLocked && (
        <NewPostForm
          onSubmit={handleSubmitNewPost}
          isLoading={createPostMutation.isPending}
          error={createPostMutation.error?.message}
        />
      )}

      {/* Topic Locked Message */}
      {topic.isLocked && (
        <Row className="mb-4">
          <Col>
            <Alert variant="warning">
              <Alert.Heading>Topic Locked</Alert.Heading>
              <p>
                This topic is locked. New posts are not allowed.
              </p>
            </Alert>
          </Col>
        </Row>
      )}

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
