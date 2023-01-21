import React from "react";
// @ts-ignore
import greetingTime from "greeting-time";
import { useGetUserQuery } from "./queries/use-get-user-query";

const Greeting = () => {
  const { firstName } = useGetUserQuery();
  const greetingText = greetingTime(new Date());

  if (!firstName) return null;

  return (
    <p className="font-bold text-3xl">
      {greetingText}, {firstName}
    </p>
  );
};

export { Greeting };
