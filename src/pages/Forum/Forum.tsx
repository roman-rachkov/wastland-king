import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { auth } from '../../services/firebase';
import { ForumSection } from '../../types/Forum';

const Forum: React.FC = () => {
  const [sections, setSections] = useState<ForumSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Подписываемся на изменения авторизации
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      // Временно убираем проверку авторизации для тестирования
      // if (!user) {
      //   navigate('/forum/auth');
      // }
    });

    // TODO: Загрузить разделы форума
    loadSections();

    return () => unsubscribe();
  }, [navigate]);

  const loadSections = async () => {
    try {
      setLoading(true);
      // TODO: Загрузить разделы через GraphQL
      // const sectionsData = await fetchForumSections();
      // setSections(sectionsData);
      
      // Временные данные для демонстрации
      setSections([
        {
          id: '1',
          name: 'Общие обсуждения',
          description: 'Общие темы и обсуждения',
          order: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          readPermissions: [],
          writePermissions: []
        },
        {
          id: '2',
          name: 'Техническая поддержка',
          description: 'Вопросы по игре и технические проблемы',
          order: 2,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          readPermissions: [],
          writePermissions: []
        }
      ]);
    } catch (error) {
      console.error('Error loading sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionClick = (sectionId: string) => {
    navigate(`/forum/section/${sectionId}`);
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Заголовок */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>Форум Wasteland</h1>
              <p className="text-muted mb-0">
                Добро пожаловать, {user?.displayName || user?.email}!
              </p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Разделы форума */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Разделы форума</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {sections.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">Разделы форума пока не созданы</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      onClick={() => handleSectionClick(section.id)}
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
                          {/* TODO: Показать количество тем */}
                          0 тем
                        </Badge>
                        <i className="fas fa-chevron-right text-muted"></i>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Статистика */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Статистика форума</h6>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col>
                  <h4>0</h4>
                  <small className="text-muted">Тем</small>
                </Col>
                <Col>
                  <h4>0</h4>
                  <small className="text-muted">Сообщений</small>
                </Col>
                <Col>
                  <h4>0</h4>
                  <small className="text-muted">Пользователей</small>
                </Col>
                <Col>
                  <h4>0</h4>
                  <small className="text-muted">Новых сегодня</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Forum; 