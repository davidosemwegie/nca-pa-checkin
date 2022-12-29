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
import Switch from "react-switch";

const CreateForm = () => {
  const supabase = useSupabaseClient();
  const { register, handleSubmit } = useForm();

  const [active_date_time, setActiveDateTime] = useState<Dayjs | null>(
    dayjs(new Date())
  );
  const [active, setActive] = useState<boolean>(false);
  const [type, setType] = useState<EventType>(EventType.PRAYER_ALERT);

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    if (data.title !== "" || data.description !== "") {
      const body = {
        ...data,
        active,
        type,
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
    <div className="mt-4">
      <div className="flex flex-col w-full">
        <h1 className="font-extrabold text-3xl mb-4">Create new event</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col ">
          <FormControl>
            <div className="formSection">
              <p className="formTitle">Prayer Type</p>
              <RadioGroup row>
                <FormControlLabel
                  value={EventType.PRAYER_ALERT}
                  control={<Radio />}
                  label="Prayer Alert"
                  onClick={() => setType(EventType.PRAYER_ALERT)}
                />
                <FormControlLabel
                  value={EventType.DAILY}
                  control={<Radio />}
                  label="Daily Prayer"
                  onClick={() => setType(EventType.DAILY)}
                />
              </RadioGroup>
            </div>
            <div className="formSection">
              <div className="flex">
                <p className="mr-4">Activate right now ? </p>
                <Switch checked={active} onChange={setActive} />
                <p className="font-bold mx-4">{active ? "Yes" : "No"}</p>
                <p>
                  {active
                    ? "(other people can see this event)"
                    : " (no one will see this until you activate it)"}
                </p>
              </div>
            </div>
            <div className="formSection">
              <p className="formTitle">Title</p>
              <TextField
                id="outlined-basic"
                label="Outlined"
                variant="outlined"
                {...register("title")}
                className="w-full"
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
                className="w-full"
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
                  className="w-full"
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
    </div>
  );
};

export { CreateForm };
