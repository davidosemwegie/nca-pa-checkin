import React, { FC, useMemo, useState } from "react";
import { CHECKIN_STATUS, Event, EventType, PrayerSessionType } from "../types";
import moment from "moment";
import { useRouter } from "next/router";
import { useCheckinMutation } from "./dashboard/queries/use-checkin-mutation";
import { useCheckoutMutation } from "./dashboard/queries/use-checkout-mutation";
import { useGetUserQuery } from "./dashboard/queries/use-get-user-query";
import {
  getCurrentPrayerSession,
  getNextPrayerSession,
  getPrayerSessionStatus,
  PRAYER_SESSIONS,
} from "../lib/prayer-session-utils";


const EventCard: FC<Event> = ({
  title,
  checkin,
  type,
  active_date_time,
  description,
  id,
  active,
}) => {
  const { push } = useRouter();
  const { isAdmin } = useGetUserQuery();
  const { mutate: checkInMutation, isLoading: isCheckingIn } = useCheckinMutation();
  const { mutate: checkOutMutation, isLoading: isCheckingOut } = useCheckoutMutation();

  const [areDetailsVisible, setAreDetailsVisible] = useState(false);
  const [checkinStatus, setCheckinStatus] = useState<any>(null);

  const now = moment();
  const currentSession = getCurrentPrayerSession(now);
  const nextSession = getNextPrayerSession(now);
  const sessionStatusMessage = getPrayerSessionStatus(now);

  // Check if check-in is available based on prayer session times (for DAILY events)
  const canCheckinNow = type === EventType.DAILY
    ? currentSession?.canCheckin ?? false
    : true; // Prayer alerts don't have time restrictions

  const today = moment(new Date()).format("YYYY/MM/DD");
  const checkinTime = checkin?.[checkin.length - 1]?.checkin_time;
  const checkoutTime = checkin?.[checkin.length - 1]?.checkout_time;
  const lastCheckinSessionType = checkin?.[checkin.length - 1]?.session_type as PrayerSessionType | undefined;
  const isSameDay = today === moment(checkinTime).format("YYYY/MM/DD");

  // For DAILY events, also check if the session type matches current session
  const isSameSession = useMemo(() => {
    if (type !== EventType.DAILY || !currentSession) return true;
    if (!checkinTime) return false;
    return lastCheckinSessionType === currentSession.sessionType;
  }, [type, currentSession, checkinTime, lastCheckinSessionType]);

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
        if (isSameDay && isSameSession) {
          setCheckinStatus(CHECKIN_STATUS.CHECKED_IN);
          return "Checked In";
        } else {
          setCheckinStatus(CHECKIN_STATUS.NOT_CHECKED_IN);
          return "Not Checked In";
        }
      }

      if (checkinTime && checkoutTime) {
        if (isSameDay && isSameSession) {
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
  }, [checkinTime, checkoutTime, isSameDay, isSameSession, type]);

  const isCheckedIn = checkinStatus !== CHECKIN_STATUS.NOT_CHECKED_IN;
  const isCheckedOut = checkinStatus === CHECKIN_STATUS.CHECKED_OUT;

  const checkIntoEvent = () => {
    if (isCheckedIn) {
      alert("You are already checked in");
    } else if (type === EventType.DAILY && !canCheckinNow) {
      const amSession = PRAYER_SESSIONS.AM;
      const pmSession = PRAYER_SESSIONS.PM;
      alert(
        `Check-in is only available during prayer sessions:\n` +
        `Morning: ${amSession.startHour - 1}:${String(60 - amSession.earlyCheckinMinutes).padStart(2, '0')} AM - ${amSession.endHour}:00 AM\n` +
        `Evening: ${pmSession.startHour - 12 - 1}:${String(60 - pmSession.earlyCheckinMinutes).padStart(2, '0')} PM - ${pmSession.endHour - 12}:00 PM`
      );
    } else {
      checkInMutation(id);
    }
  };


  const checkOutOfEvent = () => {
    if (!isCheckedIn) {
      alert("You are not checked in");
    } else {
      const lastCheckin = checkin[checkin.length - 1];
      checkOutMutation({
        id: lastCheckin?.id,
        sessionType: lastCheckin?.session_type as PrayerSessionType | undefined,
        checkinTime: lastCheckin?.checkin_time,
      });
    }
  };


  return (
    <>
      <div
        className="event-card bg-white my-4 p-4 rounded-md cursor-pointer"
        onClick={() => {
          if (isAdmin) {
            push(`/event/${id}`);
          } else {
            setAreDetailsVisible(!areDetailsVisible);
          }
        }}
      >
        <div className="event-card-row mb-4">
          <p className="event-card-text font-bold text-lg flex-1">{title}</p>
          <div className="flex items-center justify-end flex-1">
            {isAdmin ? (
              <div className="event-card-text flex">
                <p
                  className={`py-1 px-3 rounded-md font-semibold text-white ${active ? "bg-green-700" : "bg-red-700"
                    }`}
                >
                  {active ? "Live" : "Not Live"}
                </p>
              </div>
            ) : (
              <button
                onClick={() => setAreDetailsVisible(!areDetailsVisible)}
                className={`${isCheckedIn ? 'bg-gray-400' : 'bg-green-700'} font-bold checkin-status`}
              >
                {statusText}
              </button>
            )}
          </div>
        </div>
        {isAdmin && (
          <div className="event-card-row">
            <p className="event-card-text flex-1">
              {moment(active_date_time).format("ddd Do, MMM yyyy")}
            </p>
            <p className=" event-card-textflex-1">
              {moment(active_date_time).format("HH:MM a")}
            </p>
          </div>
        )}
      </div>

      {areDetailsVisible && (
        <div className="event-details-container flex justify-between gap-4">
          <div className="flex-1 bg-white p-4 rounded-md">
            <span className="whitespace-pre-wrap">
              <p className="text-lg font-bold">Prayer Points / Description</p>
              <p>{description}</p>
            </span>
            {/* Show prayer session status for DAILY events */}
            {type === EventType.DAILY && !isAdmin && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">{sessionStatusMessage}</p>
              </div>
            )}
          </div>
          <div className="event-action-button-container flex flex-col">
            <button
              className={`event-action-button mb-4 ${
                isCheckedIn || (type === EventType.DAILY && !canCheckinNow)
                  ? "bg-gray-400"
                  : "bg-green-700"
              }`}
              disabled={isCheckedIn || isCheckingIn || (type === EventType.DAILY && !canCheckinNow)}
              onClick={checkIntoEvent}
            >
              {isCheckingIn ? "Checking In..." : "Check In"}
            </button>
            <button
              className={`event-action-button ${
                checkinStatus === CHECKIN_STATUS.CHECKED_OUT
                  ? "bg-gray-400"
                  : "bg-red-700"
              }`}
              disabled={isCheckedOut || isCheckingOut || !isCheckedIn}
              onClick={checkOutOfEvent}
            >
              {isCheckingOut ? "Checking Out..." : "Check Out"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export { EventCard };
