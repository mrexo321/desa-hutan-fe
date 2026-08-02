import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const GuestRoute = ({ children }) => {
  const token = useSelector((state) => state.user.accessToken);
  const profileString = localStorage.getItem("user_profile");
  const refreshToken = localStorage.getItem("_rt");

  // Jika user sudah terautentikasi (ada token di Redux, profile di localStorage, atau refresh token di localStorage)
  if (token || profileString || refreshToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default GuestRoute;
