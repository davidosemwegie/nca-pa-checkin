import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import { EventType } from "../../types";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const CreateForm = () => {
  const supabase = useSupabaseClient();
  const { register, handleSubmit } = useForm();

  const [active_date_time, setActiveDateTime] = useState<Dayjs | null>(
    dayjs(new Date())
  );

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    if (data.title !== "" || data.description !== "") {
      const body = {
        ...data,
        active: true,
        // @ts-ignore
        active_date_time: new Date(active_date_time?.["$d"] as any),
      };
      setLoading(true);

      const { error } = await supabase.from("events").insert([body]);

      if (error) {
        alert(error.message);
      } else {
        alert("Event created successfully");
      }
      setLoading(false);
    } else {
      alert("Please fill in all the fields");
    }
  };

  return (
    <div>
      <h1>Create new event</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col ">
        <FormControl>
          <div className="formSection">
            <p className="formTitle">Prayer Type</p>
            <RadioGroup row {...register("type")}>
              <FormControlLabel
                value={EventType.PRAYER_ALERT}
                control={<Radio />}
                label="Prayer Alert"
              />
              <FormControlLabel
                value={EventType.DAILY}
                control={<Radio />}
                label="Daily Prayer"
              />
            </RadioGroup>
          </div>
          <div className="formSection">
            <p className="formTitle">Title</p>
            <TextField
              id="outlined-basic"
              label="Outlined"
              variant="outlined"
              {...register("title")}
            />
          </div>
          <div className="formSection">
            <p className="formTitle">Description</p>
            <TextField
              id="outlined-multiline-static"
              multiline
              rows={4}
              placeholder="Prayer Points"
              variant="outlined"
              {...register("description")}
            />
          </div>
          <div className="formSection">
            <p className="formTitle">Active Date Time</p>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                renderInput={(props) => <TextField {...props} />}
                label="DateTimePicker"
                value={active_date_time}
                onChange={(newValue) => {
                  setActiveDateTime(newValue);
                }}
              />
            </LocalizationProvider>
          </div>
        </FormControl>
        <div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <button type="submit" className="text-black">
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export { CreateForm };
