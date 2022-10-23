import { ChakraProvider } from "@chakra-ui/react";
import { Provider } from "jotai";
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

import Loader from "./components/loader/Loader";
import Routings from "./router/Routings";

// TODO fix theme
const App = () => {
  const client = new QueryClient();
  return (
    <ChakraProvider resetCSS>
      <React.Suspense fallback={<Loader />}>
        <Provider>
          <QueryClientProvider client={client}>
            <Router>
              <Routings />
            </Router>
          </QueryClientProvider>
        </Provider>
      </React.Suspense>
    </ChakraProvider>
  );
};

export default App;
