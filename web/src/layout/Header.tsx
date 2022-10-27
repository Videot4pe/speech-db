import "./Layout.scss";
import type { BoxProps } from "@chakra-ui/react";
import {
  Box,
  Flex,
  Heading,
  Icon,
  IconButton,
  Link,
  MenuButton,
  Text,
} from "@chakra-ui/react";
import { useAtom } from "jotai";
import * as R from "ramda";
import type { ReactElement } from "react";
import type React from "react";
import type { IconType } from "react-icons";
import { ImExit, ImProfile, IoNotifications } from "react-icons/all";
import { useLocation, useNavigate, Link as ReachLink } from "react-router-dom";

import type { IRoutes } from "../router/routes";
import routes from "../router/routes";
import { jwtToken, refreshJwtToken, selfAtom } from "../store";

import ThemeToggle from "./ThemeToggle";
import { useStore } from "effector-react";
import { $notifications } from "../store/notifications";
import NotificationButton from "./NotificationButton";
import { Menu, MenuItem, MenuList } from "@chakra-ui/menu";
import { HamburgerIcon } from "@chakra-ui/icons";

interface ISidebarItem {
  name: string;
  icon: IconType;
  href: string;
}

interface SidebarItemProps extends BoxProps {
  item: IRoutes;
}

interface SidebarItemsProps {
  routes: any[];
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
}: SidebarItemProps): ReactElement => {
  const { name, icon, path } = item;
  // TODO fix
  const location = useLocation();
  const { pathname } = location;

  return (
    <MenuItem
      py={0}
      px={0}
      cursor="pointer"
      width={{ base: "100%", md: "auto" }}
      bg={path === pathname ? "gray.300" : undefined}
      _focus={{ bg: "gray.300" }}
      _hover={{ bg: "gray.400" }}
    >
      <Link
        as={ReachLink}
        px={4}
        py={2}
        w="100%"
        h="100%"
        // _hover={{ color: "red.600" }}
        // color={path === pathname ? "red.600" : undefined}
        to={path}
      >
        <Flex>
          <Icon fontSize="24px" as={icon} />
          <Text ml={1}>{name}</Text>
        </Flex>
      </Link>
    </MenuItem>
  );
};

const SidebarItems: React.FC<SidebarItemsProps> = ({
  routes,
}: SidebarItemsProps): ReactElement => {
  const [self] = useAtom(selfAtom);

  return (
    <>
      {routes
        .filter((route) => route.name && route.icon && !route.internal)
        .filter(
          (route) =>
            !route.permissions ||
            R.intersection(route.permissions, self?.permissions || []).length
        )
        .map((item) => (
          <SidebarItem key={item.name} item={item} />
        ))}
    </>
  );
};

const Header = () => {
  const navigate = useNavigate();
  const [, setToken] = useAtom(jwtToken);
  const [, setRefreshJwt] = useAtom(refreshJwtToken);
  const handleToSignin = () => navigate("/signin");

  const logOut = () => {
    setToken(undefined);
    setRefreshJwt(undefined);
    handleToSignin();
  };

  const notifications = useStore($notifications);

  return (
    <Flex
      as="header"
      width="full"
      align="center"
      alignSelf="flex-start"
      justifyContent="center"
      gridGap={2}
    >
      <Flex display={{ base: "none", md: "flex" }}>
        <Menu>
          {/*<Link alignSelf="center" as={ReachLink} to="/">*/}
          {/*  <Heading className="multicolor" as="h1" size="sm">*/}
          {/*    SpeechDB*/}
          {/*  </Heading>*/}
          {/*</Link>*/}
          <SidebarItems routes={routes} />
        </Menu>
      </Flex>
      <Box ml={2} display={{ base: "inline-block", md: "none" }}>
        <Menu closeOnSelect>
          <MenuButton
            as={IconButton}
            icon={<HamburgerIcon />}
            aria-label="Меню"
          />
          <MenuList py={0}>
            <SidebarItems routes={routes} />
          </MenuList>
        </Menu>
      </Box>

      <Box marginLeft="auto">
        <ThemeToggle />
        {/*<NotificationButton notifications={notifications} />*/}
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
