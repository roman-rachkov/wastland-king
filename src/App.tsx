import {Container, Row} from "react-bootstrap";
import HeaderBanner from "./Components/HeaderBaner";
import RegistrationForm from "./pages/RegistrationForm";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {BrowserRouter, Route, Routes} from "react-router";
import AdminMain from "./pages/admin/Main";
import {GoogleTranslate} from "./Components/GoogleTranslate";

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
      <Container className={'position-relative'}>
        <HeaderBanner/>
        <BrowserRouter>
          <Routes>
            <Route index path={'/'} element={<RegistrationForm/>}/>
            <Route path={'admin'}>
              <Route index element={<AdminMain/>}/>
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
