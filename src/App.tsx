import {Container, Row} from "react-bootstrap";
import { HeaderBanner, PublicNavbar, AdminLayout, PublicLayout, ProtectedRoute, GoogleTranslate } from "./components";
import RegistrationForm from "./pages/RegistrationForm";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {BrowserRouter, Route, Routes} from "react-router";
import AdminMain from "./pages/admin/Main";
import ThanksPage from "./pages/ThanksPage";
import SchedulePage from "./pages/Schedule";
import Settings from "./pages/admin/Settings";
import OrganizePlayers from "./pages/admin/OrganizePlayers";
import PlayersList from "./pages/PlayersList";
import Login from "./pages/admin/Login";
import AdminUsers from "./pages/admin/Settings/AdminUsers";
import ForumAuth from "./pages/ForumAuth";
import Forum from "./pages/Forum";
import SectionPage from "./pages/Forum/SectionPage";
import CreateTopicPage from "./pages/Forum/CreateTopicPage";
import TopicPage from "./pages/Forum/TopicPage";
import ForumManagement from "./pages/admin/ForumManagement";
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ScheduleStoreProvider } from './store/ScheduleStore';

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container className="py-5">
          <div className="text-center">
            <h2>Something went wrong</h2>
            <p className="text-muted">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
            >
              Reload Page
            </button>
          </div>
        </Container>
      );
    }

    return this.props.children;
  }
}

// Global error handler
const handleGlobalError = (event: ErrorEvent) => {
  console.error('Global error:', event.error);
  
  // Prevent default error handling for DOM errors
  if (event.error?.message?.includes('removeChild')) {
    event.preventDefault();
    console.warn('DOM manipulation error prevented:', event.error);
  }
};

const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error('Unhandled promise rejection:', event.reason);
};

function App() {
  // Add global error handlers
  React.useEffect(() => {
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ScheduleStoreProvider>
      <ErrorBoundary>
        <Container className={'position-relative min-vh-100 h-100 d-flex flex-column'}>
          <HeaderBanner/>
          <BrowserRouter>
            <Routes>
              <Route path={'/'} element={<PublicLayout/>}>
                <Route index element={<RegistrationForm/>}/>
                <Route path={'players'} element={<PlayersList/>}/>
                <Route path={'schedule'} element={<SchedulePage/>}/>
                <Route path={'thanks'} element={<ThanksPage/>}/>
              </Route>
              
              {/* Страницы с навбаром, но без PublicLayout */}
              <Route path={'thanks'} element={
                <>
                  <PublicNavbar />
                  <Container className="mt-4 flex-grow-1 d-flex flex-column">
                    <ThanksPage/>
                  </Container>
                </>
              }/>
              
              {/* Форум */}
              <Route path={'forum'}>
                <Route path={'auth'} element={
                  <>
                    <PublicNavbar />
                    <Container className="mt-4 flex-grow-1 d-flex flex-column">
                      <ForumAuth/>
                    </Container>
                  </>
                }/>
                <Route index element={
                  <>
                    <PublicNavbar />
                    <Container className="mt-4 flex-grow-1 d-flex flex-column">
                      <Forum/>
                    </Container>
                  </>
                }/>
                <Route path={'section/:sectionId'} element={
                  <>
                    <PublicNavbar />
                    <Container className="mt-4 flex-grow-1 d-flex flex-column">
                      <SectionPage/>
                    </Container>
                  </>
                }/>
                <Route path={'section/:sectionId/create-topic'} element={
                  <>
                    <PublicNavbar />
                    <Container className="mt-4 flex-grow-1 d-flex flex-column">
                      <CreateTopicPage/>
                    </Container>
                  </>
                }/>
                <Route path={'topic/:topicId'} element={
                  <>
                    <PublicNavbar />
                    <Container className="mt-4 flex-grow-1 d-flex flex-column">
                      <TopicPage/>
                    </Container>
                  </>
                }/>
                {/* TODO: Добавить маршруты для тем и сообщений */}
              </Route>
              
              <Route path={'admin'}>
                <Route path={'login'} element={<Login/>}/>
                <Route element={<ProtectedRoute><AdminLayout/></ProtectedRoute>}>
                  <Route index element={<AdminMain/>}/>
                  <Route path={'settings'} element={<Settings/>}/>
                  <Route path={'admin-users'} element={<AdminUsers/>}/>
                  <Route path={'organize-players'} element={<OrganizePlayers/>}/>
                  <Route path={'forum'} element={<ForumManagement/>}/>
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
          <Row className="footer sticky-bottom">
            <div className="transtale">
              <GoogleTranslate/>
            </div>
            <ReactQueryDevtools initialIsOpen={false}/>
          </Row>
        </Container>
      </ErrorBoundary>
    </ScheduleStoreProvider>
  )
}

export default App
