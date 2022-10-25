import { IconButton, Link, useColorMode } from "@chakra-ui/react";
import { RiMoonFill, RiSunLine } from "react-icons/ri";
import { Link as ReachLink } from "react-router-dom";
import { IoNotifications } from "react-icons/all";
import React from "react";
import { SsePayload } from "../hooks/use-sse";

interface NotificationButtonProps {
  notifications: SsePayload<string>[];
}

const NotificationButton = ({ notifications }: NotificationButtonProps) => {
  return (
    <span style={{ position: "relative" }}>
      <IconButton
        ml={2}
        aria-label="profile"
        icon={<IoNotifications />}
      ></IconButton>
      <div
        style={{
          position: "absolute",
          bottom: "-22px",
          right: "-4px",
          color: notifications.length > 0 ? "red" : undefined,
        }}
      >
        {notifications.length}
      </div>
    </span>
  );
};

export default NotificationButton;
