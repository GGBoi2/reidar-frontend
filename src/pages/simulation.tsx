import type { NextPage } from "next";
import { useState } from "react";

import Header from "src-components/Header";
import Simulate from "@/../scripts/vote-simulation";

import LineGraph from "src-components/LineGraph";

type LineData = {
  xAxis: string[];
  yAxis: number[];
  lineOptions: Record<string, unknown>;
};

const Simulation: NextPage = () => {
  const [voteNumbers, setVoteNumber] = useState<number[]>([]);
  const [testSize, setTestSize] = useState<number>(0);
  const [options, setOptions] = useState({
    pureRandom: true,
    maxAppearances: false,
    closeInRank: false,
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [data, setData] = useState<LineData>();
  const maxVotes = 8000;
  const maxDaoSize = 100;

  //Add Errors for if you go over the max limit
  //Get Form inputs and format correctly
  const inputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === "VoteCounts") {
      const numberArray = value
        .split(",")
        .map((number) => {
          return Number(number);
        })
        .filter((item) => item < maxVotes);

      setVoteNumber(numberArray);
    }

    if (name === "DaoSize") {
      const size = Number(value);
      if (size < maxDaoSize) {
        setTestSize(size);
      }
    }

    //There's definitely a smarter way to do this lol
    if (name === "pureRandom") {
      setOptions({ ...options, pureRandom: !options.pureRandom });
    }
    if (name === "maxAppearances") {
      setOptions({ ...options, maxAppearances: !options.maxAppearances });
    }
    if (name === "closeInRank") {
      setOptions({ ...options, closeInRank: !options.closeInRank });
    }
  };

  //Do Simulation on Form Submit.
  const voteSizes: string[] = [];
  const errorVals: number[] = [];
  const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const results = await Simulate(voteNumbers, testSize, options);
    //Format Results in usable form
    results.map((result) => {
      voteSizes.push(String(result.n));
      errorVals.push(result.error);
    });
    //Update Data set based on the calculated data
    setData({
      xAxis: voteSizes,
      yAxis: errorVals,
      lineOptions: options,
    });

    //Render Graph
    setHasSubmitted(true);
  };

  return (
    <>
      <Header />
      {/* Determine the parameters of the simulation */}
      {!hasSubmitted && (
        <div className=" flex flex-col items-center">
          <form className="" onSubmit={(e) => onSubmitHandler(e)}>
            <div className="mb-4 flex justify-center p-2 text-xl">
              Configure the Simulation
            </div>

            <div className="w-100 flex flex-grow flex-col">
              <label>Number of Votes to test</label>
              <input
                className="m-2   p-1 text-black"
                name="VoteCounts"
                onChange={(e) => inputChangeHandler(e)}
              />
            </div>
            <div className="w-100 flex  flex-col">
              <label>Number of Dao Members to test</label>
              <input
                className="m-2   p-1 text-black"
                name="DaoSize"
                onChange={(e) => inputChangeHandler(e)}
              />
            </div>
            <div className="w-100 m-2 flex flex-col">
              <div className="flex justify-between">
                <label htmlFor="pureRandom">Purely Random</label>

                <input
                  className=""
                  type={"checkbox"}
                  id={"pureRandom"}
                  checked={options.pureRandom}
                  onChange={(e) => inputChangeHandler(e)}
                  name="pureRandom"
                />
              </div>
              <div className="flex justify-between">
                <label htmlFor="maxAppearances">Cap Maximum Appearances</label>

                <input
                  type={"checkbox"}
                  id={"maxAppearances"}
                  checked={options.maxAppearances}
                  onChange={(e) => inputChangeHandler(e)}
                  name="maxAppearances"
                />
              </div>
              <div className="flex justify-between">
                <label htmlFor="closeInRank">Vote Pairs have close rank</label>
                <input
                  type={"checkbox"}
                  id={"closeInRank"}
                  checked={options.closeInRank}
                  onChange={(e) => inputChangeHandler(e)}
                  name="closeInRank"
                />
              </div>
            </div>

            <button className="button" type="submit">
              Submit
            </button>
          </form>
        </div>
      )}
      {/* Show the Results Graph */}
      {hasSubmitted && (
        <div className="m-8 mx-auto flex max-w-6xl flex-col items-center ">
          <div className="mb-4">
            {/* ALlow someone to reset & generate new graph */}
            <button
              className="border border-white p-1"
              onClick={() => {
                setHasSubmitted(false);
                setData(undefined);
                setOptions({
                  pureRandom: true,
                  maxAppearances: false,
                  closeInRank: false,
                });
              }}
            >
              Create Another Chart
            </button>
          </div>
          {/* Create Graph if data */}
          {data && (
            <LineGraph
              options={data.lineOptions}
              xAxis={data.xAxis}
              yAxis={data.yAxis}
            />
          )}
        </div>
      )}
    </>
  );
};

export default Simulation;
