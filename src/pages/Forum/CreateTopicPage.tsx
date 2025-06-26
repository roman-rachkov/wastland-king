import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { auth } from '../../services/firebase';
import { useForumSection, useCreateTopic } from '../../hooks/useForum';
import { CreateTopicInput } from '../../types/Forum';
import RichTextEditor from '../../Components/RichTextEditor';

const CreateTopicPage: React.FC = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<CreateTopicInput>({
    title: '',
    content: '',
    sectionId: sectionId || '',
  });

  // Load section data
  const { 
    data: section, 
    isLoading: sectionLoading, 
    error: sectionError 
  } = useForumSection(sectionId || '');

  const createTopicMutation = useCreateTopic();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (!user) {
        navigate('/forum/auth');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleContentChange = useCallback((content: string) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !sectionId) return;

    console.log('Creating topic with data:', { formData, authorId: user.uid });

    try {
      await createTopicMutation.mutateAsync({
        input: formData,
        authorId: user.uid
      });
      
      console.log('Topic created successfully');
      
      // Small delay to ensure cache is updated
      setTimeout(() => {
        navigate(`/forum/section/${sectionId}`);
      }, 500);
    } catch (error) {
      console.error('Error creating topic:', error);
    }
  }, [user, sectionId, formData, createTopicMutation, navigate]);

  const handleCancel = useCallback(() => {
    navigate(`/forum/section/${sectionId}`);
  }, [navigate, sectionId]);

  if (sectionLoading) {
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

  if (sectionError || !section) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Loading Error</Alert.Heading>
          <p>
            Failed to load section data. Please try again later.
          </p>
          <hr />
          <Button variant="outline-danger" onClick={handleCancel}>
            Back to Section
          </Button>
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
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={handleCancel}
                className="mb-2"
              >
                ← Back to Section
              </Button>
              <h1>Create New Topic</h1>
              <p className="text-muted mb-0">
                Section: {section.name}
              </p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Topic Creation Form */}
      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">New Topic</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Topic Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter topic title"
                    required
                    maxLength={200}
                  />
                  <Form.Text className="text-muted">
                    Maximum 200 characters
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Content *</Form.Label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={handleContentChange}
                    placeholder="Enter topic content..."
                  />
                  <Form.Text className="text-muted">
                    You can use rich text formatting and upload images
                  </Form.Text>
                </Form.Group>

                {createTopicMutation.error && (
                  <Alert variant="danger" className="mb-3">
                    Error creating topic: {createTopicMutation.error.message}
                  </Alert>
                )}

                <div className="d-flex gap-2">
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={createTopicMutation.isPending}
                  >
                    {createTopicMutation.isPending ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating...
                      </>
                    ) : (
                      'Create Topic'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline-secondary"
                    onClick={handleCancel}
                    disabled={createTopicMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar with rules */}
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Topic Creation Rules</h6>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Title should be informative
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Content should match section theme
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Avoid duplicating existing topics
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Follow forum rules
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  You can upload images and use formatting
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateTopicPage; 