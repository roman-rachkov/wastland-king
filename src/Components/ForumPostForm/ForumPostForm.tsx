import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import RichTextEditor from '../RichTextEditor/RichTextEditor';

interface ForumPostFormProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  submitText?: string;
  cancelText?: string;
  initialContent?: string;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

/**
 * Universal forum post form component for creating new posts and replies
 * Handles rich text editing, form submission, and error display
 */
const ForumPostForm: React.FC<ForumPostFormProps> = ({
  onSubmit,
  onCancel,
  placeholder = 'Write your post...',
  submitText = 'Submit',
  cancelText = 'Cancel',
  initialContent = '',
  isLoading = false,
  error = null,
  className = ''
}) => {
  const [content, setContent] = useState(initialContent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    try {
      await onSubmit(content);
      setContent(''); // Clear form on success
    } catch (error) {
      // Error handling is done by parent component
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setContent('');
    }
  };

  return (
    <div className={`forum-post-form ${className}`}>
      <Form onSubmit={handleSubmit}>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        
        <div className="mb-3">
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder={placeholder}
          />
        </div>
        
        <div className="d-flex gap-2 justify-content-end">
          {onCancel && (
            <Button 
              variant="outline-secondary" 
              onClick={handleCancel}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
          )}
          <Button 
            type="submit" 
            variant="primary"
            disabled={isLoading || !content.trim()}
          >
            {isLoading ? 'Submitting...' : submitText}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ForumPostForm; 