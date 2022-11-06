import Image from "next/image";
import { AppRouterTypes } from "@/utils/trpc";

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
      <div className="flex items-center justify-between border-b border-slate-[#d1d1d1] last:border-none last:rounded-b-lg h-[90px] text-slate-800 bg-white">
        <div className="flex items-center justify-end">
          <span className="ml-3 mr-8 w-7 text-md font-bold text-right">{rank}</span>
          {member.image_url ? (
            <Image
              width={52}
              height={52}
              layout="fixed"
              className="rounded-full"
              src={`${member.image_url}`}
              alt=""
            />
          ) : (
            <div className="w-[52px] h-[52px] bg-slate-200 rounded-full"></div>
          )}
        </div>
        <div className="flex flex-grow justify-start text-left text-md font-bold capitalize pl-7">
          {member.name}
        </div>
        { score > 0 && (
          <span className="rounded-full bg-green-100 px-4 py-2 text-md font-semibold leading-5 text-green-800 mr-5">
          {score} { score === 1 ? 'point': 'points'}  
          </span>
        )}
        { score === 0 && (
          <span className="rounded-full bg-slate-100 px-4 py-2 text-md font-semibold leading-5 text-slate-800 mr-5">
          {score} points
          </span>
        )}
        { score < 0 && (
          <span className="rounded-full bg-red-100 px-4 py-2 text-md font-semibold leading-5 text-red-800 mr-5">
          {score} points 
          </span>
        )}
      </div>
    </>
  );
};

export default MemberRow;
