import React from 'react';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import RichTextEditor from '../../../Components/RichTextEditor';

interface ReplyFormProps {
  replyTo: string;
  replyContent: string;
  onContentChange: (content: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
  title: string;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  replyTo,
  replyContent,
  onContentChange,
  onSubmit,
  onCancel,
  isPending,
  title
}) => {
  if (!replyTo) return null;

  return (
    <Row className="mb-4">
      <Col>
        <Card>
          <Card.Header>
            <h6 className="mb-0">{title}</h6>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={onSubmit}>
              <Form.Group className="mb-3">
                <RichTextEditor
                  value={replyContent}
                  onChange={onContentChange}
                  placeholder="Write your reply..."
                />
              </Form.Group>
              <div className="d-flex gap-2">
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={isPending}
                >
                  {isPending ? 'Posting...' : 'Post Reply'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline-secondary"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ReplyForm; 