import { prisma } from "@/utils/prisma";
import type { GetServerSideProps } from "next";
import React from 'react';

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


  React.useEffect(() => {

    // Logic for adding a sticky header and updating the element styling
    
    function handleScroll() {
      const tableHeader = document.querySelector('.table-header') as HTMLElement;
      const tableHeaderTop = tableHeader.getBoundingClientRect().top;

      if (tableHeaderTop <= 0) {
        tableHeader.classList.add('stuck');
      } else if (tableHeaderTop > 0) {
        tableHeader.classList.remove('stuck');
      }
    }

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleScroll);
    }

  }, [])

  return (
    <>
      <Header />
      <div className="flex flex-col items-center text-slate-300 font-mono">
        <h1 className="p-4 text-2xl text-white mt-12 mb-6">🏆 Results</h1>
        <div className="p-4"></div>
        <div className="flex w-full max-w-[725px] flex-col border-slate-500 rounded-lg mb-16">
          <div className="table-header flex font-bold text-sm uppercase justify-start border-slate-500 bg-slate-600 py-1 rounded-t-lg">
            <span className="pl-5 p-2">Rank</span>

            <span className="flex flex-grow justidy-start text-left p-2 pl-[90px]">Name</span>
            <span className="flex p-2 pr-6">Raw Score</span>
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
