import React from "react";
import Button from "@mui/material/Button";
import { useRouter } from "next/router";

const Nav = () => {
  const { push } = useRouter();

  return (
    <nav className="h-16  flex justify-between items-center">
      <h1 className="text-3xl font-bold">Prayer Checkin App</h1>
      <button onClick={() => push("/login")}>Login</button>
      <button>Logout</button>
    </nav>
  );
};

export { Nav };
