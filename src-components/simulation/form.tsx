import React, { useState } from "react";

import totalSim from "./total-sim";

export type LineData = {
  xAxis: string[];
  yAxis: number[];
  lineName: string;
  sampleSize: number;
}[];

//Set Props & typing for form
const Form: React.FC<{
  lineData?: LineData;
  setLineData: React.Dispatch<React.SetStateAction<LineData | undefined>>;
  setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ lineData, setLineData, setSubmitted }) => {
  //Actually code starts lol
  const [voteNumbers, setVoteNumber] = useState<number[]>([]);
  const [testSize, setTestSize] = useState<number>(0);
  const [options, setOptions] = useState({
    pureRandom: true,
    maxAppearances: false,
    closeInRank: false,
  });
  //   const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const maxVotes = 10000;
  const maxDaoSize = 100;

  //Add Errors for if you go over the max limit
  //Get Form inputs and format correctly
  const inputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === "VoteCounts") {
      const numberArray = value.split(",").map((number) => {
        return Number(number);
      });

      setVoteNumber(numberArray);
    }

    if (name === "DaoSize") {
      const size = Number(value);

      setTestSize(size);
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

  const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      if (testSize > maxDaoSize) {
        setErrorMessage(`The max test size is ${maxDaoSize}`);
        throw `The max test size is ${maxDaoSize}`;
      }
      if (voteNumbers.some((count) => count > maxVotes)) {
        setErrorMessage(`The max vote option is ${maxVotes}`);
        throw `The max vote option is ${maxVotes}`;
      }

      // const results = await Simulate(voteNumbers, testSize, options);
      const results = await totalSim(voteNumbers, testSize, options);

      const formattedResults: LineData = [];
      //Format Results in usable form
      results.map((algorithm) => {
        const voteSizes: string[] = [];
        const errorVals: number[] = [];
        let name = "";
        algorithm.map((soloRun) => {
          voteSizes.push(String(soloRun.voteCount));
          errorVals.push(soloRun.rankError);
          name = soloRun.algorithm;
        });

        formattedResults.push({
          xAxis: voteSizes,
          yAxis: errorVals,
          lineName: name,
          sampleSize: testSize,
        });

        //Update Data set based on the calculated data
      });

      setLineData(formattedResults);
      //Render Graph
      setSubmitted(true);
    } catch (err) {}
  };

  return (
    <>
      {/* Determine the parameters of the simulation */}

      <div className=" flex flex-col items-center">
        {errorMessage && <div className="bg-red-600 p-2">{errorMessage}</div>}
        <form className="" onSubmit={(e) => onSubmitHandler(e)}>
          <div className="mb-4 flex justify-center p-2 text-xl">
            Configure the Simulation
          </div>

          <div className="w-100 flex flex-grow flex-col">
            <label>Number of Votes: {maxVotes} Max</label>
            <input
              className="m-2   p-1 text-black"
              name="VoteCounts"
              placeholder="500, 1000, 2000, 4000"
              onChange={(e) => inputChangeHandler(e)}
            />
          </div>
          <div className="w-100 flex  flex-col">
            <label>Number of Dao Members: {maxDaoSize} Max</label>
            <input
              className="m-2   p-1 text-black"
              placeholder="63"
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
    </>
  );
};

export default Form;
