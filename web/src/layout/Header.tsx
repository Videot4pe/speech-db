import type { BoxProps } from "@chakra-ui/react";
import {
  Box,
  Flex,
  Icon,
  IconButton,
  Link,
  MenuButton,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useAtom } from "jotai";
import * as R from "ramda";
import type { ReactElement } from "react";
import type React from "react";
import { ImExit, ImProfile } from "react-icons/all";
import { useLocation, useNavigate, Link as ReachLink } from "react-router-dom";

import type { IRoutes } from "../router/routes";
import routes from "../router/routes";
import { jwtToken, refreshJwtToken, selfAtom } from "../store";

import ThemeToggle from "./ThemeToggle";
import { useStore } from "effector-react";
import { $notifications } from "../store/notifications";
import { Menu, MenuItem, MenuList } from "@chakra-ui/menu";
import { HamburgerIcon } from "@chakra-ui/icons";

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
  const location = useLocation();
  const { pathname } = location;
  const { colorMode } = useColorMode();

  return (
    <MenuItem
      py={0}
      px={0}
      cursor="pointer"
      width={{ base: "100%", md: "auto" }}
      bg={
        path === pathname
          ? colorMode === "light"
            ? "gray.300"
            : "gray.700"
          : undefined
      }
      _focus={{ bg: colorMode === "light" ? "gray.300" : "gray.700" }}
      _hover={{ bg: colorMode === "light" ? "gray.400" : "gray.600" }}
    >
      <Link as={ReachLink} px={4} py={2} w="100%" h="100%" to={path}>
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
      position="sticky"
      mb={8}
    >
      <Flex display={{ base: "none", md: "flex" }}>
        <Menu>
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
