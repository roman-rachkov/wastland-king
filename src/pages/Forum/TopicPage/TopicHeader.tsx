import React from 'react';
import { Row, Col, Button, Badge } from 'react-bootstrap';
import { TopicApi } from '../../../types/Forum';

interface TopicHeaderProps {
  topic: TopicApi;
  onBackClick: () => void;
  formatDate: (date: Date) => string;
}

const TopicHeader: React.FC<TopicHeaderProps> = ({
  topic,
  onBackClick,
  formatDate
}) => {
  return (
    <Row className="mb-4">
      <Col>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={onBackClick}
              className="mb-2"
            >
              ← Back to Section
            </Button>
            <h1>{topic.title}</h1>
            <div className="d-flex align-items-center gap-3 text-muted">
              <span>Author: {topic.authorName || 'Unknown'}</span>
              <span>Created: {formatDate(topic.createdAt)}</span>
              <span>Views: {topic.views}</span>
              {topic.isSticky && <Badge bg="warning">Sticky</Badge>}
              {topic.isLocked && <Badge bg="danger">Locked</Badge>}
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default TopicHeader; 