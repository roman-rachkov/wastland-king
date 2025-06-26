import React from 'react';
import { Row, Col, Card, Button, Badge, ButtonGroup } from 'react-bootstrap';
import Post from '../Post';
import { PostApi } from '../../../types/Forum';
import { usePermissions } from '../../../hooks/usePermissions';

interface ForumPostProps {
  // Common props
  content: string;
  authorName: string;
  authorId: string;
  createdAt: Date;
  formatDate: (date: Date) => string;
  className?: string;
  
  // Post-specific props
  postNumber?: number;
  isEdited?: boolean;
  replyTo?: string;
  replyToPost?: PostApi | null;
  
  // Action handlers
  onReply?: (postId: string) => void;
  onEdit?: (post: PostApi) => void;
  
  // Display options
  showHeader?: boolean;
  headerTitle?: string;
  isOriginalPost?: boolean;
}

/**
 * Universal forum post component that can render both regular posts and topic content
 * Handles all post display logic including replies, editing, and permissions
 */
const ForumPost: React.FC<ForumPostProps> = ({
  content,
  authorName,
  authorId,
  createdAt,
  formatDate,
  className = '',
  postNumber,
  isEdited = false,
  replyTo,
  replyToPost,
  onReply,
  onEdit,
  showHeader = false,
  headerTitle = 'Post',
  isOriginalPost = false
}) => {
  const { canEditPost, canModerate } = usePermissions();
  
  const canEditThisPost = canEditPost(authorId);
  const canModerateThisPost = canModerate();
  const canEdit = (canEditThisPost || canModerateThisPost) && onEdit;

  const handleEdit = () => {
    if (!onEdit) return;
    
    // Create a PostApi object from the available data
    const postData: PostApi = {
      id: authorId,
      content,
      authorName,
      authorId,
      createdAt,
      updatedAt: createdAt, // Use createdAt as fallback
      topicId: '', // This will be filled by the parent component
      isActive: true, // Assume active by default
      isEdited: isEdited || false,
      postNumber: postNumber || 0,
      replyTo: replyTo || undefined
    };
    
    onEdit(postData);
  };

  return (
    <Row className={`mb-3 ${className}`}>
      <Col>
        <Card>
          {showHeader && (
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{headerTitle}</h5>
                <small className="text-muted">
                  {formatDate(createdAt)}
                </small>
              </div>
            </Card.Header>
          )}
          
          <Card.Body>
            {/* Reply indicator */}
            {replyTo && replyToPost && (
              <div className="mb-3 p-2 bg-light rounded border-start border-primary border-3">
                <small className="text-muted">
                  <i className="fas fa-reply me-1"></i>
                  Reply to <strong>{replyToPost.authorName || 'Unknown'}</strong> 
                  <Badge bg="secondary" className="ms-2">
                    #{replyToPost.postNumber || '?'}
                  </Badge>
                </small>
              </div>
            )}
            
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
                    <strong>{authorName || 'Unknown'}</strong>
                    <small className="text-muted ms-2">
                      {postNumber ? `#${postNumber} • ` : ''}
                      {formatDate(createdAt)}
                      {isOriginalPost && ' • Original Poster'}
                    </small>
                    {isEdited && (
                      <small className="text-muted ms-2">
                        (edited)
                      </small>
                    )}
                  </div>
                  <ButtonGroup size="sm">
                    {onReply && (
                      <Button 
                        variant="outline-primary"
                        onClick={() => onReply(isOriginalPost ? 'topic' : authorId)}
                      >
                        Reply
                      </Button>
                    )}
                    {canEdit && (
                      <Button 
                        variant="outline-secondary"
                        onClick={handleEdit}
                      >
                        Edit
                      </Button>
                    )}
                  </ButtonGroup>
                </div>
                <Post 
                  content={content}
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

export default ForumPost; 