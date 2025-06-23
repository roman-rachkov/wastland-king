import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { auth } from '../../services/firebase';
import { useForumSection, useTopics } from '../../hooks/useForum';
import { DateTime } from 'luxon';

const SectionPage: React.FC = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  // Load section and topics data
  const { 
    data: section, 
    isLoading: sectionLoading, 
    error: sectionError 
  } = useForumSection(sectionId || '');

  const { 
    data: topics = [], 
    isLoading: topicsLoading, 
    error: topicsError 
  } = useTopics(sectionId || '');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleTopicClick = (topicId: string) => {
    navigate(`/forum/topic/${topicId}`);
  };

  const handleCreateTopic = () => {
    if (!user) {
      navigate('/forum/auth');
      return;
    }
    navigate(`/forum/section/${sectionId}/create-topic`);
  };

  const handleBackToForum = () => {
    navigate('/forum');
  };

  const formatDate = (date: Date) => {
    return DateTime.fromJSDate(date).setLocale('en').toRelative();
  };

  if (sectionLoading || topicsLoading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (sectionError || topicsError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Loading Error</Alert.Heading>
          <p>
            Failed to load section data. Please try again later.
          </p>
          <hr />
          <Button variant="outline-danger" onClick={handleBackToForum}>
            Back to Forum
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!section) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>Section Not Found</Alert.Heading>
          <p>
            The requested section does not exist or has been deleted.
          </p>
          <hr />
          <Button variant="outline-warning" onClick={handleBackToForum}>
            Back to Forum
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Section Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={handleBackToForum}
                className="mb-2"
              >
                ← Back to Forum
              </Button>
              <h1>{section.name}</h1>
              <p className="text-muted mb-0">{section.description}</p>
            </div>
            {user && (
              <Button 
                variant="primary" 
                onClick={handleCreateTopic}
              >
                <i className="fas fa-plus me-2"></i>
                Create Topic
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {/* Topics */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Topics</h5>
                <span className="text-muted small">
                  {topics.length} topics
                </span>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {topics.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No topics in this section yet</p>
                  {user && (
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={handleCreateTopic}
                    >
                      Create First Topic
                    </Button>
                  )}
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleTopicClick(topic.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-1">
                            {topic.isSticky && (
                              <Badge bg="warning" className="me-2">
                                <i className="fas fa-thumbtack"></i>
                              </Badge>
                            )}
                            {topic.isLocked && (
                              <Badge bg="danger" className="me-2">
                                <i className="fas fa-lock"></i>
                              </Badge>
                            )}
                            <h6 className="mb-0">{topic.title}</h6>
                          </div>
                          <p className="text-muted mb-1 small">
                            Author: {topic.authorName || 'Unknown'} • 
                            Created: {formatDate(topic.createdAt)}
                          </p>
                          {topic.lastPostAt && (
                            <p className="text-muted mb-0 small">
                              Last post: {formatDate(topic.lastPostAt)}
                            </p>
                          )}
                        </div>
                        <div className="text-end">
                          <Badge bg="secondary" className="me-2">
                            {topic.views} views
                          </Badge>
                          <Badge bg="info">
                            {/* TODO: Show post count */}
                            0 posts
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SectionPage; 