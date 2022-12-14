import {InputAdornment} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';


const PasswordResetPage = () => {
  const router = useRouter();

  const [password, setPassword] = React.useState<string>("");
  const [confirmPassword, setcConfirmPassword] = React.useState<string>("");
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  const supabase = useSupabaseClient();

  useEffect(() => {
    const values = router.asPath
      .split("#")[1]
      .split("&")
      .map((param) => param.split("="));

    const accessToken = values.find(
      (param) => param[0] === "access_token"
    )?.[1];
    const refreshToken = values.find(
      (param) => param[0] === "refresh_token"
    )?.[1];

    if (accessToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken as string,
      });
    } else {
      router.push("/login");
    }
  }, []);

  const resetPassword = async () => {

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      console.log(error);
    } else {
      alert("Password updated successfully");
      router.push("/login");
    }
  };

  return (
    <div className="h-screen flex flex-col m-auto max-w-md mt-20">
      <div>
        <h1 className="text-3xl font-extrabold text-center">Password Reset</h1>
        <p className="my-4 text-gray-500">Enter a new password</p>
        <div className="flex flex-col max-w-4xl gap-4 my-4">
          <TextField
            id="outlined-basic"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="New Password"
            type={showPassword ? "text" : "password"}       
            InputProps={{
            endAdornment: (
              <InputAdornment position="start" style={{cursor: 'pointer'}}>
                {
                  showPassword ? <VisibilityIcon onClick={() => setShowPassword(false)} /> : <VisibilityOffIcon onClick={() => setShowPassword(true)} />
                }
              </InputAdornment>
            ),
          }}
          />
          <TextField
            id="outlined-basic"
            onChange={(e) => setcConfirmPassword(e.target.value)}
            value={confirmPassword}
            placeholder="Confirm Password"
            type={showPassword ? "text" : "password"}
            InputProps={{
            endAdornment: (
              <InputAdornment position="start" style={{cursor: 'pointer'}}>
                {
                  showPassword ? <VisibilityIcon onClick={() => setShowPassword(false)} /> : <VisibilityOffIcon onClick={() => setShowPassword(true)} />
                }
              </InputAdornment>
            ),
          }}
          />
          <button onClick={resetPassword}>Reset Password</button>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;
