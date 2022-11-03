import type { NextPage } from "next";
import Head from "next/head";

import { trpc } from "../utils/trpc";
import Image from "next/image";
import type { GetInferenceHelpers } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/router/_app";

import Header from "src-components/Header";

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
                member={memberPair?.secondMember}
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

//Component for Creating MemberCard in The Game
type RouterInput = GetInferenceHelpers<AppRouter>;
type MemberFromSever =
  RouterInput["example"]["getTwoMembers"]["output"]["firstMember"];

const MemberCard: React.FC<{
  member: MemberFromSever;
  vote: () => void;
}> = (props) => {
  return (
    <div className="relative flex flex-col items-center">
      {props.member.image_url ? (
        <Image
          width={256}
          height={256}
          layout="fixed"
          src={`${props.member.image_url}`}
          alt=""
        />
      ) : (
        <div className=" h-64 min-h-full w-64">
          <p>No Profile Picture Submitted or Page Not Found</p>
        </div>
      )}
      <div className="mt-1 text-center text-xl capitalize">
        {props.member.name}
      </div>
      <div className="">
        {/*   Add Text Wrap */}
        Roles: {`${props.member.roles ? props.member.roles : "No Roles"}`}
      </div>
      <div className="my-4 h-full w-96 text-justify">
        {props.member.contributions
          ? props.member.contributions
          : props.member.biography
          ? props.member.biography
          : "No Biography Submitted"}
      </div>
      <button className="button  " onClick={() => props.vote()}>
        Vote
      </button>
    </div>
  );
};
