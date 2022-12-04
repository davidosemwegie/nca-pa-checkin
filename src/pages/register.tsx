import React from "react";
import { RegisterForm } from "../components/auth/register-form";

const RegisterPage = () => {
  return (
    <div className="h-screen flex flex-col m-auto max-w-sm mt-20 text-center">
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
