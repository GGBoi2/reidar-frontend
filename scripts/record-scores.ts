import { prisma } from "../src/utils/prisma";

//npm run ts-node  ./scripts/reset-thegame.ts

const fillDB = async () => {
  // --- Get most recent Voting Period ---
  const VotingPeriod = await prisma.votingPeriod.findMany({
    orderBy: { endTime: "desc" },
    select: {
      title: true,
      startTime: true,
      endTime: true,
    },
    take: 1,
  });

  const latestVote = VotingPeriod[0];
  //   --- Request all Votes from current period ---
  const userData = await prisma.daoMember.findMany({
    select: {
      id: true,
      name: true,
      votesCast: true,
    },
  });

  const voteData = await prisma.vote.findMany({
    where: {
      createdAt: {
        gte: latestVote.startTime,
        lte: latestVote.endTime,
      },
    },
    select: {
      votedForId: true,
      votedAgainstId: true,
    },
    orderBy: {
      votedForId: "desc",
    },
  });
  const scoreArray: {
    id: string;
    name: string;
    votesFor: number;
    votesAgainst: number;
    votesCast: boolean;
  }[] = [];
  userData.map((user) => {
    scoreArray.push({
      id: user.id,
      name: user.name,
      votesFor: 0,
      votesAgainst: 0,
      votesCast: Boolean(user.votesCast),
    });
  });

  voteData.map((vote) => {
    scoreArray.map((score) => {
      if (vote.votedForId === score.id) {
        score.votesFor++;
      }
      if (vote.votedAgainstId === score.id) {
        score.votesAgainst++;
      }
    });
  });

  //Create votingRecord entries
  scoreArray.map(async (userScore) => {
    await prisma.votingRecord.create({
      data: {
        daoMemberId: userScore.id,
        rawScore:
          userScore.votesFor -
          userScore.votesAgainst +
          (userScore.votesCast ? 1 : 0),
        hasVoted: userScore.votesCast,
        votingTitle: latestVote.title,
      },
    });
  });
};
fillDB();
