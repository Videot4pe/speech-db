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
import * as R from "ramda";
import type { ReactElement } from "react";
import type React from "react";
import type { IconType } from "react-icons";
import { ImExit, ImProfile } from "react-icons/all";
import { useLocation, useNavigate, Link as ReachLink } from "react-router-dom";

import type { IRoutes } from "../router/routes";
import routes from "../router/routes";
import { jwtToken, refreshJwtToken, selfAtom } from "../store";

import ThemeToggle from "./ThemeToggle";

interface ISidebarItem {
  name: string;
  icon: IconType;
  href: string;
}

interface SidebarItemProps extends BoxProps {
  item: IRoutes;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
}: SidebarItemProps): ReactElement => {
  const { name, icon, path } = item;
  // TODO fix
  const location = useLocation();
  const { pathname } = location;

  return (
    <Flex mx={2} height="100%" justifyContent="center" flexDirection="column">
      <Link
        as={ReachLink}
        _hover={{ color: "red.600" }}
        color={path === pathname ? "red.600" : undefined}
        to={path}
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
  const [, setRefreshJwt] = useAtom(refreshJwtToken);
  const [self] = useAtom(selfAtom);
  const handleToSignin = () => navigate("/signin");

  const logOut = () => {
    setToken(undefined);
    setRefreshJwt(undefined);
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
