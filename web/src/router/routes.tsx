import { lazy } from "react";
import { FiFile, FiMousePointer, FiSpeaker, FiUser } from "react-icons/all";
import { FiHome } from "react-icons/fi";
import type { IconType } from "react-icons/lib";
import type { PathRouteProps } from "react-router-dom";

import Layout from "../layout";
import { Permission } from "../models/common";
import Markups from "../pages/markups/Markups";

import Page from "./names";

const Signin = lazy(() => import("../pages/auth/Signin"));
const Signup = lazy(() => import("../pages/auth/Signup"));
const Profile = lazy(() => import("../pages/profile/Profile"));
const Speakers = lazy(() => import("../pages/speakers/Speakers"));
const Records = lazy(() => import("../pages/records/Records"));
const Users = lazy(() => import("../pages/users/Users"));
const Home = lazy(() => import("../pages/home/Home"));

export interface IRoutes extends PathRouteProps {
  permissions?: string[];
  auth?: boolean;
  icon?: IconType;
  name?: string;
}

const routes: Array<IRoutes> = [
  {
    path: "/signin",
    element: <Signin />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/",
    icon: FiHome,
    name: Page.Home,
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
    auth: true,
  },
  {
    path: "/speakers",
    icon: FiSpeaker,
    name: Page.Speakers,
    element: (
      <Layout>
        <Speakers />
      </Layout>
    ),
    auth: true,
    permissions: [Permission.EDIT_SPEAKERS],
  },
  {
    path: "/records",
    icon: FiFile,
    name: Page.Records,
    element: (
      <Layout>
        <Records />
      </Layout>
    ),
    auth: true,
    permissions: [Permission.EDIT_RECORDS],
  },
  {
    path: "/markups",
    icon: FiMousePointer,
    name: Page.Markups,
    element: (
      <Layout>
        <Markups />
      </Layout>
    ),
    auth: true,
  },
  {
    path: "/users",
    icon: FiUser,
    name: Page.Users,
    element: (
      <Layout>
        <Users />
      </Layout>
    ),
    auth: true,
    permissions: [Permission.EDIT_RECORDS],
  },
  {
    path: "/profile",
    element: (
      <Layout>
        <Profile />
      </Layout>
    ),
  },
];

export default routes;
