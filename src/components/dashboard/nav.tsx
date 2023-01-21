import React from "react";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Greeting } from "./greeting";
import { useGetUserQuery } from "./queries/use-get-user-query";

const Nav = () => {
  const { push, pathname } = useRouter();
  const session = useSupabaseClient();
  const { isAdmin } = useGetUserQuery();

  const logout = () => {
    session.auth.signOut();
    window?.localStorage.removeItem("session");
    push("/login");
  };

  return (
    <nav>
      <Greeting />
      <div className="nav-button-group flex gap-4">
        {session ? (
          <>
            {isAdmin && (
              <>
                {pathname !== "/" && (
                  <button onClick={() => push("/")}>
                    View all prayer events
                  </button>
                )}

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
