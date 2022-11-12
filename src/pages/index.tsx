import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";

import { trpc } from "../utils/trpc";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { theGameRouter } from "@/server/trpc/router/theGame";
import { createContextInner } from "@/server/trpc/context";
import superjson from "superjson";

import Header from "src-components/Header";
import MemberCard from "src-components/index/MemberCard";
import { useSession } from "next-auth/react";

//Rework the Game
const Home: NextPage = () => {
  //Fetch 2 Members
  const { data: session } = useSession();
  const [hasClaimedMember, setHasClaimedMember] = useState(false);

  //Fetch all Ids once for the whole session rather than on each vote

  const { data: allDaoMemberIds } = trpc.theGame.getDaoMemberIds.useQuery(
    undefined,
    {
      refetchInterval: 1000 * 60 * 10,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  //----Before Query----
  //Remove user's daoMember from pickable list
  const filteredData = allDaoMemberIds
    ?.filter((member) => {
      if (session && member.userId !== session.user.id) return member;
    })
    .map((member) => {
      const rawScore = member._count.votesFor - member._count.votesAgainst;
      const appearances = member._count.votesFor + member._count.votesAgainst;

      return {
        id: member.id,
        userId: member.userId,
        rawScore: rawScore,
        appearances: appearances,
      };
    });

  //Sort Data
  const sortedData = filteredData?.sort((a, b) => b.rawScore - a.rawScore);

  //----During Query----

  //Determine 2 Id's to pick based on close in rank (50% of the time)

  //----Voting----
  //If vote pushes you over limit for appearances, then flip pickable to false

  const { data: memberPair, refetch } = trpc.theGame.getTwoMembers.useQuery(
    { allIds: sortedData },
    {
      enabled: Boolean(sortedData) && hasClaimedMember,
      refetchInterval: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  //Voting Logic
  const voteMutation = trpc.theGame.voteForMember.useMutation();
  const voteForMember = (selected: string) => {
    //Ensure that we have the data or else TS throws undefined errors
    if (!memberPair) return;

    //Vote for first option
    if (selected === memberPair.firstMember.id) {
      voteMutation.mutate({
        votedFor: memberPair.firstMember.id,
        votedAgainst: memberPair.secondMember.id,
        voterId: session?.user.id,
      });
    } else {
      //Vote for second option
      voteMutation.mutate({
        votedFor: memberPair.secondMember.id,
        votedAgainst: memberPair.firstMember.id,
        voterId: session?.user.id,
      });
    }

    refetch();
  };

  //Check to see if user has Dao Member which means eligible to play in "The Game"
  trpc.example.checkClaim.useQuery(
    { id: session?.user.id || "" }, //Hacky fix due to type error in checkClaim
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
        <div className=" top-0 mt-8 mb-4 text-center text-2xl">
          <div>Choose a Dao Member</div>
          {/* <div>You have cast (add feature soon) votes</div> */}
        </div>

        <div>
          {/* Query returns 2 members & account has a valid dao member tied to it */}
          {memberPair && hasClaimedMember && (
            <div className="rounder flex items-center justify-between border p-8">
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

//SSG
export const getStaticProps = async () => {
  const ssg = createProxySSGHelpers({
    router: theGameRouter,
    ctx: await createContextInner({ session: null }),
    transformer: superjson,
  });

  await ssg.getDaoMemberIds.fetch();

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 30,
  };
};
