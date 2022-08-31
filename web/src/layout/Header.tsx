import "./Layout.scss";
import type { BoxProps } from "@chakra-ui/react";
import {
  Box,
  Flex,
  Heading,
  Icon,
  IconButton,
  Link,
  Text,
} from "@chakra-ui/react";
import { useAtom } from "jotai";
import type { ReactElement } from "react";
import type React from "react";
import type { IconType } from "react-icons";
import {
  FiFile,
  FiList,
  FiSpeaker,
  FiUser,
  ImExit,
  ImProfile,
} from "react-icons/all";
import { FiHome } from "react-icons/fi";
import { useLocation, useNavigate, Link as ReachLink } from "react-router-dom";

import { jwtToken } from "../store";

import ThemeToggle from "./ThemeToggle";

interface ISidebarItem {
  name: string;
  icon: IconType;
  href: string;
}

const SidebarItems: Array<ISidebarItem> = [
  { name: "Главная", icon: FiHome, href: "/" },
  { name: "Разметки", icon: FiList, href: "/markups" },
  { name: "Спикеры", icon: FiSpeaker, href: "/speakers" },
  { name: "Записи", icon: FiFile, href: "/records" },
  { name: "Пользователи", icon: FiUser, href: "/users" },
];

interface SidebarItemProps extends BoxProps {
  item: ISidebarItem;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
}: SidebarItemProps): ReactElement => {
  const { name, icon, href } = item;
  // TODO fix
  const location = useLocation();
  const { pathname } = location;

  return (
    <Flex mx={2} height="100%" justifyContent="center" flexDirection="column">
      <Link
        as={ReachLink}
        _hover={{ color: "red.600" }}
        color={href === pathname ? "red.600" : undefined}
        to={href}
        height="100%"
      >
        <Flex>
          <Icon fontSize="24px" as={icon} />
          <Text ml={1}>{name}</Text>
        </Flex>
      </Link>
    </Flex>
  );
};

const Header = () => {
  const navigate = useNavigate();
  const [, setToken] = useAtom(jwtToken);
  const handleToSignin = () => navigate("/signin");

  const logOut = () => {
    setToken(undefined);
    handleToSignin();
  };

  return (
    <Flex
      as="header"
      width="full"
      align="center"
      alignSelf="flex-start"
      justifyContent="center"
      gridGap={2}
    >
      <Link as={ReachLink} to="/">
        <Heading className="multicolor" as="h1" size="sm">
          SpeechDB
        </Heading>
      </Link>
      <Flex>
        {SidebarItems.map((item) => (
          <SidebarItem key={item.name} item={item} />
        ))}
      </Flex>

      <Box marginLeft="auto">
        <ThemeToggle />
        <Link as={ReachLink} to="/profile">
          <IconButton ml={2} aria-label="profile" icon={<ImProfile />} />
        </Link>
        <IconButton
          ml={2}
          aria-label="exit"
          icon={<ImExit />}
          onClick={logOut}
        />
      </Box>
    </Flex>
  );
};

export default Header;
