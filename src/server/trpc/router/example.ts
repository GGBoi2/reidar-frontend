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

    const firstId = getRandomMember(allIds);
    const secondId = getRandomMember(allIds, firstId);

    const BothMembers = await prisma.daoMember.findMany({
      where: { id: { in: [firstId, secondId] } },
    });

    if (BothMembers.length !== 2) throw new Error("Failed to find two Members");
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
});
