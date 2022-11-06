import type { NextPage } from "next";

import Header from "src-components/Header";
import Simulate from "@/../scripts/vote-simulation";

const Simulation: NextPage = () => {
  //Give Options for what vote counts we want to check: 1-D Array
  const N = [500, 1000, 2000];
  //Give option for how large of dao members we want? Current is 63, up to 100 max
  const P = 63;

  const options = {
    pureRandom: false,
    maxAppearances: false,
    closeInRank: false,
  };
  console.log("test");

  //Flex Your Muscles - Give options for what algorithm changes we want to see: JSON object
  //Pure Random, max appearances, mix of +-5 rankings & random

  //Error Calculation Method: String of text

  //Chart Displaying Rank Results with toggle for different voting amounts vs true rank
  //Chart Diplaying error vs. N

  return (
    <>
      <Header />
    </>
  );
};

export default Simulation;
