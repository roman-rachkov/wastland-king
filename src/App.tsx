import {Container, Row} from "react-bootstrap";
import HeaderBanner from "./Components/HeaderBaner";
import RegistrationForm from "./pages/RegistrationForm";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {BrowserRouter, Route, Routes} from "react-router";
import AdminMain from "./pages/admin/Main";
import {GoogleTranslate} from "./Components/GoogleTranslate";
import ThanksPage from "./pages/ThanksPage";
import SchedulePage from "./pages/Schedule";
import AdminLayout from "./Layouts/AdminLayout/AdminLayout.tsx";
import Settings from "./pages/admin/Settings";
import OrganizePlayers from "./pages/admin/OrganizePlayers";
import PublicLayout from "./Layouts/PublicLayout";
import PlayersList from "./pages/PlayersList";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 минут
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Container className={'position-relative min-vh-100 h-100'}>
        <HeaderBanner/>
        <BrowserRouter>
          <Routes>
            <Route path={'/'} element={<PublicLayout/>}>
              <Route index element={<RegistrationForm/>}/>
              <Route path={'players'} element={<PlayersList/>}/>
              <Route path={'schedule'} element={<SchedulePage/>}/>
            </Route>
            <Route path={'thanks'} element={<ThanksPage/>}/>
            <Route path={'admin'}>
              <Route element={<AdminLayout/>}>
                <Route index element={<AdminMain/>}/>
                <Route path={'settings'} element={<Settings/>}/>
                <Route path={'organize-players'} element={<OrganizePlayers/>}/>
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
    </QueryClientProvider>
  )
}

export default App
