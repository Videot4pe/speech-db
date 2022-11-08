import { lazy } from "react";
import { FiFile, FiMousePointer, FiSpeaker, FiUser } from "react-icons/all";
import { FiEdit, FiHome } from "react-icons/fi";
import type { IconType } from "react-icons/lib";
import type { PathRouteProps } from "react-router-dom";

import Layout from "../layout";
import { Permission } from "../models/common";

import Page from "./names";

const Signin = lazy(() => import("../pages/auth/Signin"));
const Signup = lazy(() => import("../pages/auth/Signup"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const ChangePassword = lazy(() => import("../pages/auth/ChangePassword"));
const Profile = lazy(() => import("../pages/profile/Profile"));
const Speakers = lazy(() => import("../pages/speakers/Speakers"));
const Records = lazy(() => import("../pages/records/Records"));
const Admin = lazy(() => import("../pages/admin/Index"));
const Home = lazy(() => import("../pages/home/Home"));
const Markups = lazy(() => import("../pages/markups/Markups"));
const Markup = lazy(() => import("../pages/markup/Markup"));
const EditPage = lazy(() => import("../pages/edit/EditPage"));
const ActivationLinkExpired = lazy(() => import("../pages/auth/ActivationLinkExpired")); 

export interface IRoutes extends PathRouteProps {
  permissions?: string[];
  auth?: boolean;
  icon?: IconType;
  name?: string;
  internal?: boolean;
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
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/change-password",
    element: <ChangePassword />,
  },
  {
    path: "/activation-link-expired",
    element: <ActivationLinkExpired />,
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
    path: "/markups/:id",
    icon: FiMousePointer,
    name: Page.Markup,
    internal: true,
    element: (
      <Layout>
        <EditPage />
      </Layout>
    ),
    auth: true,
  },
  {
    path: "/admin",
    icon: FiUser,
    name: Page.Admin,
    element: (
      <Layout>
        <Admin />
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
