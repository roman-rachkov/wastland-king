import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert } from 'react-bootstrap';
import { useForumSections, useCreateForumSection, useUpdateForumSection, useDeleteForumSection } from '../../../hooks/useForum';
import { CreateSectionInput } from '../../../types/Forum';

const ForumManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [formData, setFormData] = useState<CreateSectionInput>({
    name: '',
    description: '',
    order: 0,
    readPermissions: [],
    writePermissions: []
  });

  // Hooks for working with sections
  const { data: sections = [], isLoading, error } = useForumSections();
  const createSectionMutation = useCreateForumSection();
  const updateSectionMutation = useUpdateForumSection();
  const deleteSectionMutation = useDeleteForumSection();

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSectionMutation.mutateAsync(formData);
      setShowCreateModal(false);
      setFormData({ name: '', description: '', order: 0, readPermissions: [], writePermissions: [] });
    } catch (error) {
      console.error('Error creating section:', error);
    }
  };

  const handleEditSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;
    
    try {
      await updateSectionMutation.mutateAsync({
        id: editingSection.id,
        input: formData
      });
      setShowEditModal(false);
      setEditingSection(null);
      setFormData({ name: '', description: '', order: 0, readPermissions: [], writePermissions: [] });
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    
    try {
      await deleteSectionMutation.mutateAsync(sectionId);
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  const openEditModal = (section: any) => {
    setFormData({
      name: section.name,
      description: section.description || '',
      order: section.order,
      readPermissions: section.readPermissions || [],
      writePermissions: section.writePermissions || []
    });
    setShowEditModal(true);
  };

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

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>Forum Management</h1>
              <p className="text-muted mb-0">Create and manage forum sections</p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowCreateModal(true)}
            >
              <i className="fas fa-plus me-2"></i>
              Create Section
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Loading Error</Alert.Heading>
          <p>Failed to load forum sections: {error.message}</p>
        </Alert>
      )}

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
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Create First Section
                  </Button>
                </div>
              ) : (
                <Table striped bordered hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map((section) => (
                      <tr key={section.id}>
                        <td>{section.order}</td>
                        <td>{section.name}</td>
                        <td>{section.description || '-'}</td>
                        <td>
                          <span className={`badge ${section.isActive ? 'bg-success' : 'bg-secondary'}`}>
                            {section.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => openEditModal(section)}
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDeleteSection(section.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create Section Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Forum Section</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateSection}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Section Name *</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter section name"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter section description"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Order</Form.Label>
              <Form.Control
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={createSectionMutation.isPending}
            >
              {createSectionMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Section Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Section</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSection}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Section Name *</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter section name"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter section description"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Order</Form.Label>
              <Form.Control
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={updateSectionMutation.isPending}
            >
              {updateSectionMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ForumManagement; 