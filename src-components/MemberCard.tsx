import type { GetInferenceHelpers } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/router/_app";
import Image from "next/image";

type RouterInput = GetInferenceHelpers<AppRouter>;
type MemberFromSever =
  RouterInput["example"]["getTwoMembers"]["output"]["firstMember"];

const MemberCard: React.FC<{
  member: MemberFromSever;
  vote: () => void;
}> = (props) => {
  return (
    <div className="relative flex flex-col items-center">
      {props.member.image_url ? (
        <Image
          width={256}
          height={256}
          layout="fixed"
          src={`${props.member.image_url}`}
          alt=""
        />
      ) : (
        <div className=" h-64 min-h-full w-64">
          <p>No Profile Picture Submitted or Page Not Found</p>
        </div>
      )}
      <div className="mt-1 text-center text-xl capitalize">
        {props.member.name}
      </div>
      <div className="">
        {/*   Add Text Wrap */}
        Roles: {`${props.member.roles ? props.member.roles : "No Roles"}`}
      </div>
      <div className="my-4 h-full w-96 text-justify">
        {props.member.contributions
          ? props.member.contributions
          : props.member.biography
          ? props.member.biography
          : "No Biography Submitted"}
      </div>
      <button className="button  " onClick={() => props.vote()}>
        Vote
      </button>
    </div>
  );
};

export default MemberCard;
