import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { auth } from '../../services/firebase';
import { useForumSections, useForumStats, useSectionTopicCount } from '../../hooks/useForum';

const Forum: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  
  // Using React Query to load sections and stats
  const { 
    data: sections = [], 
    isLoading: sectionsLoading, 
    error: sectionsError 
  } = useForumSections();

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError
  } = useForumStats();

  useEffect(() => {
    // Subscribe to authentication changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      // Temporarily removing authentication check for testing
      // if (!user) {
      //   navigate('/forum/auth');
      // }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSectionClick = (sectionId: string) => {
    navigate(`/forum/section/${sectionId}`);
  };

  const isLoading = sectionsLoading || statsLoading;
  const error = sectionsError || statsError;

  if (isLoading) {
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

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Forum Loading Error</Alert.Heading>
          <p>
            Failed to load forum data. Please try again later.
          </p>
          <hr />
          <p className="mb-0">
            If the problem persists, contact the administrator.
          </p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>Wasteland Forum</h1>
              <p className="text-muted mb-0">
                Welcome, {user?.displayName || user?.email}!
              </p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Forum Sections */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Forum Sections</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {sections.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No forum sections created yet</p>
                  {user && (
                    <p className="text-muted small">
                      Administrators can create sections in the control panel
                    </p>
                  )}
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {sections.map((section) => (
                    <SectionItem 
                      key={section.id} 
                      section={section} 
                      onClick={handleSectionClick}
                    />
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Statistics */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Forum Statistics</h6>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col>
                  <h4>{stats?.totalTopics || 0}</h4>
                  <small className="text-muted">Topics</small>
                </Col>
                <Col>
                  <h4>{stats?.totalPosts || 0}</h4>
                  <small className="text-muted">Posts</small>
                </Col>
                <Col>
                  <h4>{stats?.totalUsers || 0}</h4>
                  <small className="text-muted">Users</small>
                </Col>
                <Col>
                  <h4>{stats?.topicsToday || 0}</h4>
                  <small className="text-muted">New Today</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

// Компонент для отображения раздела с количеством тем
const SectionItem: React.FC<{
  section: any;
  onClick: (sectionId: string) => void;
}> = ({ section, onClick }) => {
  const { data: topicCount = 0 } = useSectionTopicCount(section.id);

  return (
    <div
      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
      onClick={() => onClick(section.id)}
      style={{ cursor: 'pointer' }}
    >
      <div>
        <h6 className="mb-1">{section.name}</h6>
        <p className="text-muted mb-0 small">
          {section.description}
        </p>
      </div>
      <div className="text-end">
        <Badge bg="secondary" className="me-2">
          {topicCount} {topicCount === 1 ? 'topic' : 'topics'}
        </Badge>
        <i className="fas fa-chevron-right text-muted"></i>
      </div>
    </div>
  );
};

export default Forum; 