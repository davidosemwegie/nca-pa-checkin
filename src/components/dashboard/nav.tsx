import React from "react";
import Button from "@mui/material/Button";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useGetUser } from "../../lib/events/use-get-user";

const Nav = () => {
  const { push } = useRouter();
  const session = useSupabaseClient();
  const { isAdmin } = useGetUser();

  const logout = () => {
    session.auth.signOut();
    window?.localStorage.removeItem("session");
    push("/login");
  };

  return (
    <nav className="h-16  flex justify-between items-center">
      <h1 className="text-3xl font-bold">Prayer Checkin App</h1>
      <div className="flex gap-4">
        {session ? (
          <>
            {isAdmin && (
              <>
                <button onClick={() => push("/")}>
                  View all prayer events
                </button>
                <button onClick={() => push("/create")}>
                  Create new event
                </button>
              </>
            )}
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <button onClick={() => push("/login")}>Login</button>
        )}
      </div>
    </nav>
  );
};

export { Nav };
