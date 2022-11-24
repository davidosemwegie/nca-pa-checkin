import React, { FC, useMemo, useState } from "react";
import { UseGetInterfaceData } from "../lib/events/use-get-events";
import { Event, EventType } from "../types";
import moment from "moment";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

enum CHECKIN_STATUS {
  CHECKED_IN = "CHECKED_IN",
  CHECKED_OUT = "CHECKED_OUT",
  NOT_CHECKED_IN = "NOT_CHECKED_IN",
}

export interface EventCardProps extends UseGetInterfaceData {
  refetch: () => void;
}

const EventCard: FC<EventCardProps> = ({
  title,
  checkin,
  type,
  active_date_time,
  description,
  id,
  refetch,
}) => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [areDetailsVisible, setAreDetailsVisible] = useState(false);
  const [checkinStatus, setCheckinStatus] = useState<any>(null);

  const today = moment(new Date()).format("YYYY/MM/DD");
  const checkinTime = checkin?.[checkin.length - 1]?.checkin_time;
  const checkoutTime = checkin?.[checkin.length - 1]?.checkout_time;
  const isSameDay = today === moment(checkinTime).format("YYYY/MM/DD");

  const statusText = useMemo(() => {
    if (type === EventType.PRAYER_ALERT) {
      if (checkinTime && !checkoutTime) {
        setCheckinStatus(CHECKIN_STATUS.CHECKED_IN);
        return "Checked In";
      }

      if (checkinTime && checkoutTime) {
        setCheckinStatus(CHECKIN_STATUS.CHECKED_OUT);
        return "Checked Out";
      }
    }

    if (type === EventType.DAILY) {
      if (checkinTime && !checkoutTime) {
        if (isSameDay) {
          setCheckinStatus(CHECKIN_STATUS.CHECKED_IN);
          return "Checked In";
        } else {
          setCheckinStatus(CHECKIN_STATUS.NOT_CHECKED_IN);
          return "Not Checked In";
        }
      }

      if (checkinTime && checkoutTime) {
        if (isSameDay) {
          setCheckinStatus(CHECKIN_STATUS.CHECKED_OUT);
          return "Checked Out";
        } else {
          setCheckinStatus(CHECKIN_STATUS.NOT_CHECKED_IN);
          return "Not Checked In";
        }
      }
    }

    setCheckinStatus(CHECKIN_STATUS.NOT_CHECKED_IN);
    return "Not Checked in";
  }, [checkinTime, checkoutTime, isSameDay, type]);

  const colorMap = {
    [CHECKIN_STATUS.CHECKED_IN]: "bg-green-500",
    [CHECKIN_STATUS.CHECKED_OUT]: "bg-red-500",
    [CHECKIN_STATUS.NOT_CHECKED_IN]: "bg-gray-500",
  };

  const isCheckedIn = checkinStatus !== CHECKIN_STATUS.NOT_CHECKED_IN;
  const isCheckedOut = checkinStatus === CHECKIN_STATUS.CHECKED_OUT;

  const refetchEvent = async () => {
    let { data, error } = await supabase
      .from("events")
      .select("*, checkin (id, checkin_time, checkout_time)")
      .eq("checkin.user_id", session?.user.id)
      .eq("id", id);

    if (error) alert(error.message);

    // @ts-ignore
    setEvent(data[data?.length - 1]);
  };

  const checkIn = async () => {
    //Check Into event
    await supabase
      .from("checkin")
      .insert([
        {
          event_id: id,
          user_id: session?.user.id,
          checkin_time: new Date().toISOString(),
        },
      ])
      .then(() => refetch());
  };

  const checkOut = async () => {
    await supabase
      .from("checkin")
      .update([
        {
          id: checkin[checkin.length - 1].id,
          checkout_time: new Date().toISOString(),
        },
      ])
      .then(() => refetch());
  };

  return (
    <>
      <div
        className="bg-white my-4 p-4 rounded-md flex justify-between items-center cursor-pointer"
        onClick={() => setAreDetailsVisible(!areDetailsVisible)}
      >
        <p className="flex-1">{title}</p>
        <p className="flex-1">
          Start Time: {moment(active_date_time).format("HH:MM a")}
        </p>
        <div className="flex items-center justify-end flex-1">
          <div
            className={`bg-gray-400 font-bold text-white p-4 rounded-md mr-4`}
          >
            <p>{statusText}</p>
          </div>
          {areDetailsVisible ? (
            <KeyboardArrowUpIcon />
          ) : (
            <KeyboardArrowDownIcon />
          )}
        </div>
      </div>

      {areDetailsVisible && (
        <div className="flex justify-between gap-4">
          <div className="flex-1 bg-white p-4 rounded-md">
            <p className="whitespace-pre-wrap">{description}</p>
            {/* <pre>{JSON.stringify({ checkinStatus, checkin }, null, 2)}</pre> */}
          </div>
          <div className="flex flex-col">
            <button
              className={`mb-4 ${isCheckedIn ? "bg-gray-400" : "bg-green-500"}`}
              disabled={isCheckedIn}
              onClick={checkIn}
            >
              Check In
            </button>
            <button
              className={`${
                checkinStatus === CHECKIN_STATUS.CHECKED_OUT
                  ? "bg-gray-400"
                  : "bg-red-500"
              }`}
              disabled={isCheckedOut}
              onClick={checkOut}
            >
              Check Out
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export { EventCard };
