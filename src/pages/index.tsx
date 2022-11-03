import type { NextPage } from "next";
import Head from "next/head";

import { trpc } from "../utils/trpc";
import Image from "next/image";

import Header from "src-components/Header";
import MemberCard from "src-components/MemberCard";

const Home: NextPage = () => {
  //Fetch 2 Members
  const { data: memberPair, refetch } = trpc.example.getTwoMembers.useQuery(
    undefined,
    {
      refetchInterval: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  //Voting Logic
  const voteMutation = trpc.example.voteForMember.useMutation();
  const voteForMember = (selected: string) => {
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

    refetch();
  };

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
          Choose a Dao Member
        </div>

        <div>
          {memberPair && (
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
          {!memberPair && (
            <Image src="/loading-spinner.svg" width={256} height={256} alt="" />
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
