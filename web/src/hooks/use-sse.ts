import { useCallback, useEffect, useState } from "react";
import { useAtom } from "jotai";
import { jwtToken } from "../store";
import { useToast } from "@chakra-ui/react";

export interface SsePayload<T> {
  action: string;
  status: string;
  payload: T;
}

export const useSse = <T>(url: string) => {
  const [jwt] = useAtom(jwtToken);
  const [source, setSource] = useState<EventSource | undefined>(undefined);

  const toast = useToast();

  useEffect(() => {
    const source = new EventSource(`${url}?token=${jwt}`);
    setSource(source);
    // TODO reconnect

    source.addEventListener("notification", (message) => {
      const { action, status, payload } = JSON.parse(message.data);
      toast({
        title: action,
        status: status,
        description: payload.toString(),
        duration: 5000,
        isClosable: true,
      });

      // TODO event bus (кидаю ивент с экшеном, его можно перехватывать например для перезагрузки страницы (хотя это и в сторе можно, наверное))
    });

    return () => {
      source.close();
    };
  }, [url, jwt]);

  const close = useCallback(() => {
    source?.close();
    setSource(undefined);
  }, [source]);

  return close;
};
