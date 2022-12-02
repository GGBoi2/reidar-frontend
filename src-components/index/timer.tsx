import React, { useState, useEffect } from "react";
import Head from "next/head";

const Timer: React.FC<{ endTime: number; serverTime: number }> = (props) => {
  const [activeVotingPeriod, setActiveVotingPeriod] = useState(true);
  const [timeString, setTimeString] = useState("");

  const [currentTime, setCurrentTime] = useState<number>(props.serverTime);
  const endTime = props.endTime; //Alter this so that it awaits some prisma value

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentTime && currentTime >= endTime) {
      // setActiveVotingPeriod(false);
    }
  }, [endTime, currentTime]);

  useEffect(() => {
    let milliRemaining = endTime - currentTime;
    let stringRemaining;

    // Calculate the remaining time in days, hours, minutes, and seconds
    const days = Math.floor(milliRemaining / (1000 * 60 * 60 * 24));

    milliRemaining -= days * 1000 * 60 * 60 * 24;

    const hours = Math.floor(milliRemaining / (1000 * 60 * 60));
    milliRemaining -= hours * 1000 * 60 * 60;

    const minutes = Math.floor(milliRemaining / (1000 * 60));
    milliRemaining -= minutes * 1000 * 60;

    const seconds = Math.floor(milliRemaining / 1000);
    milliRemaining -= seconds * 1000;

    // Use a ternary operator to remove the plural when there is only one day, hour, minute, or second remaining
    const plural = (value: number) => (value === 1 ? "" : "s");

    // Assign the appropriate string value based on the remaining time
    if (days >= 3) {
      stringRemaining = `${days} day${plural(days)} remaining`;
    } else if (days > 0) {
      stringRemaining = `${days} day${plural(days)} and ${hours} hour${plural(
        hours
      )} remaining`;
    } else if (hours > 0) {
      stringRemaining = `${hours} hour${plural(
        hours
      )} and ${minutes} minute${plural(minutes)} remaining`;
    } else {
      stringRemaining = `${minutes} minute${plural(
        minutes
      )} and ${seconds} second${plural(seconds)} remaining`;
    }

    // Update the state with the new time string

    setTimeString(stringRemaining);
  }, [currentTime]);

  //{Math.max(0, Math.round((endTime - currentTime) / 1000))}
  return (
    <div className="container mx-auto">
      <div className="py-4">
        {activeVotingPeriod ? (
          <div className="text-xl font-bold">{timeString}</div>
        ) : (
          <div className="text-xl font-bold">
            There is no active Voting Period
          </div>
        )}
      </div>
    </div>
  );
};

export default Timer;
