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
      },
    });
  }),
  getTwoMembers: publicProcedure
    .input(
      z.record(
        z
          .object({
            id: z.string(),
            appearances: z.number(),
          })
          .array()
          .nullish()
      )
    )
    .query(async ({ input }) => {
      let firstId = "";
      let secondId = "";

      let result = { id: "", index: 0 };
      let minShowings = 1000; //arbitrary high number

      //10% chance to select lowest appearances for first id
      if (Math.random() < 0.1) {
        //Generate array of all the lowest appearance members
        const lowAppearances = input.allIds
          ?.map((member) => {
            minShowings = Math.min(member.appearances, minShowings);
            return member;
          })
          .filter((member) => member.appearances === minShowings);

        //Select member randomly from lowest appearance array
        if (lowAppearances) {
          const index = Math.floor(Math.random() * lowAppearances?.length);
          firstId = lowAppearances[index].id;
          result.index = index;
        }
        //Otherwise, just select someone random
      } else if (input.allIds) {
        result = getFirstMember(input.allIds);
        firstId = result.id;
      }
      if (input.allIds) {
        secondId = getSecondMember(input.allIds, firstId, result.index);
      }

      //Gather Data on the selected Ids
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

      return { success: true, vote: voteInDb };
    }),
  //Manage
  updateVoter: publicProcedure
    .input(
      z.object({
        voterId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await prisma.daoMember.update({
        where: {
          userId: input.voterId,
        },
        data: {
          votesCast: { increment: 1 },
        },
      });
    }),
  getVotingPeriod: publicProcedure.query(async () => {
    const date = new Date(Date.now()); //Use Class to access toISOString function
    const currentTime = date.toISOString(); // Match Prisma typing

    return await prisma.votingPeriod.findFirst({
      where: {
        startTime: { lte: currentTime },
        endTime: { gte: currentTime },
      },
    });
  }),
});
