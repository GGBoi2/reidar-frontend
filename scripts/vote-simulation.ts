type Result = {
  n: number;
  error: number;
}[];

function sim_pureRand(n: number, p: number) {
  const resultArray = [];
  for (let i = 0; i < n; i++) {
    const indexOne = Math.floor(Math.random() * p);
    const indexTwo = Math.floor(Math.random() * p);
    const highVal = indexOne < indexTwo ? indexOne : indexTwo;
    const lowerVal = indexOne < indexTwo ? indexTwo : indexOne;

    resultArray[i] = { voteFor: highVal, voteAgainst: lowerVal };
  }

  const scoreArray: number[] = Array.from(Array(p)).fill(0);
  resultArray.map((vote) => {
    const indexFor = vote.voteFor;
    const indexAgainst = vote.voteAgainst;

    scoreArray[indexFor] += 1;
    scoreArray[indexAgainst] -= 1;
  });

  type ArrayWithScore = {
    rank: number;
    score: number;
  }[];

  const arrayWithIndexAndScore: ArrayWithScore = scoreArray.map(
    (element, index) => {
      return { rank: index + 1, score: element };
    }
  );

  const sortedArray = arrayWithIndexAndScore.sort((a, b) => b.score - a.score);

  //calculate error
  let error = 0;
  sortedArray.map((result, index) => {
    error += (result.rank - (index + 1)) ** 2;
  });
  return error;
}

const Simulate = (
  N: number[],
  P: number,
  options: {
    pureRandom: boolean;
    maxAppearances: boolean;
    closeInRank: boolean;
  }
): Result => {
  const res: Result = [];

  const sim_count = 10000;

  for (let i = 0; i < N.length; i++) {
    let total_error = 0;

    for (let j = 0; j < sim_count; j++) {
      // do individual simulation
      let individual_error = 0;
      if (options.pureRandom) {
        individual_error = sim_pureRand(N[i], P);
      }
      // if different voting algothims, make those if statemnt to call

      total_error += individual_error;
    }

    res.push({ n: N[i], error: total_error / sim_count });
  }

  return res;
};

export default Simulate;
export type { Result };
