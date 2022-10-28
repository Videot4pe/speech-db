import { useToast } from "@chakra-ui/react";

export const useToastHandler = (duration: number = 1000) => {
  const toast = useToast();

  return {
    success: (title: string, description: string) => {
      toast({
        status: "success",
        position: "top",
        duration,
        title,
        description,
      });
    },
    error: (title: string, description: string) => {
      toast({
        status: "error",
        position: "top",
        duration,
        title,
        description,
      });
    },
    warning: (title: string, description: string) => {
      toast({
        status: "warning",
        position: "top",
        duration,
        title,
        description,
      });
    },
  };
};
