import React, { FC } from "react";
import { useGetEventDetails } from "../../lib/events/use-get-event-details";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import moment from "moment";

export interface EventTableProps {
  id: string;
}

const EventTable: FC<EventTableProps> = ({ id }) => {
  const { data, error, loading, refetch } = useGetEventDetails(id);

  const formatDate = (date: string) => {
    return moment(date).format("YYYY/MM/DD hh:mm:ss");
  };

  if (loading) return <div>Loading...</div>;

  if (error) return <div>Something went wrong</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Event Table</h1>
      {/* <pre>{JSON.stringify({ data }, null, 2)}</pre> */}
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
                const hasCheckinTime = row.checkin?.[0]?.checkin_time;
                const hasCheckoutTime = row.checkin?.[0]?.checkout_time;
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
                        ? formatDate(row.checkin[0]?.checkin_time as string)
                        : "N/A"}
                    </TableCell>
                    <TableCell align="right">
                      {hasCheckoutTime
                        ? formatDate(row.checkin[0]?.checkout_time as string)
                        : "N/A"}
                    </TableCell>
                    <TableCell align="right">
                      {hasCheckinTime && hasCheckoutTime
                        ? `${moment(row.checkin[0]?.checkout_time).diff(
                            row.checkin[0]?.checkin_time,
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
