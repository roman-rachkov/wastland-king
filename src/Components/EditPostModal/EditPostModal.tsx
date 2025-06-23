import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import RichTextEditor from '../RichTextEditor';
import { PostApi } from '../../types/Forum';

interface EditPostModalProps {
  show: boolean;
  onHide: () => void;
  post: PostApi | null;
  onSave: (content: string) => Promise<void>;
  isPending: boolean;
  error?: string | null;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  show,
  onHide,
  post,
  onSave,
  isPending,
  error
}) => {
  const [content, setContent] = useState('');

  console.log('EditPostModal render:', { 
    show, 
    postId: post?.id, 
    postContentLength: post?.content?.length,
    contentLength: content.length 
  });

  // Reset content when post changes or modal opens
  useEffect(() => {
    if (post && show) {
      console.log('EditPostModal: Setting content for post:', post.id, 'content length:', post.content.length);
      setContent(post.content);
    }
  }, [post?.id, show]); // Only depend on post ID and show state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    console.log('EditPostModal: Submitting content for post:', post?.id);
    
    try {
      await onSave(content);
      onHide();
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleCancel = () => {
    console.log('EditPostModal: Canceling edit');
    onHide();
  };

  if (!post) {
    return null;
  }

  console.log('Rendering RichTextEditor with content length:', content.length);

  return (
    <Modal show={show} onHide={handleCancel} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Post</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Post Content</Form.Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Edit your post content..."
            />
          </Form.Group>

          {error && (
            <Alert variant="danger" className="mb-3">
              Error saving post: {error}
            </Alert>
          )}

          <div className="d-flex gap-2 justify-content-end">
            <Button 
              type="button" 
              variant="outline-secondary"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={isPending || !content.trim()}
            >
              {isPending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditPostModal; 