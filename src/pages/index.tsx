import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";

import { trpc } from "../utils/trpc";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { theGameRouter } from "@/server/trpc/router/theGame";
import { createContextInner } from "@/server/trpc/context";
import superjson from "superjson";
import { AppRouterTypes } from "../utils/trpc";

import Header from "src-components/Header";
import MemberCard from "src-components/index/MemberCard";
import { useSession } from "next-auth/react";

//Rework the Game
const Home: NextPage = (props: any) => {
  //Fetch 2 Members

  const { data: session } = useSession();
  const [hasClaimedMember, setHasClaimedMember] = useState(false);
  const [canVote, setCanVote] = useState(false);
  const [voteCount, setVoteCount] = useState(0);

  const maxVoteCount = 30; //Prod is 30
  let minShowings = 100; //Arbitrarily High number to be reduced
  const closeBuffer = 3; //Difference in number of appearances between min & max

  //Fetch all Ids once for the whole session rather than on each vote
  const { data: allDaoMemberIds, refetch: refreshData } =
    trpc.theGame.getDaoMemberIds.useQuery(undefined, {
      enabled: Boolean(session),
      refetchInterval: 1000 * 60 * 10,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    });

  //----Before Query----
  //Grab session's member so that I can check to see if they can still vote
  let userMember: DaoMember[number] | undefined;
  //Remove user's daoMember from pickable list
  const sortedData = allDaoMemberIds
    ?.map((member) => {
      const rawScore = member._count.votesFor - member._count.votesAgainst;
      const appearances = member._count.votesFor + member._count.votesAgainst;

      //Get the user's data
      if (session && member.userId === session.user.id) {
        userMember = member;
      }

      //Get the minShowings from non-user members. In dev, dev user has 0 votes because they cannot appear
      if (session && member.userId !== session.user.id) {
        minShowings = Math.min(appearances, minShowings);
      }
      return {
        id: member.id,
        userId: member.userId,
        rawScore: rawScore,
        appearances: appearances,
      };
    })
    //Remove members that have crossed voting threshold & remove user profile
    .filter((member) => {
      if (
        session &&
        member.userId !== session.user.id &&
        member.appearances <= minShowings + closeBuffer
      ) {
        return member;
      }
    })
    //Sort Data by rawScore
    .sort((a, b) => b.rawScore - a.rawScore);

  //Set if they can vote & set initial vote count of voter
  useEffect(() => {
    if (userMember?.votesCast !== maxVoteCount && userMember) {
      setCanVote(true);

      if (userMember.votesCast) {
        setVoteCount(userMember.votesCast);
      }
    }
  }, [userMember]);

  //Pick 2 members for voting. 50% random, 50% close in rank
  const { data: memberPair, refetch: getNewPair } =
    trpc.theGame.getTwoMembers.useQuery(
      { allIds: sortedData },
      {
        enabled: Boolean(sortedData) && hasClaimedMember,
        refetchInterval: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      }
    );

  //----Voting----
  const voteMutation = trpc.theGame.voteForMember.useMutation();
  const updateVoter = trpc.theGame.updateVoter.useMutation();
  const voteForMember = async (selected: string) => {
    //Ensure that we have the data or else TS throws undefined errors
    if (!memberPair) return;

    //Vote for first option
    if (selected === memberPair.firstMember.id) {
      voteMutation.mutate({
        votedFor: memberPair.firstMember.id,
        votedAgainst: memberPair.secondMember.id,
      });
    } else {
      //Vote for second option
      voteMutation.mutate({
        votedFor: memberPair.secondMember.id,
        votedAgainst: memberPair.firstMember.id,
      });
    }

    //Updates immediately in code execution
    const currentCount = voteCount + 1;

    //Halfway through vote, update dao member data with information from new votes.

    //Updates on Rerender
    setVoteCount(voteCount + 1);

    if (currentCount >= maxVoteCount) {
      setCanVote(false);
    }

    if (session?.user) {
      updateVoter.mutate({
        voterId: session.user.id,
      });
    }
    if (voteCount % 10 === 0 && voteCount !== 0) {
      await timeout(500);
      refreshData();
    } else {
      getNewPair();
    }
  };
  function timeout(delay: number) {
    return new Promise((res) => setTimeout(res, delay));
  }

  //Check to see if user has Dao Member which means eligible to play in "The Game"
  trpc.example.checkClaim.useQuery(
    { id: session?.user.id },
    {
      enabled: Boolean(session?.user.id),
      onSuccess(data) {
        if (data) {
          setHasClaimedMember(true);
        }
      },
      refetchInterval: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  //Check to see if there is an active voting period
  const votingPeriod = trpc.theGame.getVotingPeriod.useQuery(undefined, {
    refetchInterval: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <Head>
        <title>The Game</title>
        <meta
          name="desciption"
          content="Cast your votes against fellow DAO members to determine who will win the
				most VBUCKS!"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <div className="relative flex  w-screen flex-col items-center justify-center">
        <div className=" top-0 mt-8 mb-2 text-center text-2xl">
          <div>Choose a Dao Member</div>
        </div>

        <div className="">
          {/* Query returns 2 members & account has a valid dao member tied to it */}
          {memberPair && hasClaimedMember && canVote && (
            <div className="flex flex-col items-center justify-between">
              <div className="p-2 text-xl">
                You have {maxVoteCount - voteCount} votes left to cast
              </div>
              <div className="rounder flex items-center justify-between border p-8 lg:flex-col">
                <MemberCard
                  member={memberPair.firstMember}
                  vote={() => voteForMember(memberPair.firstMember.id)}
                />
                <div className="p-16 text-2xl">Vs</div>
                <MemberCard
                  member={memberPair.secondMember}
                  vote={() => voteForMember(memberPair.secondMember.id)}
                />
              </div>
            </div>
          )}
          {memberPair && hasClaimedMember && !canVote && (
            <div>You have cast all of your votes for this period.</div>
          )}
          {/* Query is loading & account exists & has dao member tied to it */}
          {!memberPair && session?.user.id && hasClaimedMember && (
            <Image src="/loading-spinner.svg" width={256} height={256} alt="" />
          )}
          {/* Account exists but has not claimed a dao member */}
          {session?.user.id && !hasClaimedMember && (
            <div>
              You must claim your Dao Member on the account tab before you can
              vote in the game.
            </div>
          )}
          {/* User not signed in */}
          {!session?.user.id && (
            <div>You must sign in to participate in The Game</div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;

//Type Assignments
type DaoMember = AppRouterTypes["theGame"]["getDaoMemberIds"]["output"];

//SSG
export const getStaticProps = async () => {
  const ssg = createProxySSGHelpers({
    router: theGameRouter,
    ctx: await createContextInner({ session: null }),
    transformer: superjson,
  });

  const memberIds = await ssg.getDaoMemberIds.fetch();

  const serverTime = Date.now();

  return {
    props: {
      trpcState: ssg.dehydrate(),
      serverTime: serverTime,
      memberIds: memberIds,
    },
    revalidate: 1,
  };
};
