import { TextField } from "@mui/material";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const RegisterForm = () => {
  const { handleSubmit, register } = useForm();
  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseClient();
  const { push } = useRouter();

  async function registerWithEmail(args: any) {
    const { email, password, first_name, last_name } = args;
    setLoading(true);
    let { error: registerError, data } = await supabase.auth.signUp({
      email,
      password,
    });

    if (data) {
      const { error } = await supabase
        .from("users")
        .insert([{ email, first_name, last_name, id: data.user?.id }]);

      if (error) {
        alert(error.message);
      }
    }

    if (registerError) {
      alert(registerError?.message);
    } else {
      alert("Account created! Try logging in with your email and password");
      push("/login");
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-extrabold mb-4">Register</h1>

      <form
        onSubmit={handleSubmit(registerWithEmail)}
        className="flex flex-col max-w-4xl gap-4"
      >
        <TextField
          label="First Name"
          {...register("first_name", { required: true })}
        />
        <TextField
          label="Last Name"
          {...register("last_name", { required: true })}
        />
        <TextField label="Email" {...register("email", { required: true })} />
        <TextField
          label="Password"
          {...register("password", { required: true })}
        />

        <button type="submit">
          {loading ? "Loading..." : "Create account"}
        </button>
      </form>
    </div>
  );
};

export { RegisterForm };
