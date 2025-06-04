import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Routes from "./Routes/routes";
import { AuthProvider } from "./Components/Pages/Dashboard/Login/authcontext";
import TokenExpirationAlert from "./Components/Common/TokenExpirationAlert";
import { ThemeProvider } from './context/ThemeContext';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, 
      retry: 1, 
    },
  },
});

function App() {
  // Check if token expiration alert is enabled
  const showTokenAlert = import.meta.env.VITE_ENABLE_SESSION_TIMEOUT !== 'false' && import.meta.env.VITE_ENABLE_SESSION_TIMEOUT !== undefined;

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Routes />
            {showTokenAlert && <TokenExpirationAlert />}
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
