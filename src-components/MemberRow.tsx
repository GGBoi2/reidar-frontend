import Image from "next/image";
import { AppRouterTypes } from "@/utils/trpc";
import React from "react";

//Generate Individual Ranking Rows
type MemberResults = AppRouterTypes["example"]["getScores"]["output"];

const MemberRow: React.FC<{
  member: MemberResults[number];
  rank: number;
}> = ({ member, rank }) => {
  return (
    <>
      <div className="border-slate-[#d1d1d1] min-[450px]:h-[90px] min-[450px]:text-base flex h-[70px] items-center justify-between bg-white text-sm text-slate-800 last:rounded-b-lg last:border-none even:bg-[#F9FAFB]">
        <div className="flex items-center justify-end">
          <span
            className={`ml-3 mr-8 w-7 text-right font-bold ${
              member.hasVoted ? "text-green-500" : ""
            }`}
          >
            {rank}
          </span>
          {member.image_url ? (
            <>
              <span className="min-[450px]:inline hidden pt-1">
                <Image
                  width={52}
                  height={52}
                  layout="fixed"
                  className="rounded-full"
                  src={`${member.image_url}`}
                  alt=""
                />
              </span>
              <span className="min-[450px]:hidden pt-1">
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
            <div className="min-[450px]:h-[52px] min-[450px]:w-[52px] h-[44px] w-[44px] rounded-full bg-gradient-to-t from-slate-400 via-slate-500 to-slate-700"></div>
          )}
        </div>
        <div className="flex flex-grow justify-start truncate pl-7 text-left font-bold capitalize">
          {member.name}
        </div>
        {member.score > 0 && (
          <span className="bg:transparent min-[450px]:bg-green-100 mr-5 rounded-full px-4 py-2 font-semibold leading-5 text-green-800">
            {member.score}{" "}
            <span className="min-[450px]:inline hidden">
              {member.score === 1 ? "point" : "points"}
            </span>
          </span>
        )}
        {member.score === 0 && (
          <span className="bg:transparent min-[450px]:bg-slate-100 mr-5 rounded-full px-4 py-2 font-semibold leading-5 text-slate-800">
            {member.score}{" "}
            <span className="min-[450px]:inline hidden">points</span>
          </span>
        )}
        {member.score < 0 && (
          <span className="bg:transparent min-[450px]:bg-red-100 mr-5 rounded-full px-4 py-2 font-semibold leading-5 text-red-800">
            {member.score}{" "}
            <span className="min-[450px]:inline hidden"> points</span>
          </span>
        )}
      </div>
    </>
  );
};

export default MemberRow;
