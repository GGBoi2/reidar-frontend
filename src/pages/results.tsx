import React, { useEffect } from "react";

import { AppRouterTypes } from "@/utils/trpc";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { exampleRouter } from "@/server/trpc/router/example";
import { createContextInner } from "@/server/trpc/context";
import superjson from "superjson";

import Header from "src-components/Header";
import Navigation from "src-components/results/Navigation";
import MemberRow from "src-components/MemberRow";

//Generate Results Page
const ResultsPage: React.FC<{ member: MemberResults }> = (props: any) => {
  let completedVotes = 0;
  props.results.map((member: MemberResults[number]) => {
    return member.hasVoted ? completedVotes++ : 0;
  });

  useEffect(() => {
    // Logic for adding a sticky header and updating the element styling

    function handleScroll() {
      const tableHeader = document.querySelector(
        ".table-header"
      ) as HTMLElement;
      const tableHeaderTop = tableHeader.getBoundingClientRect().top;

      if (tableHeaderTop <= 0) {
        tableHeader.classList.add("stuck");
      } else if (tableHeaderTop > 0) {
        tableHeader.classList.remove("stuck");
      }
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleScroll);
    };
  }, []);

  return (
    <>
      <Header />
      <div className="flex flex-col items-center font-mono text-slate-300">
        <h1 className="mt-12 mb-6 p-4 text-2xl text-white">🏆 Results</h1>
        <Navigation pageTitles={["title 1", "title 2", "title 3"]} />
        <h3 className="text-m  text-white">Members Voted: {completedVotes}</h3>
        <div className="p-4"></div>
        <div className="mb-16 flex w-full max-w-[725px] flex-col rounded-lg border-slate-500">
          <div className="table-header flex justify-start rounded-t-lg border-slate-500 bg-slate-600 py-1 text-sm font-bold uppercase">
            <span className="p-2 pl-5">Rank</span>

            <span className="justidy-start flex flex-grow p-2 pl-[90px] text-left">
              Name
            </span>
            <span className="flex p-2 pr-6">Raw Score</span>
          </div>
          {props.results.map(
            (currentMember: MemberResults[number], index: number) => {
              return (
                <MemberRow
                  key={index}
                  rank={index + 1}
                  member={currentMember}
                />
              );
            }
          )}
        </div>
      </div>
    </>
  );
};

export default ResultsPage;

type MemberResults = AppRouterTypes["example"]["getScores"]["output"];

//SSG
export const getStaticProps = async () => {
  const ssg = createProxySSGHelpers({
    router: exampleRouter,
    ctx: await createContextInner({ session: null }),
    transformer: superjson,
  });

  const results = await ssg.getScores.fetch();

  return {
    props: {
      trpcState: ssg.dehydrate(),

      results: results,
    },
    revalidate: 1,
  };
};
