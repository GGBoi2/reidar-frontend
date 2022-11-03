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

export default MemberRow;
