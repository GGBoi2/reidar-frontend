type Member = {
  rank: number;
  votesFor: number;
  votesAgainst: number;
  rawScore: number;
  appearances: number;
};

const individualSim: (
  maxVotes: number,
  daoSize: number,
  options: {
    [key: string]: boolean | string;
  }
) => number = (maxVotes, daoSize, options) => {
  //Set max amount if that algo is included
  const maxTimesShown = Math.floor((2 * maxVotes) / daoSize);

  //Create Member Database of length daoSize
  const emptyArray = Array<Member>(daoSize);
  const memberDatabase = [...emptyArray].map((member, index) => {
    return {
      rank: index + 1,
      votesFor: 0,
      votesAgainst: 0,
      rawScore: 0,
      appearances: 0,
    };
  });

  const getRandomNumber: (noPicks: number[], notThisOne?: number) => number = (
    noPicks,
    notThisOne?
  ) => {
    const index = Math.floor(Math.random() * memberDatabase.length);

    if (!noPicks.includes(index) && index !== notThisOne) {
      return index;
    } else {
      return getRandomNumber(noPicks, notThisOne);
    }
  };

  //Create Voting Logic against the database
  const castVote = (noPicks: number[]) => {
    //Add check to make sure they aren't the same number
    const indexOne = getRandomNumber(noPicks);
    const indexTwo = getRandomNumber(noPicks, indexOne);

    //Vote for higher ranked one
    const winner = indexOne < indexTwo ? indexOne : indexTwo;
    const loser = indexOne < indexTwo ? indexTwo : indexOne;

    //Update Database
    memberDatabase[winner].votesFor += 1;
    memberDatabase[winner].rawScore += 1;
    memberDatabase[winner].appearances += 1;

    memberDatabase[loser].votesAgainst += 1;
    memberDatabase[loser].rawScore -= 1;
    memberDatabase[loser].appearances += 1;
  };

  //Create Filtering Logic for Max Appearances
  const noPicks: number[] = [];
  for (let i = 0; i < maxVotes; i++) {
    //Max Appearances logic
    if (options.algoName === "maxAppearances" && options.state) {
      //Every 10 votes, remove members that have reached the voting threshold from the pool
      if (i % 10 === 0) {
        memberDatabase.map((member, index) => {
          if (member.appearances >= maxTimesShown && !noPicks.includes(index)) {
            noPicks.push(index);
          }
        });
      }
      //Once x% of members have reached limit, stop voting
      if (noPicks.length <= Math.floor(daoSize * 0.9)) {
        castVote(noPicks);
      } else {
        break;
      }
    }

    //No Algo alteration
    if (options.algoName === "pureRandom" && options.state) {
      castVote([]);
    }
  }

  //Calculate Errors
  let totalError = 0;
  const sortedMembers = memberDatabase.sort((a, b) => b.rawScore - a.rawScore);
  sortedMembers.map((member, index) => {
    totalError += (member.rank - 1 - index) ** 2;
  });

  return totalError;
};

export default individualSim;
