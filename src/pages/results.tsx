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
      <div className="flex flex-col items-center">
        <h1 className="p-4 text-2xl">Results</h1>
        <div className="p-4"></div>
        <div className="flex w-full  max-w-2xl flex-col border">
          <div className="flex justify-between border-b">
            <span className="mr-8 p-2 text-pink-500">RANK</span>

            <span className="p-2">NAME</span>
            <span className="p-2">RAW SCORE</span>
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
