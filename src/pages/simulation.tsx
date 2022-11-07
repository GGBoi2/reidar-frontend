import type { NextPage } from "next";
import { useState } from "react";

import Header from "src-components/Header";
import Simulate from "@/../scripts/vote-simulation";
import type { Result } from "@/../scripts/vote-simulation";
import { Line } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Simulation: NextPage = () => {
  const [voteNumbers, setVoteNumber] = useState<number[]>([]);
  const [testSize, setTestSize] = useState<number>(0);
  const [options, setOptions] = useState({
    pureRandom: true,
    maxAppearances: false,
    closeInRank: false,
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  // const [data, setData] = useState<{
  //   labels: string[],
  //   datasets: number[],
  //   fill: boolean
  // }>();
  const [data, setData] = useState<ChartData<"line">>({
    datasets: [
      {
        label: "First Dataset",
        data: [0, 1, 2],
      },
    ],
    labels: ["a", "b", "c"],
  });
  const maxVotes = 3000;
  const maxDaoSize = 100;

  //Add Errors for if you go over the max limit
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

  const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);
    const results = Simulate(voteNumbers, testSize, options);

    const intermediateData: ChartData<"line"> = {
      datasets: [
        {
          label: "First Dataset",
          data: [results[0].error, results[1].error, results[2].error],
        },
      ],
      labels: [
        String(results[0].n),
        String(results[1].n),
        String(results[2].n),
      ],
    };
    setData(intermediateData);
  };

  //Flex Your Muscles - Give options for what algorithm changes we want to see: JSON object
  //Pure Random, max appearances, mix of +-5 rankings & random

  //Error Calculation Method: String of text

  //Chart Displaying Rank Results with toggle for different voting amounts vs true rank
  //Chart Diplaying error vs. N

  return (
    <>
      <Header />
      {!hasSubmitted && (
        <div className=" flex flex-col items-center">
          <form className="" onSubmit={(e) => onSubmitHandler(e)}>
            <div className="flex justify-center p-2 text-xl">
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
      {hasSubmitted && (
        <>
          <div className=" flex flex-col items-center">
            <Line data={data} />
          </div>
        </>
      )}
    </>
  );
};

export default Simulation;
