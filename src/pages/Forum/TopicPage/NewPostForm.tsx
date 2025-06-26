import React from 'react';
import ForumPostForm from '../../../components/forum/ForumPostForm';

interface NewPostFormProps {
  onSubmit: (content: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

const NewPostForm: React.FC<NewPostFormProps> = ({
  onSubmit,
  isLoading = false,
  error = null
}) => {
  return (
    <ForumPostForm
      onSubmit={onSubmit}
      placeholder="Write your new post..."
      submitText="Post"
      isLoading={isLoading}
      error={error}
      className="mt-4"
    />
  );
};

export default NewPostForm; 