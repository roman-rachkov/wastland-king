import React from 'react';
import { Row, Col, Card, Button, Badge, ButtonGroup } from 'react-bootstrap';
import { PostApi } from '../../../types/Forum';
import SpoilerImage from '../../../Components/SpoilerImage';
import ForumImageProcessor from '../../../Components/ForumImageProcessor';
import { usePermissions } from '../../../hooks/usePermissions';
import { useSpoilerHandler } from '../../../hooks/useSpoilerHandler';

interface PostItemProps {
  post: PostApi;
  postNumber: number;
  onReply: (postId: string) => void;
  onEdit: (post: PostApi) => void;
  formatDate: (date: Date) => string;
  replyToPost?: PostApi | null;
}

const PostItem: React.FC<PostItemProps> = ({ 
  post, 
  postNumber, 
  onReply, 
  onEdit,
  formatDate,
  replyToPost
}) => {
  const { canEditPost, canModerate } = usePermissions();
  useSpoilerHandler(); // Handle spoiler clicks
  
  const canEditThisPost = canEditPost(post.authorId);
  const canModerateThisPost = canModerate();

  return (
    <Row className="mb-3">
      <Col>
        <Card>
          <Card.Body>
            {/* Reply indicator */}
            {post.replyTo && replyToPost && (
              <div className="mb-3 p-2 bg-light rounded border-start border-primary border-3">
                <small className="text-muted">
                  <i className="fas fa-reply me-1"></i>
                  Reply to <strong>{replyToPost.authorName || 'Unknown'}</strong> 
                  <Badge bg="secondary" className="ms-2">#{replyToPost.postNumber || '?'}</Badge>
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
                    <strong>{post.authorName || 'Unknown'}</strong>
                    <small className="text-muted ms-2">
                      #{postNumber} • {formatDate(post.createdAt)}
                    </small>
                    {post.isEdited && (
                      <small className="text-muted ms-2">
                        (edited)
                      </small>
                    )}
                  </div>
                  <ButtonGroup size="sm">
                    <Button 
                      variant="outline-primary"
                      onClick={() => onReply(post.id)}
                    >
                      Reply
                    </Button>
                    {(canEditThisPost || canModerateThisPost) && (
                      <Button 
                        variant="outline-secondary"
                        onClick={() => onEdit(post)}
                      >
                        Edit
                      </Button>
                    )}
                  </ButtonGroup>
                </div>
                <ForumImageProcessor 
                  content={post.content}
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

export default PostItem; 