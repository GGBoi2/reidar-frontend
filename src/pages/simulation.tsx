import type { NextPage } from "next";

import Header from "src-components/Header";

const Simulation: NextPage = () => {
  //Give Options for what vote counts we want to check: 1-D Array
  //Give option for how large of dao members we want? Current is 63, up to 100 max

  //Give options for what algorithm changes we want to see: JSON object
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
