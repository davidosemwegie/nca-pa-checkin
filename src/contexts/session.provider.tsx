import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import React, { FC, PropsWithChildren, useEffect, useState } from "react";
import { useContext } from "react";
import { createContext } from "react";

interface SessionContext {
  session: Session | null;
}

const sessionContext = createContext<SessionContext | null>(null);

const SessionProvider: FC<PropsWithChildren> = ({ children }) => {
  const supabase = useSupabaseClient();
  const { push, pathname } = useRouter();

  const [session, setSession] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setSession(window?.localStorage.getItem("session"));
    }, 500);
  }, []);

  useEffect(() => {
    // redirect the user to the login page if they are not logged in except for the register page
    if (!session && pathname !== "/register") {
      push("/login");
    } else if (session && pathname === "/login") {
      push("/");
    } else if (session && pathname === "/register") {
      push("/");
    }
  }, [session, pathname]);

  const value: any = {
    session: supabase.auth.getSession(),
  };

  return (
    <sessionContext.Provider value={value}>{children}</sessionContext.Provider>
  );
};

const useSession = () => {
  const context = useContext(sessionContext);

  if (!context) {
    throw new Error("useSession must be used SessionProvider");
  }

  return context;
};

export { SessionProvider, useSession };
