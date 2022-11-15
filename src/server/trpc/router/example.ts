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
