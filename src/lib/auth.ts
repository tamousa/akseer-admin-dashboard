import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const TOKEN_KEY = "akseer_admin_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function useAuthGuard() {
  const [location, setLocation] = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token && location !== "/login") {
      setLocation("/login");
    } else if (token && location === "/login") {
      setLocation("/");
    }
    setIsReady(true);
  }, [location, setLocation]);

  return isReady;
}

export function useLogout() {
  const [, setLocation] = useLocation();
  return () => {
    removeToken();
    setLocation("/login");
  };
}