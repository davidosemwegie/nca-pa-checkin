import React, { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import Link from "next/link";
import { TextField } from "@mui/material";

const LoginPage = () => {
  const supabase = useSupabaseClient();
  const { push } = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isForgotPasswordFormActive, setIsForgotPasswordFormActive] =
    useState(false);

  const signInWithEmail = async () => {
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
      window.localStorage.setItem(
        "access_token",
        session?.access_token as string
      );
      push("/");
    }
  };

  const sendPasswordResetEmail = async () => {
    supabase.auth
      .resetPasswordForEmail(email, {
        redirectTo: "https://nca-pa-checkin-app.vercel.app/password-reset",
      })
      .then(() => alert("Check your email"))
      .catch(() => {
        alert("Something went wrong");
      });
  };

  return (
    <div className="h-screen flex flex-col m-auto max-w-md mt-20">
      <div>
        <h1 className="text-3xl font-extrabold text-center">
          NCA Prayer Academy <br />
          Check-in
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
          {!isForgotPasswordFormActive && (
            <TextField
              id="outlined-basic"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="Password"
              type="password"
            />
          )}

          {isForgotPasswordFormActive ? (
            <button onClick={sendPasswordResetEmail}>
              Send Password Reset Email
            </button>
          ) : (
            <>
              <button className="bg-purple-600" onClick={signInWithEmail}>
                {loading ? "Loading..." : "Login"}
              </button>

              <Link
                href="/register"
                className="bg-purple-900 text-white font-semibold py-2 px-4 rounded text-center"
              >
                Create account
              </Link>
            </>
          )}

          {isForgotPasswordFormActive ? (
            <span
              className="text-center cursor-pointer"
              onClick={() => setIsForgotPasswordFormActive(false)}
            >
              Cancel
            </span>
          ) : (
            <span
              className="text-center cursor-pointer"
              onClick={() => {
                setIsForgotPasswordFormActive(true);
              }}
            >
              Forgot password ?
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
