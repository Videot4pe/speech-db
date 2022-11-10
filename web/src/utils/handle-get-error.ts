import { useToast } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";

import type { JsonErrorResponse } from "./json-api-document";
import * as Sentry from "@sentry/react";

export const useErrorHandler = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  return (e: JsonErrorResponse) => {
    Sentry.captureException(e);
    toast({
      title: e.statusText,
      description: e.data.error.title,
      status: "error",
      duration: 2000,
      isClosable: true,
    });
    if (e.status === 401) {
      navigate("/signin", { state: location.state, replace: true });
    }
  };
};
