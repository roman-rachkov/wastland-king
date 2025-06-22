import { useEffect, useState } from 'react';
import { Button, Card, Table, Form, Alert, Modal } from 'react-bootstrap';
import { getAllowedAdmins } from '../../../services/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';

const AdminUsers = () => {
  const [admins, setAdmins] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const adminList = await getAllowedAdmins();
      setAdmins(adminList);
    } catch (error) {
      console.error('Error loading admins:', error);
      setError('Failed to load admin list');
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setError(null);
      await setDoc(doc(db, 'admins', newEmail.toLowerCase()), {
        email: newEmail.toLowerCase(),
        addedAt: new Date(),
        addedBy: 'admin' // You can get current user email here
      });
      
      setSuccess(`Admin ${newEmail} added successfully`);
      setNewEmail('');
      setShowModal(false);
      loadAdmins();
    } catch (error) {
      console.error('Error adding admin:', error);
      setError('Failed to add admin');
    }
  };

  const removeAdmin = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from admin access?`)) {
      return;
    }

    try {
      setError(null);
      await deleteDoc(doc(db, 'admins', email));
      
      setSuccess(`Admin ${email} removed successfully`);
      loadAdmins();
    } catch (error) {
      console.error('Error removing admin:', error);
      setError('Failed to remove admin');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h2>Admin Users Management</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Add Admin
        </Button>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
            {success}
          </Alert>
        )}

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center">No admin users found</td>
              </tr>
            ) : (
              admins.map((email) => (
                <tr key={email}>
                  <td>{email}</td>
                  <td>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => removeAdmin(email)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card.Body>

      {/* Add Admin Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Admin User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <Form.Text className="text-muted">
                Enter the email address of the user you want to grant admin access to.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={addAdmin}>
            Add Admin
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default AdminUsers; 