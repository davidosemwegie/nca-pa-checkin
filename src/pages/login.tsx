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

  const [email, setEmail] = useState<string>("dosemwegie@gmail.com");
  const [password, setPassword] = useState<string>("password");
  const [loading, setLoading] = useState<boolean>(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      push("/");
    }
  }

  async function registerWithEmail() {
    setLoading(true);
    let { error } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log({ error });

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email to get a link to verify your email.");
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
        <Button variant="contained" onClick={() => registerWithEmail()}>
          Register
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
