import { ChakraProvider } from "@chakra-ui/react";
import { Provider } from "jotai";
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

import Loader from "./components/loader/Loader";
import Routings from "./router/Routings";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_URL,
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

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
