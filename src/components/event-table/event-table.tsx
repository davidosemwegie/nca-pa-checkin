import React, { FC, useEffect, useState } from "react";
import { useGetEventDetails } from "../../lib/events/use-get-event-details";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import moment from "moment";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { TextField } from "@mui/material";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { EventType } from "../../types";
import Switch from "react-switch";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export interface EventTableProps {
  id: string;
}

const EventTable: FC<EventTableProps> = ({ id }) => {
  const [active_date_time, setActiveDateTime] = useState(
    dayjs().format('YYYY MM DD')
  );
  const supabase = useSupabaseClient();
  const {
    data,
    error,
    loading,
    refetch,
    dailyEvents,
    eventName,
    activeEvents,
  } = useGetEventDetails(id, active_date_time as unknown as Date);

  const [isActive, setIsActive] = useState<boolean>(
    activeEvents?.includes(id) || false
  );

  useEffect(() => {
    setIsActive(activeEvents?.includes(id) || false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEvents]);

  const isDailyEvent = dailyEvents?.includes(id || "");

  const formatDate = (date: string) => {
    return moment(date).format("YYYY/MM/DD hh:mm:ss a");
  };

  if (loading) return <div>Loading...</div>;


  return (
    <div>
      <div className="flex justify-between my-4">
        <div>
          <h1 className="text-3xl font-bold mb-4">{eventName}</h1>
          <div className="flex">
            <p className="mr-4">Active </p>
            <Switch
              checked={isActive}
              onChange={(checked) => {
                setIsActive(checked);
                // Update the supabase event to be active or not
                supabase
                  .from("events")
                  .update({ active: checked })
                  .eq("id", id)
                  .then(() => refetch(id, active_date_time as unknown as Date));
              }}
            />
          </div>
        </div>
        {isDailyEvent && (
          <div className="formSection">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <MobileDatePicker
                renderInput={(props) => <TextField {...props} />}
                label="Selected Date"
                value={active_date_time}
                onChange={(newValue) => {
                  // @ts-ignore
                  setActiveDateTime(newValue?.["$d"]);
                }}
                disableFuture
              />
            </LocalizationProvider>
          </div>
        )}
      </div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell align="right">Email</TableCell>
              <TableCell align="right">Checkin Time</TableCell>
              <TableCell align="right">Checkout Time</TableCell>
              <TableCell align="right">Time Spent</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data &&
              data.map((row) => {
                //Filter out the checkin data that is not within the active date time
                // UPDATE: This is not needed anymore because we are only showing the first checkin
                // const filteredCheckinData = row?.checkin.filter((checkin) => {
                //   const hasCheckinDate = !!checkin?.checkin_time;


                //   if (hasCheckinDate) {
                //     const checkinDate = formatDateForFilter(
                //       checkin?.checkin_time as string
                //     );

                //     // @ts-ignore
                //     const activeDate = formatDateForFilter(active_date_time);

                //     return checkinDate === activeDate;
                //   }

                //   return false;
                // })[0];

                const checkinData = row?.checkin[0]

                // const checkinData = isDailyEvent
                //   ? filteredCheckinData
                //   : row?.checkin[0];

                const hasCheckinTime = checkinData?.checkin_time;
                const hasCheckoutTime = checkinData?.checkout_time;

                return (
                  <TableRow
                    key={row.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.first_name}
                    </TableCell>
                    <TableCell align="right">{row.last_name}</TableCell>
                    <TableCell align="right">{row.email}</TableCell>
                    <TableCell align="right">
                      {hasCheckinTime
                        ? formatDate(checkinData?.checkin_time as string)
                        : "N/A"}
                    </TableCell>
                    <TableCell align="right">
                      {hasCheckoutTime
                        ? formatDate(checkinData?.checkout_time as string)
                        : "N/A"}
                    </TableCell>
                    <TableCell align="right">
                      {hasCheckinTime && hasCheckoutTime
                        ? `${moment(checkinData?.checkout_time).diff(
                          checkinData?.checkin_time,
                          "minutes"
                        )} minutes`
                        : hasCheckinTime && !hasCheckoutTime
                          ? "Not checked out yet"
                          : "N/A"}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export { EventTable };
