import { lazy } from "react";
import type { PathRouteProps } from "react-router-dom";

import Layout from "../layout";

const Signin = lazy(() => import("../pages/auth/Signin"));
const Signup = lazy(() => import("../pages/auth/Signup"));
const Profile = lazy(() => import("../pages/profile/Profile"));
const Speakers = lazy(() => import("../pages/speakers/Speakers"));
const Records = lazy(() => import("../pages/records/Records"));
const Users = lazy(() => import("../pages/users/Users"));
const Home = lazy(() => import("../pages/home/Home"));

export const routes: Array<PathRouteProps> = [
  {
    path: "/signin",
    element: <Signin />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
];

export const privateRoutes: Array<PathRouteProps> = [
  {
    path: "/",
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
  },
  {
    path: "/speakers",
    element: (
      <Layout>
        <Speakers />
      </Layout>
    ),
  },
  {
    path: "/records",
    element: (
      <Layout>
        <Records />
      </Layout>
    ),
  },
  {
    path: "/users",
    element: (
      <Layout>
        <Users />
      </Layout>
    ),
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
