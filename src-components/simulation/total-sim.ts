import individualSim from "./individual-sim";

const totalSim = (
  maxVotes: number[],
  daoSize: number,
  options: {
    pureRandom: boolean;
    maxAppearances: boolean;
    closeInRank: boolean;
    closeAndMax: boolean;
  }
): Result[] => {
  const simCount = 100;

  //Only include true ones
  const datasets: Result[] = Object.entries(options).map(([key, value]) => {
    //Filtered out unselected options at graphing. Was easier to do there than here from a programming standpoint. Should be improved.

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

export default totalSim;
export type { Result };

type Result = {
  voteCount: number;
  rankError: number;
  algorithm: string;
}[];
