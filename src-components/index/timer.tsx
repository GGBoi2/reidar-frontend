import React, { useState, useEffect } from "react";
import Head from "next/head";

const IndexPage = () => {
  const [activeVotingPeriod, setActiveVotingPeriod] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [endTime, setEndTime] = useState(Date.now() + 10000); //Alter this so that it awaits some prisma value

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentTime >= endTime) {
      setActiveVotingPeriod(false);
    }
  }, [currentTime, endTime]);

  return (
    <div className="container mx-auto">
      <Head>
        <title>Timer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-12">
        {activeVotingPeriod ? (
          <div className="text-4xl font-bold">
            {Math.max(0, Math.round((endTime - currentTime) / 1000))}
          </div>
        ) : (
          <div className="text-4xl font-bold">
            There is no active Voting Period
          </div>
        )}
      </main>
    </div>
  );
};

export default IndexPage;
