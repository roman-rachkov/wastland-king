import React from 'react';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import RichTextEditor from '../../../Components/RichTextEditor';

interface NewPostFormProps {
  content: string;
  onContentChange: (content: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  error?: string | null;
  isLocked: boolean;
}

const NewPostForm: React.FC<NewPostFormProps> = ({
  content,
  onContentChange,
  onSubmit,
  isPending,
  error,
  isLocked
}) => {
  if (isLocked) {
    return (
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
    );
  }

  return (
    <Row className="mb-4">
      <Col>
        <Card>
          <Card.Header>
            <h5 className="mb-0">New Post</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={onSubmit}>
              <Form.Group className="mb-3">
                <RichTextEditor
                  value={content}
                  onChange={onContentChange}
                  placeholder="Write your post..."
                />
              </Form.Group>
              {error && (
                <Alert variant="danger" className="mb-3">
                  Error creating post: {error}
                </Alert>
              )}
              <div className="d-flex gap-2">
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Posting...
                    </>
                  ) : (
                    'Post Message'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default NewPostForm; 