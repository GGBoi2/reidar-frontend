import type { NextPage } from "next";
import { useState } from "react";

import Header from "src-components/Header";

import LineGraph from "src-components/simulation/LineGraph";
import Form from "src-components/simulation/form";

const Simulation: NextPage = () => {
  const [options, setOptions] = useState({
    pureRandom: true,
    maxAppearances: false,
    closeInRank: false,
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [data, setData] = useState<LineData>();

  return (
    <>
      <Header />
      {/* Determine the parameters of the simulation */}
      {!hasSubmitted && (
        <Form
          lineData={data}
          setLineData={setData}
          setSubmitted={setHasSubmitted}
        />
      )}
      {/* Show the Results Graph */}
      {hasSubmitted && (
        <div className="m-8 mx-auto flex max-w-6xl flex-col items-center ">
          <div className="mb-4">
            {/* Allow someone to reset & generate new graph */}
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
              xAxisValues={data.xAxis}
              yAxisValues={data.yAxis}
              sampleSize={data.sampleSize}
            />
          )}
        </div>
      )}
    </>
  );
};

export default Simulation;

type LineData = {
  xAxis: string[];
  yAxis: number[];
  lineOptions: Record<string, unknown>;
  sampleSize: number;
};
