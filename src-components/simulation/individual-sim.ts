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

  const getRandomNumber: (
    noPicks: number[],
    notThisOne?: number,
    pickSize?: number
  ) => number = (noPicks, notThisOne?, pickSize?) => {
    //Choose within 10 values of the first selected option everytime
    if (pickSize && notThisOne) {
      //Determine the amount I need to shift the selection window up or down based on pre-chosen value

      let index = 0;
      const randomRoll =
        Math.floor(Math.random() * pickSize) - Math.round(pickSize / 2);

      if (randomRoll + notThisOne < 0) {
        index = pickSize / 2 - randomRoll;
      } else if (randomRoll + notThisOne > memberDatabase.length - 1) {
        index = memberDatabase.length - 1 - (pickSize / 2 + randomRoll);
      } else {
        index = notThisOne + randomRoll;
      }

      if (!noPicks.includes(index) && index !== notThisOne) {
        return index;
      } else {
        return getRandomNumber(noPicks, notThisOne);
      }
    }

    //Choose a random number
    const index = Math.floor(Math.random() * memberDatabase.length);

    if (!noPicks.includes(index) && index !== notThisOne) {
      return index;
    } else {
      return getRandomNumber(noPicks, notThisOne, pickSize);
    }
  };

  //Create Voting Logic against the database
  const castVote = (noPicks: number[]) => {
    let indexOne = 0;
    let indexTwo = 0;
    //Add check to make sure they aren't the same number
    const random = Math.random();
    if (options.algoName === "closeInRank" && options.state && random < 0.5) {
      indexOne = getRandomNumber(noPicks);

      const pickSize = 20;

      indexTwo = getRandomNumber(noPicks, indexOne, pickSize);
    } else {
      indexOne = getRandomNumber(noPicks);
      indexTwo = getRandomNumber(noPicks, indexOne);
    }

    //Smaller rank means closer to rank 1
    const winner =
      memberDatabase[indexOne].rank < memberDatabase[indexTwo].rank
        ? indexOne
        : indexTwo;
    const loser =
      memberDatabase[indexOne].rank < memberDatabase[indexTwo].rank
        ? indexTwo
        : indexOne;

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

    if (options.algoName === "closeInRank" && options.state) {
      if (i % 100 === 0) {
        memberDatabase.sort((a, b) => b.rawScore - a.rawScore);
      }
      castVote([]);
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
