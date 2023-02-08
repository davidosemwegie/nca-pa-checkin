import { useSession } from "@supabase/auth-helpers-react";
import React from "react";
import { EventType } from "../../types";
import { EventCard } from "../event-card";
import { useShowEventListQuery } from "./queries/use-show-event-list-query";

const Dashboard = () => {
  const { data, error, isLoading: loading } = useShowEventListQuery()
  const session = useSession();

  if (loading) return <div>Loading...</div>;

  if (error && !session) return <div>Please login</div>;

  if (error)
    return (
      <div>
        Something went wrong, please reach out to Pastor Idy to check in
      </div>
    );

  if (loading) return <div>Loading...</div>;

  const prayerAlerts = data?.data?.filter((value) => value.type === EventType.PRAYER_ALERT)
  const dailyPrayers = data?.data?.filter((value) => value.type === EventType.DAILY)

  dailyPrayers?.map(dailyPrayer => {
    dailyPrayer?.checkin?.sort((a: any, b: any) => {

      return Number(new Date(a?.checkin_time as any)) - Number(new Date(b?.checkin_time as any))
    })
  })


  return (
    <div className="dashboard-container my-4">
      <div className="mb-4">
        {!!prayerAlerts && prayerAlerts.length > 0 &&
          <>
            <h1 className="text-2xl font-bold">Prayer Alerts</h1>
            {prayerAlerts.map((item) => (
              <EventCard key={item.id} {...item} />
            ))}
          </>
        }
      </div>

      <div>
        {!!dailyPrayers && dailyPrayers.length > 0 &&
          <>
            <h1 className="text-2xl font-bold">Daily Prayers</h1>
            {dailyPrayers?.map((item) => (
              <EventCard key={item.id} {...item} />
            ))}
          </>
        }
      </div>
    </div>
  );
};

export { Dashboard };
