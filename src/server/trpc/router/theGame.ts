import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "@/utils/prisma";
import { getFirstMember, getSecondMember } from "@/utils/getRandomMember";

export const theGameRouter = router({
  //Edit this. Get all IDs. Pop user's ID from the stack on the front end instead of in the query
  getDaoMemberIds: publicProcedure.query(async () => {
    //Grab Everyone's id. Pop self on front end
    return await prisma.daoMember.findMany({
      where: {
        pickable: true,
      },
      select: {
        id: true,
        userId: true,
        _count: {
          select: {
            votesFor: true,
            votesAgainst: true,
          },
        },
        //Grab raw score here.
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
});
