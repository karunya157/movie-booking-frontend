"use client";

import { Provider } from "react-redux";
import { store } from "../redux/store";
import { ReactNode, useEffect } from "react";
import { login } from "../redux/slice/authSlice";

function AuthRehydrator({ children }: { children: ReactNode }) {
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.email) {
          store.dispatch(login(parsed));
        }
      }
    } catch (e) {
      console.error("Auth rehydration error:", e);
    }
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthRehydrator>{children}</AuthRehydrator>
    </Provider>
  );
}
