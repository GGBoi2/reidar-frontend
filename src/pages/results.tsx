import { prisma } from "@/utils/prisma";
import type { GetServerSideProps } from "next";
import { AsyncReturnType } from "@/utils/ts-bs";
import Image from "next/image";

import Header from "src-components/Header";

const getMembersInOrder = async () => {
  //Optional: Convert to tRPC Query to not directly access prisma
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

type MemberQueryResult = AsyncReturnType<typeof getMembersInOrder>;

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

//Generate Individual Ranking Rows
const MemberRow: React.FC<{
  member: MemberQueryResult[number];
  rank: number;
  score: number;
}> = ({ member, rank, score }) => {
  return (
    <>
      <div className="flex items-center justify-between border-b p-2">
        <div className="flex items-center">
          <span className="p-1 pr-4 text-2xl text-pink-500 ">{rank}</span>
          {member.image_url ? (
            <Image
              width={64}
              height={64}
              layout="fixed"
              src={`${member.image_url}`}
              alt=""
            />
          ) : (
            <span>No PFP</span>
          )}
        </div>
        <div className="mr-20 flex flex-grow justify-center text-left text-xl  capitalize ">
          {member.name}
        </div>
        <div className="text-l  pr-4">{score}</div>
      </div>
    </>
  );
};

export const getStaticProps: GetServerSideProps = async () => {
  const memberOrdered = await getMembersInOrder();
  return { props: { member: memberOrdered }, revalidate: 60 };
};
