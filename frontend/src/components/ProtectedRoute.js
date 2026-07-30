import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "./Layout";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const hasToken = localStorage.getItem("access_token");

  if (!user && !hasToken) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
}