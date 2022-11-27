import React, { FC } from "react";
import { useGetEventDetails } from "../../lib/events/use-get-event-details";

export interface EventTableProps {
  id: string;
}

const EventTable: FC<EventTableProps> = ({ id }) => {
  const { data, error, loading, refetch } = useGetEventDetails(id);

  if (loading) return <div>Loading...</div>;

  if (error) return <div>Something went wrong</div>;

  return (
    <div>
      <h1>Event Table</h1>
      <pre>{JSON.stringify({ data }, null, 2)}</pre>
    </div>
  );
};

export { EventTable };
