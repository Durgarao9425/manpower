import React from "react";
import { BrowserRouter } from "react-router-dom";
// import Routes from "./routes/routes";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Routes from "./Routes/routes";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, 
      retry: 1, 
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
          <BrowserRouter>
                <Routes />
          </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
