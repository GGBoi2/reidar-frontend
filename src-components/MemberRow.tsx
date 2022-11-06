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
      <div className="flex items-center justify-between border-b h-[80px] text-slate-300">
        <div className="flex items-center justify-end">
          <span className="mx-0 ml-1 mr-7 w-8 text-sm font-light text-right">{rank}</span>
          {member.image_url ? (
            <Image
              width={44}
              height={44}
              layout="fixed"
              className="rounded-full"
              src={`${member.image_url}`}
              alt=""
            />
          ) : (
            <div className="w-[44px] h-[44px] bg-slate-600 rounded-full"></div>
          )}
        </div>
        <div className="flex flex-grow justify-start text-left text-lg font-light capitalize pl-8">
          {member.name}
        </div>
        <div className="text-l pr-5">{score}</div>
      </div>
    </>
  );
};

export default MemberRow;
