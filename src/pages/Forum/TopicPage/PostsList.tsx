import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { PostApi } from '../../../types/Forum';
import PostItem from './PostItem';
import ReplyForm from './ReplyForm';

interface PostsListProps {
  posts: PostApi[];
  startIndex: number;
  replyTo: string | null;
  replyContent: string;
  onReply: (postId: string) => void;
  onReplyContentChange: (content: string) => void;
  onReplySubmit: (e: React.FormEvent) => void;
  onReplyCancel: () => void;
  onEdit: (post: PostApi) => void;
  isPending: boolean;
  formatDate: (date: Date) => string;
}

const PostsList: React.FC<PostsListProps> = ({
  posts,
  startIndex,
  replyTo,
  replyContent,
  onReply,
  onReplyContentChange,
  onReplySubmit,
  onReplyCancel,
  onEdit,
  isPending,
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
                      replyTo={replyTo}
                      replyContent={replyContent}
                      onContentChange={onReplyContentChange}
                      onSubmit={onReplySubmit}
                      onCancel={onReplyCancel}
                      isPending={isPending}
                      title={`Reply to Post #${currentPostNumber}`}
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