import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getDefaultAccessibleRoute } from "../utils/navigationHelper";

const GuestRoute = ({ children }) => {
  const token = useSelector((state) => state.user.accessToken);
  const permissions = useSelector((state) => state.user.permissions);
  const roles = useSelector((state) => state.user.roles);
  const profileString = localStorage.getItem("user_profile");
  const refreshToken = localStorage.getItem("_rt");

  // Jika user sudah terautentikasi (ada token di Redux, profile di localStorage, atau refresh token di localStorage)
  if (token || profileString || refreshToken) {
    let userPerms = permissions || [];
    let userRoles = roles || [];
    if ((!userPerms.length || !userRoles.length) && profileString) {
      try {
        const parsed = JSON.parse(profileString);
        userPerms = parsed.permissions || [];
        userRoles = parsed.roles || [];
      } catch {
        // ignore
      }
    }
    const target = getDefaultAccessibleRoute(userPerms, userRoles);
    return <Navigate to={target.path} replace />;
  }

  return children;
};

export default GuestRoute;
