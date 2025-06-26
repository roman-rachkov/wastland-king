import React from 'react';
import { Card } from 'react-bootstrap';
import ForumPostForm from '../../../components/forum/ForumPostForm';

interface ReplyFormProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  error = null
}) => {
  return (
    <Card className="mb-3">
      <Card.Header>
        <h6 className="mb-0">Reply</h6>
      </Card.Header>
      <Card.Body>
        <ForumPostForm
          onSubmit={onSubmit}
          onCancel={onCancel}
          placeholder="Write your reply..."
          submitText="Reply"
          cancelText="Cancel"
          isLoading={isLoading}
          error={error}
        />
      </Card.Body>
    </Card>
  );
};

export default ReplyForm; 