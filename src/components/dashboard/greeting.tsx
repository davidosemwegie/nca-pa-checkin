import React, { useState } from "react";
import { useGetUser } from "../../lib/events/use-get-user";
// @ts-ignore
import greetingTime from "greeting-time";

const Greeting = () => {
  const { firstName } = useGetUser();
  const greetingText = greetingTime(new Date());

  if (!firstName) return null;

  return (
    <p className="font-bold text-3xl">
      {greetingText}, {firstName}
    </p>
  );
};

export { Greeting };
