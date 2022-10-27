import { useCallback, useEffect, useState } from "react";
import { useAtom } from "jotai";
import { jwtToken } from "../store";

export interface WebsocketPayload<T> {
  action: string;
  payload: T;
}

export const useWebsocketSubscription = <T>(url: string) => {
  const [jwt] = useAtom(jwtToken);
  const [websocketState, setWebsocketState] = useState<T[]>([]);
  const [websocket, setWebsocket] = useState<WebSocket | undefined>(undefined);

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
  }, [websocket]);

  return { send, close, websocketState };
};
