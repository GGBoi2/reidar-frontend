import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "@/utils/prisma";
import { getRandomMember } from "@/utils/getRandomMember";

export const exampleRouter = router({
  getTwoMembers: publicProcedure.query(async () => {
    const allIds = await prisma.daoMember.findMany({
      select: {
        id: true,
      },
    });

    //Pick 2 random, unique ids
    //Change this to prevent self-showing up
    const firstId = getRandomMember(allIds);
    const secondId = getRandomMember(allIds, firstId);

    const BothMembers = await prisma.daoMember.findMany({
      where: { id: { in: [firstId, secondId] } },
    });

    if (BothMembers.length !== 2) throw new Error("Failed to find two Members");
    //Change this to randomize first or second
    return { firstMember: BothMembers[0], secondMember: BothMembers[1] };
  }),
  voteForMember: publicProcedure
    .input(
      z.object({
        votedFor: z.string(),
        votedAgainst: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const voteInDb = await prisma.vote.create({
        data: {
          votedForId: input.votedFor,
          votedAgainstId: input.votedAgainst,
        },
      });
      return { success: true, vote: voteInDb };
    }),
  claimDaoMember: publicProcedure
    .input(
      z.object({
        claimingUserId: z.string(),
        daoMemberId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await prisma.daoMember.update({
        where: { id: input.daoMemberId },
        data: { userId: input.claimingUserId },
      });
    }),
  checkClaim: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await prisma.user.findFirst({
        where: {
          id: input.id, //Need Hacky fix on account.tsx because weird TS error. Not sure what StringFilter is
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
      },
    });
  }),
  getUnclaimedMembers: publicProcedure.query(async () => {
    return await prisma.daoMember.findMany({
      select: {
        id: true,
        name: true,
      },
      where: {
        userId: null,
        discordId: null,
      },
    });
  }),
});
