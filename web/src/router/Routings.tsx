/**
 * @note
 * for hook alternative of route element composition:
 * - https://reactrouter.com/docs/en/v6/upgrading/v5#use-useroutes-instead-of-react-router-config
 * - https://reactrouter.com/docs/en/v6/examples/route-objects
 *
 * might need to take notes on:
 * - https://reactrouter.com/docs/en/v6/upgrading/v5#note-on-link-to-values
 */

import { useAtom } from "jotai";
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import RequireAuth from "../components/auth/RequireAuth";
import Page404 from "../pages/404/Page404";
import {
  collectionsAtom,
  isLoggedIn,
  permissionsAtom,
  rolesAtom,
  selfAtom,
} from "../store";

import type { IRoutes } from "./routes";
import routes from "./routes";

const Routings = () => {
  const [, setPermissions] = useAtom(permissionsAtom);
  const [, setRoles] = useAtom(rolesAtom);
  const [, setSelf] = useAtom(selfAtom);
  const [, setCollections] = useAtom(collectionsAtom);
  const [loggedIn] = useAtom(isLoggedIn);

  useEffect(() => {
    if (loggedIn) {
      setPermissions().catch(console.error);
      setRoles().catch(console.error);
      setSelf().catch(console.error);
      setCollections().catch(console.error);
    }
  }, [loggedIn]);

  return (
    <Routes>
      {routes.map((route: IRoutes) => (
        <Route
          {...route}
          element={
            route.auth === true ? (
              <RequireAuth
                redirectTo={`/signin?redirectTo=${route.path}`}
                permissions={route.permissions}
              >
                {route.element}
              </RequireAuth>
            ) : (
              route.element
            )
          }
          key={`${route.path as string}`}
        />
      ))}
      <Route path="*" element={<Page404 />} />
    </Routes>
  );
};

export default Routings;
