import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "@/utils/prisma";

export const exampleRouter = router({
  claimDaoMember: publicProcedure
    .input(
      z.object({
        claimingUserId: z.string(),
        daoMemberId: z.string(),
        name: z.string().nullish(),
        image_url: z.string().nullish(),
      })
    )
    .mutation(async ({ input }) => {
      //If image & name exist, include in database update
      if (input.image_url && input.name) {
        await prisma.daoMember.update({
          where: { id: input.daoMemberId },
          data: {
            userId: input.claimingUserId,
            image_url: input.image_url,
            name: input.name,
          },
        });
      } else {
        await prisma.daoMember.update({
          where: { id: input.daoMemberId },
          data: {
            userId: input.claimingUserId,
          },
        });
      }
    }),
  checkClaim: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await prisma.user.findFirst({
        where: {
          id: input.id,
          NOT: { daoMember: null },
        },
      });
    }),
  getDaoMemberData: publicProcedure
    .input(
      z.object({
        id: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      return await prisma.daoMember.findFirst({
        select: {
          name: true,
          roles: true,
          image_url: true,
          biography: true,
          contributions: true,
        },
        where: {
          userId: input.id,
        },
      });
    }),
  updateDaoMember: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string(),
        roles: z.string(),
        image_url: z.string(),
        biography: z.string(),
        contributions: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await prisma.daoMember.update({
        where: {
          userId: input.userId,
        },
        data: {
          biography: input.biography,
          contributions: input.contributions,
        },
      });
    }),
  getMembersInOrder: publicProcedure.query(async () => {
    return await prisma.daoMember.findMany({
      orderBy: { votesFor: { _count: "desc" } },
      select: {
        id: true,
        name: true,
        image_url: true,
        _count: {
          select: {
            votesFor: true,
            votesAgainst: true,
          },
        },
        votesCast: true,
      },
    });
  }),
  getScores: publicProcedure.query(async () => {
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

    //Get All Users
    const userData = await prisma.daoMember.findMany({
      select: {
        id: true,
        name: true,
        image_url: true,
        votesCast: true,
      },
    });

    //   --- Request all Votes from current period ---
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

    //Create score array to keep track of user results
    const scoreArray: {
      id: string;
      name: string;
      image_url: string;
      votesFor: number;
      votesAgainst: number;
      votesCast: boolean;
    }[] = [];
    userData.map((user) => {
      scoreArray.push({
        id: user.id,
        name: user.name,
        image_url: user.image_url,
        votesFor: 0,
        votesAgainst: 0,
        votesCast: Boolean(user.votesCast),
      });
    });
    //Generate scores
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

    //Replace votedFor/Against fields with score & sort
    const results = scoreArray
      .map((score) => {
        return {
          id: score.id,
          name: score.name,
          image_url: score.image_url,
          score:
            score.votesFor - score.votesAgainst + (score.votesCast ? 1 : 0),
          hasVoted: score.votesCast,
        };
      })
      .sort((a, b) => a.score - b.score);

    return results;
  }),
});
