import { useWebsocketSubscription } from "./use-websocket-subscription";

enum WebsocketAction {
  LIST = "LIST",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export const useCRUDWebsocket = <T>(url: string) => {
  const { send, websocketState } = useWebsocketSubscription<T>(url);

  const update = (payload: T) => {
    send(WebsocketAction.UPDATE, payload);
  };

  const create = (payload: T) => {
    send(WebsocketAction.CREATE, payload);
  };

  const remove = (payload: T) => {
    send(WebsocketAction.DELETE, payload);
  };

  return {
    update,
    create,
    remove,
    websocketState,
  };
};
