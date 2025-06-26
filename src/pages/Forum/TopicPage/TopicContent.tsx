import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import Post from '../../../Components/Post';
import { TopicApi } from '../../../types/Forum';
import { formatDate } from '../../../utils/configCheck';

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
    <Row className="mb-4">
      <Col>
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Original Post</h5>
              <small className="text-muted">
                {formatDate(topic.createdAt)}
              </small>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="d-flex gap-3">
              <div className="flex-shrink-0">
                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" 
                     style={{ width: '50px', height: '50px' }}>
                  <i className="fas fa-user"></i>
                </div>
              </div>
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <strong>{topic.authorName || 'Unknown'}</strong>
                    <small className="text-muted ms-2">Original Poster</small>
                  </div>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={onReply}
                  >
                    Reply
                  </Button>
                </div>
                <Post 
                  content={topic.content}
                  className="forum-post-content"
                />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default TopicContent; 