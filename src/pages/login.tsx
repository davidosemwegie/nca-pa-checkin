import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useForm, SubmitHandler } from "react-hook-form";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";

type Inputs = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const supabase = useSupabaseClient();
  const { push } = useRouter();

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
      window.localStorage.setItem("session", JSON.stringify(session));
      console.log("Logged in successfully!");
      push("/");
    }
  }

  return (
    <div className="h-screen flex-row ">
      <form>
        <Stack spacing={2} direction="row">
          <TextField
            id="outlined-basic"
            variant="outlined"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
          <TextField
            id="outlined-basic"
            variant="outlined"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </Stack>
        <Button variant="contained" onClick={() => signInWithEmail()}>
          Login
        </Button>
        <Button variant="contained" onClick={() => push("/register")}>
          Register
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
