import individualSim from "./individual-sim";

const totalSim = (
  maxVotes: number[],
  daoSize: number,
  options: {
    pureRandom: boolean;
    maxAppearances: boolean;
    closeInRank: boolean;
  }
): Result[] => {
  const simCount = 100;

  //Only include true ones
  const datasets: Result[] = Object.entries(options).map(([key, value]) => {
    //Filter out false algo options

    const algoResult = maxVotes.map((voteAmount) => {
      let specificVoteError = 0;

      for (let j = 0; j < simCount; j++) {
        specificVoteError += individualSim(voteAmount, daoSize, {
          algoName: key,
          state: value,
        });
      }

      const averageRankError = Math.sqrt(
        specificVoteError / (simCount * daoSize)
      );
      return {
        voteCount: voteAmount,
        rankError: averageRankError,
        algorithm: key,
      };
    });

    return algoResult;
  });

  return datasets;
};

totalSim([1500, 2500, 4500], 63, {
  pureRandom: true,
  maxAppearances: true,
  closeInRank: false,
});

export default totalSim;
export type { Result };

type Result = {
  voteCount: number;
  rankError: number;
  algorithm: string;
}[];
