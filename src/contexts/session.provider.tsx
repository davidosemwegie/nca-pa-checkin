import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Session } from "@supabase/supabase-js";
import React, { FC, PropsWithChildren, useEffect, useState } from "react";
import { useContext } from "react";
import { createContext } from "react";

interface SessionContext {
  session: Session | null;
}

const sessionContext = createContext<SessionContext | null>(null);

const SessionProvider: FC<PropsWithChildren> = ({ children }) => {
  const supabase = useSupabaseClient();

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const value: SessionContext = {
    session,
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
