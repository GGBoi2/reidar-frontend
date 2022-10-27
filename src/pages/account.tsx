import { prisma } from "../utils/prisma";
import type { GetServerSideProps } from "next";
import { AsyncReturnType } from "../utils/ts-bs";
import { FormEvent, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

import { trpc } from "@/utils/trpc";

const getUnclaimedMembers = async () => {
  return await prisma.daoMember.findMany({
    select: {
      id: true,
      name: true,
    },
    where: {
      userId: null,
    },
  });
};

type MemberQueryResult = AsyncReturnType<typeof getUnclaimedMembers>;
const ProfilePage: React.FC<{ member: MemberQueryResult }> = (props) => {
  const session = useSession();
  const [choice, setChoice] = useState("--- Choose ---");

  const claim = trpc.example.claimDaoMember.useMutation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    //Verify existence of claimer
    let claimer = "";
    session.data?.user?.id
      ? (claimer = session.data?.user?.id)
      : (claimer = "");

    claim.mutate({
      claimingUserId: claimer,
      daoMemberId: choice,
    });
  };

  return (
    <>
      {session && (
        <div>
          <div className="text-white">
            Signed in as {session.data?.user?.name}
          </div>

          <button onClick={() => signOut()}>Sign Out</button>
        </div>
      )}

      {!session && (
        <div>
          <div>You should Sign in</div>

          <button onClick={() => signIn()}>Sign in</button>
        </div>
      )}
      {session && (
        <div className="flex flex-col items-center">
          <form onSubmit={(e) => handleSubmit(e)}>
            <select
              id="daoMemberSelect"
              value={choice}
              onChange={(e) => {
                setChoice(e.target.value);
              }}
              name="daoMemberSelect"
              className="text-black"
            >
              <option value="">--- Choose ---</option>

              {props.member.map((individual: MemberQueryResult) => {
                return (
                  <option key={individual.id} value={individual.id}>
                    {individual.name}
                  </option>
                );
              })}
            </select>
            <button type="submit">Submit</button>
          </form>
        </div>
      )}
    </>
  );
};

export default ProfilePage;

export const getStaticProps: GetServerSideProps = async () => {
  const availableMembers = await getUnclaimedMembers();
  return { props: { member: availableMembers }, revalidate: 5 };
};
