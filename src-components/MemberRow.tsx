import Image from "next/image";
import { AppRouterTypes } from "@/utils/trpc";
import React, {useState, useEffect} from 'react';

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
      <div className="flex items-center justify-between border-slate-[#d1d1d1] last:border-none last:rounded-b-lg h-[70px] min-[450px]:h-[90px] text-slate-800 bg-white even:bg-[#F9FAFB] text-sm min-[450px]:text-base">
        <div className="flex items-center justify-end">
          <span className="ml-3 mr-8 w-7 font-bold text-right">{rank}</span>
          {member.image_url ? (
            <>
              <span className="hidden min-[450px]:inline pt-1">
                <Image
                  width={ 52 }
                  height={ 52 }
                  layout="fixed"
                  className="rounded-full"
                  src={`${member.image_url}`}
                  alt=""
                />
              </span>
              <span className="min-[450px]:hidden pt-1">
                <Image
                width={ 44 }
                height={ 44 }
                layout="fixed"
                className="rounded-full"
                src={`${member.image_url}`}
                alt=""
                 />
              </span>
            </>
          ) : (
            <div className="w-[44px] min-[450px]:w-[52px] h-[44px] min-[450px]:h-[52px] bg-gradient-to-t from-slate-400 via-slate-500 to-slate-700 rounded-full"></div>
          )}
        </div>
        <div className="flex flex-grow justify-start text-left font-bold capitalize pl-7 truncate">
          {member.name}
        </div>
        { score > 0 && (
          <span className="rounded-full bg:transparent min-[450px]:bg-green-100 px-4 py-2 font-semibold leading-5 text-green-800 mr-5">
          {score} <span className="hidden min-[450px]:inline">{ score === 1 ? 'point': 'points'}</span>
          </span>
        )}
        { score === 0 && (
          <span className="rounded-full bg:transparent min-[450px]:bg-slate-100 px-4 py-2 font-semibold leading-5 text-slate-800 mr-5">
          {score} <span className="hidden min-[450px]:inline">points</span>
          </span>
        )}
        { score < 0 && (
          <span className="rounded-full bg:transparent min-[450px]:bg-red-100 px-4 py-2 font-semibold leading-5 text-red-800 mr-5">
          {score} <span className="hidden min-[450px]:inline"> points</span>
          </span>
        )}
      </div>
    </>
  );
};

export default MemberRow;
