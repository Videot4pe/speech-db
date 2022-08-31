import { ChakraProvider } from "@chakra-ui/react";
import { Provider } from "jotai";
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import Loader from "./components/loader/Loader";
import Routings from "./router/Routings";

// TODO fix theme
const App = () => (
  <ChakraProvider resetCSS>
    <React.Suspense fallback={<Loader />}>
      <Provider>
        <Router>
          <Routings />
        </Router>
      </Provider>
    </React.Suspense>
  </ChakraProvider>
);

export default App;
