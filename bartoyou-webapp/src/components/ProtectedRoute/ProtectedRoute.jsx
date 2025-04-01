import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthGuard = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        navigate("/");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/api/check-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          navigate("/");
        }
      } catch (error) {
        console.error("Error validando el token:", error);
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  if (isAuthenticated === null) return <p>Loading...</p>;
  console.log(children);
  return isAuthenticated ? children : null;
};

export default AuthGuard;
