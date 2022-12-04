import React, { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import Link from "next/link";
import { TextField } from "@mui/material";

const LoginPage = () => {
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function signInWithEmail() {
    setLoading(true);
    const {
      error,
      data: { session },
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      console.log("Logged in");
      window.localStorage.setItem("session", JSON.stringify(session));
      router.push("/");
    }
  }

  return (
    <div className="h-screen flex flex-col m-auto max-w-md mt-20">
      <div>
        <h1 className="text-3xl font-extrabold text-center">
          NCA Prayer Academy Checkin
        </h1>
        <p className="my-4 text-gray-500">
          Please login or create an account if you don&rsquo;t have one
        </p>
        <div className="flex flex-col max-w-4xl gap-4">
          <TextField
            id="outlined-basic"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Email"
          />
          <TextField
            id="outlined-basic"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Password"
            type="password"
          />
          <button className="bg-purple-600" onClick={signInWithEmail}>
            {loading ? "Loading..." : "Login"}
          </button>

          <Link
            href="/register"
            className="bg-purple-900 text-white font-semibold py-2 px-4 rounded text-center"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
