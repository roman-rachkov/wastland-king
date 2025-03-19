import {Container} from "react-bootstrap";
import HeaderBanner from "./Components/HeaderBaner";
import RegistrationForm from "./Components/RegistrationForm";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Container>
        <HeaderBanner/>
        <RegistrationForm/>
      </Container>
    </QueryClientProvider>
  )
}

export default App
