import React from 'react';
import ForumPost from '../../../Components/ForumPost';
import { TopicApi } from '../../../types/Forum';

interface TopicContentProps {
  topic: TopicApi;
  onReply: () => void;
  formatDate: (date: Date) => string;
}

const TopicContent: React.FC<TopicContentProps> = ({
  topic,
  onReply,
  formatDate
}) => {
  return (
    <ForumPost
      content={topic.content}
      authorName={topic.authorName || 'Unknown'}
      authorId={topic.authorId}
      createdAt={topic.createdAt}
      formatDate={formatDate}
      showHeader={true}
      headerTitle="Original Post"
      isOriginalPost={true}
      onReply={onReply}
      className="mb-4"
    />
  );
};

export default TopicContent; 