import { useToast } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";

import type { JsonErrorResponse } from "./json-api-document";

export const useErrorHandler = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  return (e: JsonErrorResponse) => {
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
