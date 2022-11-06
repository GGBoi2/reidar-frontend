import { prisma } from "@/utils/prisma";
import type { GetServerSideProps } from "next";

import { AppRouterTypes } from "@/utils/trpc";

import Header from "src-components/Header";
import MemberRow from "src-components/MemberRow";

const getMembersInOrder = async () => {
  //This is type defined in router/example.ts to match this. Should eventually use
  //ssg-helpers from trpc v10, but looks complicated to figure out and easier to just
  //manually keep these linked for now
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
};

//Type matching from router/example.ts
//Update if getMembersInOrder changes
type MemberQueryResult =
  AppRouterTypes["example"]["getMembersInOrder"]["output"];

//Score Logic for results page
const generateRawScore = (member: MemberQueryResult[number]) => {
  const { votesFor, votesAgainst } = member._count;
  const Score = votesFor - votesAgainst;
  return Score;
};

//Generate Results Page
const ResultsPage: React.FC<{ member: MemberQueryResult }> = (props) => {
  return (
    <>
      <Header />
      <div className="flex flex-col items-center text-slate-300">
        <h1 className="p-4 text-2xl text-white">Results</h1>
        <div className="p-4"></div>
        <div className="flex w-full max-w-2xl flex-col border">
          <div className="flex font-bold text-sm uppercase justify-start border-b bg-slate-600 py-1">
            <span className="pl-4 p-2">Rank</span>

            <span className="flex flex-grow justidy-start text-left p-2 pl-[70px]">Name</span>
            <span className="flex p-2 pr-4">Raw Score</span>
          </div>
          {props.member
            .sort((a, b) => generateRawScore(b) - generateRawScore(a))
            .map((currentMember: MemberQueryResult[number], index: number) => {
              return (
                <MemberRow
                  key={index}
                  rank={index + 1}
                  member={currentMember}
                  score={generateRawScore(currentMember)}
                />
              );
            })}
        </div>
      </div>
    </>
  );
};

export default ResultsPage;

//Fetch all members server side
export const getStaticProps: GetServerSideProps = async () => {
  const memberOrdered = await getMembersInOrder();

  return { props: { member: memberOrdered }, revalidate: 60 };
};
