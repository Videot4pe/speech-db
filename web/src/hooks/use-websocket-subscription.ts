import { useCallback, useEffect, useState } from "react";
import { useAtom } from "jotai";
import { jwtToken } from "../store";
import { useToastHandler } from "../utils/toast-handler";

export interface WebsocketPayload<T> {
  action: string;
  payload: T;
}

export const useWebsocketSubscription = <T>(url: string) => {
  const [jwt] = useAtom(jwtToken);
  const [websocketState, setWebsocketState] = useState<T[]>([]);
  const [websocket, setWebsocket] = useState<WebSocket | undefined>(undefined);
  const toastHandler = useToastHandler();

  useEffect(() => {
    const websocket = new WebSocket(`${url}?token=${jwt}`);
    setWebsocket(websocket);

    websocket.onopen = () => {
      console.debug("connected");
    };

    websocket.onmessage = (event) => {
      // TODO - flexibility ([])
      const data: WebsocketPayload<T[]> = JSON.parse(event.data);
      setWebsocketState(data.payload);
    };

    websocket.onerror = (error) => {
      toastHandler.error("", error.type);
    };

    return () => {
      websocket.close();
    };
  }, [url, jwt]);

  const send = useCallback(
    (action: string, payload: any) => {
      const data = JSON.stringify({ action, payload });
      websocket?.send(data);
    },
    [websocket]
  );

  const close = useCallback(() => {
    websocket?.close();
    setWebsocket(undefined);
    toastHandler.warning("", "Соединение закрыто");
  }, [websocket]);

  return { send, close, websocketState };
};
