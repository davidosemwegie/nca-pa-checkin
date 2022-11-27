import React from "react";
import Button from "@mui/material/Button";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const Nav = () => {
  const { push } = useRouter();
  const session = useSupabaseClient();

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
          <button onClick={logout}>Logout</button>
        ) : (
          <button onClick={() => push("/login")}>Login</button>
        )}
      </div>
    </nav>
  );
};

export { Nav };
