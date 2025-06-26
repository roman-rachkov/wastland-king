import React from 'react';
import ForumPost from '../../../Components/ForumPost';
import { PostApi } from '../../../types/Forum';

interface PostItemProps {
  post: PostApi;
  postNumber: number;
  onReply: (postId: string) => void;
  onEdit: (post: PostApi) => void;
  formatDate: (date: Date) => string;
  replyToPost?: PostApi | null;
}

const PostItem: React.FC<PostItemProps> = ({ 
  post, 
  postNumber, 
  onReply, 
  onEdit,
  formatDate,
  replyToPost
}) => {
  return (
    <ForumPost
      content={post.content}
      authorName={post.authorName || 'Unknown'}
      authorId={post.authorId}
      createdAt={post.createdAt}
      formatDate={formatDate}
      postNumber={postNumber}
      isEdited={post.isEdited}
      replyTo={post.replyTo}
      replyToPost={replyToPost}
      onReply={onReply}
      onEdit={onEdit}
    />
  );
};

export default PostItem; 