import { TextField } from "@mui/material";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { data } from "autoprefixer";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const RegisterForm = () => {
  const { handleSubmit, register } = useForm();
  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseClient();

  async function registerWithEmail(args: any) {
    const { email, password, first_name, last_name } = args;
    setLoading(true);
    let { error: registerError, data } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log({ data });

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
      alert("Check your email to get a link to verify your email.");
    }
  }

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <div>
      <h1 className="font-black text-3xl mb-4">Register</h1>
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
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export { RegisterForm };
