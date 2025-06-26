import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { PostApi } from '../../../types/Forum';
import PostItem from './PostItem';
import ReplyForm from './ReplyForm';

interface PostsListProps {
  posts: PostApi[];
  startIndex: number;
  replyTo: string | null;
  onReply: (postId: string) => void;
  onReplySubmit: (content: string) => Promise<void>;
  onReplyCancel: () => void;
  onEdit: (post: PostApi) => void;
  isLoading: boolean;
  error?: string | null;
  formatDate: (date: Date) => string;
}

const PostsList: React.FC<PostsListProps> = ({
  posts,
  startIndex,
  replyTo,
  onReply,
  onReplySubmit,
  onReplyCancel,
  onEdit,
  isLoading,
  error,
  formatDate
}) => {
  return (
    <>
      {posts.map((post: PostApi, index: number) => {
        const currentPostNumber = startIndex + index + 1;
        const postWithNumber = { ...post, postNumber: currentPostNumber };
        
        // Find the post this is replying to
        const replyToPost = post.replyTo ? posts.find(p => p.id === post.replyTo) : null;
        const replyToPostNumber = replyToPost ? posts.findIndex(p => p.id === post.replyTo) + startIndex + 1 : undefined;
        const replyToPostWithNumber = replyToPost ? { ...replyToPost, postNumber: replyToPostNumber } : null;
        
        return (
          <div key={post.id}>
            <PostItem
              post={postWithNumber}
              postNumber={currentPostNumber}
              onReply={onReply}
              onEdit={onEdit}
              formatDate={formatDate}
              replyToPost={replyToPostWithNumber}
            />
            
            {/* Reply Form */}
            {replyTo === post.id && (
              <Row className="mb-3">
                <Col>
                  <div className="ms-5">
                    <ReplyForm
                      onSubmit={onReplySubmit}
                      onCancel={onReplyCancel}
                      isLoading={isLoading}
                      error={error}
                    />
                  </div>
                </Col>
              </Row>
            )}
          </div>
        );
      })}
    </>
  );
};

export default PostsList; 