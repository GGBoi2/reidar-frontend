import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "@/utils/prisma";
import { getFirstMember, getSecondMember } from "@/utils/getRandomMember";

export const theGameRouter = router({
  //Edit this. Get all IDs. Pop user's ID from the stack on the front end instead of in the query
  getDaoMemberIds: publicProcedure.query(async () => {
    //Grab Everyone's id. Pop self on front end
    return await prisma.daoMember.findMany({
      select: {
        id: true,
        userId: true,
        votesCast: true,
        _count: {
          select: {
            votesFor: true,
            votesAgainst: true,
          },
        },
        ableToVote: true,
        pickable: true,
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
      let firstId = "";
      let secondId = "";

      if (input.allIds) {
        const result = getFirstMember(input.allIds);
        firstId = result.id;

        secondId = getSecondMember(input.allIds, firstId, result.index);
      }
      //Pick 2 random, unique ids

      const BothMembers = await prisma.daoMember.findMany({
        where: {
          id: {
            in: [firstId, secondId],
          },
        },
        include: {
          _count: {
            select: {
              votesFor: true,
              votesAgainst: true,
            },
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

        forPickable: z.boolean().optional(),
        againstPickable: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      //Cast the votes in the database
      const voteInDb = await prisma.vote.create({
        data: {
          votedForId: input.votedFor,
          votedAgainstId: input.votedAgainst,
        },
      });

      //Only run if pickable has changed to false
      if (input.forPickable === false) {
        await prisma.daoMember.update({
          where: {
            id: input.votedFor,
          },
          data: {
            pickable: input.forPickable,
          },
        });
      }

      if (input.againstPickable === false) {
        await prisma.daoMember.update({
          where: {
            id: input.votedAgainst,
          },
          data: {
            pickable: input.againstPickable,
          },
        });
      }

      //Track number of times appeared & determine pickable
      return { success: true, vote: voteInDb };
    }),
  //Manage
  updateVoter: publicProcedure
    .input(
      z.object({
        voterId: z.string(),
        ableToVote: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      await prisma.daoMember.update({
        where: {
          userId: input.voterId,
        },
        data: {
          ableToVote: input.ableToVote,
          votesCast: { increment: 1 },
        },
      });
    }),
});
