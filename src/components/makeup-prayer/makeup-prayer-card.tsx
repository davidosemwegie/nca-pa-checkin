import React, { useState, useEffect, useCallback, useRef } from "react";
import moment from "moment";
import { useWeeklyPrayerStats } from "../../lib/hooks/use-weekly-prayer-stats";
import { useMakeupCheckinMutation } from "./use-makeup-checkin-mutation";
import { useMakeupCheckoutMutation } from "./use-makeup-checkout-mutation";
import {
  formatMinutesToDisplay,
  MAX_WEEKLY_DEFICIT_MINUTES,
} from "../../lib/prayer-session-utils";

interface MakeupPrayerCardProps {
  eventId: string;
}

const MakeupPrayerCard: React.FC<MakeupPrayerCardProps> = ({ eventId }) => {
  const { data: stats, isLoading, refetch } = useWeeklyPrayerStats();
  const { mutate: startMakeup, isLoading: isStarting } = useMakeupCheckinMutation();
  const { mutate: endMakeup, isLoading: isEnding } = useMakeupCheckoutMutation();

  const [isInMakeupSession, setIsInMakeupSession] = useState(false);
  const [makeupStartTime, setMakeupStartTime] = useState<string | null>(null);
  const [makeupCheckinId, setMakeupCheckinId] = useState<string | null>(null);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Ref to track if auto-checkout has been triggered
  const autoCheckoutTriggeredRef = useRef(false);

  // Update elapsed time during makeup session
  useEffect(() => {
    if (!isInMakeupSession || !makeupStartTime) {
      autoCheckoutTriggeredRef.current = false;
      return;
    }

    const interval = setInterval(() => {
      const elapsed = moment().diff(moment(makeupStartTime), "minutes");
      setElapsedMinutes(elapsed);

      // Auto-checkout if reached max allowed time (only trigger once)
      if (stats && elapsed >= stats.makeupTimeAvailable && !autoCheckoutTriggeredRef.current) {
        autoCheckoutTriggeredRef.current = true;
        // Trigger checkout via state change that will be picked up by the button click handler
        alert("Maximum makeup time reached. Your session will end now.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isInMakeupSession, makeupStartTime, stats]);

  const handleStartMakeup = useCallback(() => {
    if (!stats?.canMakeup) {
      alert("You cannot start a makeup session right now.");
      return;
    }

    startMakeup(eventId, {
      onSuccess: (data) => {
        setIsInMakeupSession(true);
        setMakeupStartTime(data.startTime);
        setMakeupCheckinId(data.checkinId);
        setElapsedMinutes(0);
        alert("Makeup prayer session started! Start praying now.");
      },
    });
  }, [eventId, stats, startMakeup]);

  const handleEndMakeup = useCallback(() => {
    if (!makeupCheckinId || !makeupStartTime || !stats) return;

    endMakeup(
      {
        checkinId: makeupCheckinId,
        startTime: makeupStartTime,
        maxMinutesAllowed: stats.makeupTimeAvailable,
      },
      {
        onSuccess: () => {
          setIsInMakeupSession(false);
          setMakeupStartTime(null);
          setMakeupCheckinId(null);
          setElapsedMinutes(0);
          refetch();
        },
      }
    );
  }, [makeupCheckinId, makeupStartTime, stats, endMakeup, refetch]);

  if (isLoading) {
    return (
      <div className="makeup-prayer-card bg-white my-4 p-4 rounded-md">
        <p className="text-gray-500">Loading weekly stats...</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const weekStartFormatted = moment(stats.weekStart).format("MMM D");
  const weekEndFormatted = moment(stats.weekEnd).format("MMM D, YYYY");

  return (
    <div className="makeup-prayer-card bg-white my-4 p-4 rounded-md">
      <div
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">Make Up Prayer</h3>
          {stats.canMakeup && !isInMakeupSession && (
            <span className="bg-yellow-500 text-white text-sm px-2 py-1 rounded">
              {formatMinutesToDisplay(stats.makeupTimeAvailable)} available
            </span>
          )}
          {isInMakeupSession && (
            <span className="bg-green-600 text-white text-sm px-2 py-1 rounded animate-pulse">
              In Progress
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm">
          Week of {weekStartFormatted} - {weekEndFormatted}
        </p>
      </div>

      {isExpanded && (
        <div className="mt-4 border-t pt-4">
          {/* Weekly Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Expected Time</p>
              <p className="font-bold">
                {formatMinutesToDisplay(stats.expectedMinutes)}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Actual Time</p>
              <p className="font-bold text-green-600">
                {formatMinutesToDisplay(stats.actualMinutes)}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Deficit</p>
              <p className={`font-bold ${stats.deficitMinutes > 0 ? "text-red-600" : "text-green-600"}`}>
                {formatMinutesToDisplay(stats.deficitMinutes)}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Makeup Used</p>
              <p className="font-bold text-blue-600">
                {formatMinutesToDisplay(stats.makeupMinutesUsed)}
              </p>
            </div>
          </div>

          {/* Makeup Session Controls */}
          {isInMakeupSession ? (
            <div className="text-center">
              <div className="mb-4">
                <p className="text-xl font-bold text-green-600">
                  Praying: {elapsedMinutes} / {stats.makeupTimeAvailable} min
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, (elapsedMinutes / stats.makeupTimeAvailable) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
              <button
                onClick={handleEndMakeup}
                disabled={isEnding}
                className="bg-red-700 text-white py-2 px-6 rounded-md font-bold hover:bg-red-800 disabled:bg-gray-400"
              >
                {isEnding ? "Ending..." : "End Makeup Session"}
              </button>
            </div>
          ) : stats.canMakeup ? (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                You can make up to {formatMinutesToDisplay(stats.makeupTimeAvailable)} of
                prayer time this week (max {formatMinutesToDisplay(MAX_WEEKLY_DEFICIT_MINUTES)} per week).
              </p>
              <button
                onClick={handleStartMakeup}
                disabled={isStarting}
                className="bg-blue-600 text-white py-2 px-6 rounded-md font-bold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isStarting ? "Starting..." : "Start Makeup Prayer"}
              </button>
            </div>
          ) : stats.deficitMinutes === 0 ? (
            <div className="text-center py-4">
              <p className="text-green-600 font-bold">
                Great job! You have no prayer deficit this week.
              </p>
            </div>
          ) : stats.deficitMinutes > MAX_WEEKLY_DEFICIT_MINUTES ? (
            <div className="text-center py-4">
              <p className="text-red-600">
                Your deficit exceeds the maximum allowed makeup time of{" "}
                {formatMinutesToDisplay(MAX_WEEKLY_DEFICIT_MINUTES)}.
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">
                You have used all your available makeup time this week.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { MakeupPrayerCard };
