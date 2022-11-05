import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "@/utils/prisma";
import { getRandomMember } from "@/utils/getRandomMember";

export const exampleRouter = router({
  //Edit this
  getDaoMemberIds: publicProcedure
    .input(
      z.object({
        selfId: z.string(),
      })
    )
    .query(async ({ input }) => {
      //Grab Everyone's id but self
      return await prisma.daoMember.findMany({
        where: {
          OR: [
            {
              userId: null,
            },
            {
              NOT: [{ userId: input.selfId }],
            },
          ],
        },
        select: {
          id: true,
        },
      });
    }),
  getTwoMembers: publicProcedure
    .input(
      z.record(
        z
          .object({
            id: z.string(),
          })
          .array()
          .nullish()
      )
    )
    .query(async ({ input }) => {
      //Technically nullish, but query won't run till input data exists on frontend
      //Need this for typescript not liking potentially null values
      let firstId = "";
      let secondId = "";
      if (input.allIds) {
        firstId = getRandomMember(input.allIds);
        secondId = getRandomMember(input.allIds, firstId);
      }
      //Pick 2 random, unique ids

      const BothMembers = await prisma.daoMember.findMany({
        where: {
          id: {
            in: [firstId, secondId],
          },
        },
      });

      if (BothMembers.length !== 2)
        throw new Error("Failed to find two Members");
      //Change this to randomize first or second
      const randomNumber = Math.random();

      return randomNumber > 0.5
        ? { firstMember: BothMembers[0], secondMember: BothMembers[1] }
        : { firstMember: BothMembers[1], secondMember: BothMembers[0] };
    }),
  voteForMember: publicProcedure
    .input(
      z.object({
        votedFor: z.string(),
        votedAgainst: z.string(),
        voterId: z.string().nullish(),
      })
    )
    .mutation(async ({ input }) => {
      const voteInDb = await prisma.vote.create({
        data: {
          votedForId: input.votedFor,
          votedAgainstId: input.votedAgainst,
        },
      });

      if (input.voterId) {
        await prisma.daoMember.update({
          where: {
            userId: input.voterId,
          },
          data: {
            votesCast: { increment: 1 },
          },
        });
      }
      return { success: true, vote: voteInDb };
    }),
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
