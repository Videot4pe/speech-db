import { useAtom } from "jotai";
import * as R from "ramda";
import { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { isLoggedIn, selfAtom } from "../../store";

type PrivateRouteProps = {
  children: React.ReactNode;
  permissions?: string[];
  redirectTo?: string;
};

const RequireAuth = ({
  children,
  permissions = [],
  redirectTo = "/signin",
}: PrivateRouteProps) => {
  const [isAuthenticated] = useAtom(isLoggedIn);
  const [self, _] = useAtom(selfAtom);
  const location = useLocation();

  console.log(permissions, self.permissions);

  const hasPermissions = useMemo(
    () =>
      !permissions.length ||
      R.intersection(permissions, self?.permissions || []).length,
    [self, permissions]
  );

  // TODO fix nested & page not allowed
  return isAuthenticated ? (
    hasPermissions ? (
      (children as React.ReactElement)
    ) : (
      <Navigate to="404" state={{ from: location }} replace />
    )
  ) : (
    <Navigate to={redirectTo} state={{ from: location }} replace />
  );
};

export default RequireAuth;
