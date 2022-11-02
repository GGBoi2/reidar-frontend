import { useState, FormEvent } from "react";
import { AppRouterTypes, trpc } from "@/utils/trpc";

import { prisma } from "../utils/prisma";
import type { GetServerSideProps } from "next";
import { AsyncReturnType } from "../utils/ts-bs";
import { useSession } from "next-auth/react";
import Header from "src-components/Header";

//To Do - Match DaoMember data with discord data

type DaoMemberData = AppRouterTypes["example"]["getDaoMemberData"]["output"];

const ProfilePage: React.FC<{
  member: MemberQueryResult;
}> = (props) => {
  const { data: session } = useSession();
  const [hasClaimedMember, setHasClaimedMember] = useState(false);
  const [daoMemberChoice, setDaoMemberChoice] = useState("");
  const [daoMemberData, setDaoMemberData] = useState<DaoMemberData>(null);
  const [tab, setTab] = useState("DaoMember");

  //Check to see if user has Claimed a Dao Member Already
  trpc.example.checkClaim.useQuery(
    { id: session?.user.id || "" }, //Hacky fix due to type error in checkClaim
    {
      enabled: Boolean(session?.user.id),
      onSuccess(data) {
        if (data) {
          setHasClaimedMember(true);
        }
      },
      refetchInterval: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  //Get Dao Member Data after the session.user.id exists
  trpc.example.getDaoMemberData.useQuery(
    { id: session?.user.id },
    {
      enabled: Boolean(session?.user.id),
      onSuccess(data) {
        console.log(data);
        setDaoMemberData(data);
      },
      refetchInterval: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );
  const claim = trpc.example.claimDaoMember.useMutation();
  const handleDaoMemberClaim = async (event: FormEvent<HTMLFormElement>) => {
    //event.preventDefault();
    //Would like to figure out how to prevent page refresh but still refire getDaoMemberData & checkClaim queries
    claim.mutate({
      claimingUserId: session?.user.id || "", //This won't ever be null
      daoMemberId: daoMemberChoice,
    });
  };

  return (
    <>
      <Header />
      {session && (
        <div className="flex-box border-w mx-auto flex w-2/3 items-start justify-center border">
          <div className="flex h-64 w-1/5 flex-col  border-r border-white">
            <div
              className={`flex cursor-pointer justify-center border-b border-white p-2 ${
                tab === "DaoMember" ? "bg-white text-black" : ""
              }`}
              onClick={() => {
                setTab("DaoMember");
              }}
            >
              Manage Dao Member
            </div>
            <div
              className={`flex cursor-pointer justify-center border-b border-white p-2 ${
                tab === "TaskBoard" ? "bg-white text-black" : ""
              }`}
              onClick={() => setTab("TaskBoard")}
            >
              Task Board
            </div>
          </div>

          <div className="flex grow flex-col items-center">
            <div>
              {tab === "" && (
                <div className="pt-8 text-2xl">
                  {String.fromCharCode(8592)} Select a Tab
                </div>
              )}
            </div>
            <div>
              {tab === "DaoMember" && (
                <>
                  {/*DaoMember has not been claimed on current logged in user */}
                  {!hasClaimedMember && (
                    <div className="pt-8">
                      <div className="pb-4 text-xl">Claim your Dao Member</div>
                      <form
                        className="flex  items-center"
                        onSubmit={(e) => handleDaoMemberClaim(e)}
                      >
                        <select
                          id="daoMemberSelect"
                          value={daoMemberChoice}
                          onChange={(e) => {
                            setDaoMemberChoice(e.target.value);
                          }}
                          name="daoMemberSelect"
                          className="text-black"
                        >
                          <option value="">--- Choose ---</option>

                          {props.member.map(
                            (individual: MemberQueryResult[number]) => {
                              return (
                                <option
                                  key={individual.id}
                                  value={individual.id}
                                >
                                  {individual.name}
                                </option>
                              );
                            }
                          )}
                        </select>
                        <button
                          type="submit"
                          className="m-2 border border-white px-2 py-1"
                        >
                          Submit
                        </button>
                      </form>
                    </div>
                  )}
                  {/* Dao Member has been claimed on current logged in user */}
                  {hasClaimedMember && (
                    <div className="flex w-full justify-center">
                      <form>
                        <div className="flex justify-center p-2 text-xl">
                          Edit Your Information
                        </div>
                        <div>
                          <label>
                            Name
                            <input
                              className="m-2 p-1 text-black"
                              type="text"
                              name="name"
                              placeholder={daoMemberData?.name}
                            />
                          </label>
                          <label>
                            Image
                            <input
                              className="m-2 p-1 text-black"
                              type="text"
                              name="image"
                              placeholder={daoMemberData?.image_url}
                            />
                          </label>
                        </div>

                        <div className="flex flex-grow">
                          <label>
                            Roles
                            <input
                              className="w-100% m-2  p-1 text-black"
                              type="text"
                              name="roles"
                              placeholder={daoMemberData?.roles}
                            />
                          </label>
                        </div>
                        <div>
                          <label>
                            Biography
                            <input
                              className="w-100% m-2  p-1 text-black"
                              type="text"
                              name="biography"
                              placeholder={daoMemberData?.biography}
                            />
                          </label>
                        </div>
                        <div>
                          <label>
                            Contributions
                            <input
                              className="w-100% m-2  p-1 text-black"
                              type="text"
                              name="contributions"
                              placeholder={daoMemberData?.contributions}
                            />
                          </label>
                        </div>
                        <button className="button" type="submit">
                          Submit
                        </button>
                      </form>
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              {tab === "TaskBoard" && (
                <>
                  <div>If tab === Task Board</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {!session && (
        <div className="flex-box mx-auto mt-10 flex w-2/3 items-start justify-center text-3xl ">
          Please Sign In
        </div>
      )}
    </>
  );
};

export default ProfilePage;

export const getStaticProps: GetServerSideProps = async () => {
  const availableMembers = await getUnclaimedMembers();
  return {
    props: {
      member: availableMembers,
    },
    revalidate: 1,
  };
};

type MemberQueryResult = AsyncReturnType<typeof getUnclaimedMembers>;
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
