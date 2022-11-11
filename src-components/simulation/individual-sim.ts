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
  const members = [...emptyArray].map((member, index) => {
    return {
      rank: index + 1,
      votesFor: 0,
      votesAgainst: 0,
      rawScore: 0,
      appearances: 0,
      pickable: true,
    };
  });

  //Get a random number depending on the algorithm flags
  const getRandomNumber: (notThisOne?: number, pickSize?: number) => number = (
    notThisOne?,
    pickSize?
  ) => {
    //Choose within 10 values of the first selected option everytime
    if (pickSize && notThisOne) {
      let index = 0;
      const randomRoll =
        Math.floor(Math.random() * pickSize) - Math.round(pickSize / 2);
      //Shift value if index would go outside of array range based on random roll
      if (randomRoll + notThisOne < 0) {
        index = pickSize / 2 - randomRoll;
      } else if (randomRoll + notThisOne > members.length - 1) {
        index = members.length - 1 - (pickSize / 2 + randomRoll);
      } else {
        index = notThisOne + randomRoll;
      }

      if (members[index].pickable && index !== notThisOne) {
        return index;
      } else {
        return getRandomNumber(notThisOne, pickSize);
      }
    }

    //Choose a random number for PureRandom/MaxAppearances cases
    const index = Math.floor(Math.random() * members.length);

    if (members[index].pickable && index !== notThisOne) {
      return index;
    } else {
      return getRandomNumber(notThisOne);
    }
  };

  //Create Voting Logic against the database
  const castVote = () => {
    let indexOne = 0;
    let indexTwo = 0;
    //Add check to make sure they aren't the same number
    const random = Math.random();
    if (
      (options.algoName === "closeInRank" ||
        options.algoName === "closeAndMax") &&
      options.state &&
      random < 0.5
    ) {
      indexOne = getRandomNumber();

      const pickSize = 20;

      indexTwo = getRandomNumber(indexOne, pickSize);
    } else {
      indexOne = getRandomNumber();
      indexTwo = getRandomNumber(indexOne);
    }

    //Smaller rank means closer to rank 1
    const winner =
      members[indexOne].rank < members[indexTwo].rank ? indexOne : indexTwo;
    const loser =
      members[indexOne].rank < members[indexTwo].rank ? indexTwo : indexOne;

    //Update Database
    members[winner].votesFor += 1;
    members[winner].rawScore += 1;
    members[winner].appearances += 1;

    members[loser].votesAgainst += 1;
    members[loser].rawScore -= 1;
    members[loser].appearances += 1;
  };

  //Create Filtering Logic for Max Appearances
  let noPickCount = 0;

  for (let i = 0; i < maxVotes; i++) {
    //Max Appearances logic

    if (
      (options.algoName === "maxAppearances" ||
        options.algoName === "closeAndMax") &&
      options.state
    ) {
      //Every 10 votes, remove members that have reached the voting threshold from the pool
      if (i % 10 === 0) {
        members.map((member, index) => {
          if (options.algoName === "maxAppearances") {
            if (member.appearances >= maxTimesShown && member.pickable) {
              member.pickable = false;
              noPickCount++;
            }
          }
          if (options.algoName === "closeAndMax") {
            if (member.appearances >= maxTimesShown * 4 && member.pickable) {
              member.pickable = false;
              noPickCount++;
            }
          }
        });
      }
      //Once x% of members have reached limit, stop voting
      if (noPickCount <= Math.floor(daoSize * 0.9)) {
        castVote();
      } else {
        console.log("I broke at " + i);
        break;
      }
    }

    //Pick 50% random and 50% for ranks within 10 of current rank
    if (
      (options.algoName === "closeInRank" ||
        options.algoName === "closeAndMax") &&
      options.state
    ) {
      if (i % 100 === 0) {
        members.sort((a, b) => b.rawScore - a.rawScore);
      }
      castVote();
    }

    //Pick completely random
    if (options.algoName === "pureRandom" && options.state) {
      castVote();
    }
  }

  //Calculate Errors
  let totalError = 0;
  const sortedMembers = members.sort((a, b) => b.rawScore - a.rawScore);
  sortedMembers.map((member, index) => {
    totalError += (member.rank - 1 - index) ** 2;
  });

  return totalError;
};

export default individualSim;
