import { createEvent, createStore } from "effector";
import { SsePayload } from "../hooks/use-sse";

export const $notifications = createStore<SsePayload<string>[]>([]);
export const notificationAdded =
  createEvent<SsePayload<string>>("Notification added");
export const notificationRemoved = createEvent<SsePayload<string>>(
  "Notification removed"
);

$notifications
  .on(notificationAdded, (state, value: SsePayload<string>) => [
    ...state,
    value,
  ])
  .on(notificationRemoved, (state, value: SsePayload<string>) =>
    state.filter((notification) => notification.payload !== value.payload)
  );
