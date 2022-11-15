import Image from "next/image";
import { AppRouterTypes } from "@/utils/trpc";
import React from "react";

//Generate Individual Ranking Rows
type MemberQueryResult =
  AppRouterTypes["example"]["getMembersInOrder"]["output"];

const MemberRow: React.FC<{
  member: MemberQueryResult[number];
  rank: number;
  score: number;
}> = ({ member, rank, score }) => {
  return (
    <>
      <div className="border-slate-[#d1d1d1] flex h-[70px] items-center justify-between bg-white text-sm text-slate-800 last:rounded-b-lg last:border-none even:bg-[#F9FAFB] min-[450px]:h-[90px] min-[450px]:text-base">
        <div className="flex items-center justify-end">
          <span
            className={`ml-3 mr-8 w-7 text-right font-bold ${
              member.votesCast === 30 ? "text-green-500" : ""
            }`}
          >
            {rank}
          </span>
          {member.image_url ? (
            <>
              <span className="hidden pt-1 min-[450px]:inline">
                <Image
                  width={52}
                  height={52}
                  layout="fixed"
                  className="rounded-full"
                  src={`${member.image_url}`}
                  alt=""
                />
              </span>
              <span className="pt-1 min-[450px]:hidden">
                <Image
                  width={44}
                  height={44}
                  layout="fixed"
                  className="rounded-full"
                  src={`${member.image_url}`}
                  alt=""
                />
              </span>
            </>
          ) : (
            <div className="h-[44px] w-[44px] rounded-full bg-gradient-to-t from-slate-400 via-slate-500 to-slate-700 min-[450px]:h-[52px] min-[450px]:w-[52px]"></div>
          )}
        </div>
        <div className="flex flex-grow justify-start truncate pl-7 text-left font-bold capitalize">
          {member.name}
        </div>
        {score > 0 && (
          <span className="bg:transparent mr-5 rounded-full px-4 py-2 font-semibold leading-5 text-green-800 min-[450px]:bg-green-100">
            {score}{" "}
            <span className="hidden min-[450px]:inline">
              {score === 1 ? "point" : "points"}
            </span>
          </span>
        )}
        {score === 0 && (
          <span className="bg:transparent mr-5 rounded-full px-4 py-2 font-semibold leading-5 text-slate-800 min-[450px]:bg-slate-100">
            {score} <span className="hidden min-[450px]:inline">points</span>
          </span>
        )}
        {score < 0 && (
          <span className="bg:transparent mr-5 rounded-full px-4 py-2 font-semibold leading-5 text-red-800 min-[450px]:bg-red-100">
            {score} <span className="hidden min-[450px]:inline"> points</span>
          </span>
        )}
      </div>
    </>
  );
};

export default MemberRow;
