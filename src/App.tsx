import {Container} from "react-bootstrap";
import HeaderBanner from "./Components/HeaderBaner";
import RegistrationForm from "./pages/RegistrationForm";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, Route, Routes} from "react-router";
import AdminMain from "./pages/admin/Main";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Container>
        <HeaderBanner/>
        <BrowserRouter>
          <Routes>
            <Route index path={'/'} element={<RegistrationForm/>}/>
            <Route path={'admin'}>
              <Route index element={<AdminMain/>}/>
            </Route>
          </Routes>
        </BrowserRouter>
      </Container>
    </QueryClientProvider>
  )
}

export default App
