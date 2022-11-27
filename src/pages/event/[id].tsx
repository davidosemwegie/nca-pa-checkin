import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { Nav } from "../../components/dashboard/nav";
import { EventTable } from "../../components/event-table/event-table";

const PrayerViewPage = () => {
  const {
    query: { id },
    push,
  } = useRouter();

  useEffect(() => {
    if (!id) {
      push("/");
    }
  }, []);

  if (!id) return null;

  return (
    <div>
      <Nav />
      <EventTable id={id as string} />
    </div>
  );
};

export default PrayerViewPage;
