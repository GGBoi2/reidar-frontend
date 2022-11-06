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
      <div className="flex items-center justify-between border-b border-slate-500 last:border-none h-[80px] text-slate-300">
        <div className="flex items-center justify-end">
          <span className="ml-2 mr-7 w-7 text-sm font-light text-right">{rank}</span>
          {member.image_url ? (
            <Image
              width={40}
              height={40}
              layout="fixed"
              className="rounded-full"
              src={`${member.image_url}`}
              alt=""
            />
          ) : (
            <div className="w-[40px] h-[40px] bg-[#111925] rounded-full"></div>
          )}
        </div>
        <div className="flex flex-grow justify-start text-left text-md font-light capitalize pl-8">
          {member.name}
        </div>
        <div className="text-l pr-5">{score}</div>
      </div>
    </>
  );
};

export default MemberRow;
