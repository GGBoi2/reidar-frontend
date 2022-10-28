import { prisma } from "../utils/prisma";
import type { GetServerSideProps } from "next";
import { AsyncReturnType } from "../utils/ts-bs";
import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import Header from "src-components/Header";

import { trpc } from "@/utils/trpc";

const ProfilePage: React.FC<{
  member: MemberQueryResult;
  user: { id: string }[];
}> = (props) => {
  const { data: session } = useSession();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasUserClaimed, setHasUserClaimed] = useState(false);
  const [tab, setTab] = useState("");
  const [choice, setChoice] = useState("--- Choose ---");
  const [daoMemberData, setDaoMemberData] = useState({
    name: "",
    roles: "",
    image_url: "",
    biography: "",
    contributions: "",
  });

  const claim = trpc.example.claimDaoMember.useMutation(); //Rework this with new null variable thing

  //Handle Dao Member Claim Form. Refresh page so it updates from DB changes
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    //event.preventDefault()
    claim.mutate({
      claimingUserId: session?.user?.id || "", //This only runs after page has rendered enough for a session.
      daoMemberId: choice,
    });
  };

  const checkClaim = (sessionId: string) => {
    return props.user.some((currentUser) => {
      return sessionId === currentUser.id;
    });
  };

  const { data: queryData } = trpc.example.getDaoMemberData.useQuery(
    { id: sessionId },
    {
      enabled: Boolean(sessionId),
      onSuccess(data) {
        setDaoMemberData(data);
        return data;
      },
    }
  );

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
                setSessionId(session.user?.id || "");
                setHasUserClaimed(checkClaim(session?.user?.id || ""));
                setDaoMemberData(queryData);
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
                  {!hasUserClaimed && (
                    <div className="pt-8">
                      <div className="pb-4 text-xl">Claim your Dao Member</div>
                      <form
                        className="flex  items-center"
                        onSubmit={(e) => handleSubmit(e)}
                      >
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
                  {hasUserClaimed && (
                    <div>
                      <div>Edit Your Information</div>
                      <form>
                        <div>
                          <label>
                            Name
                            <input
                              type="text"
                              name="name"
                              placeholder={daoMemberData?.name}
                            />
                          </label>
                          <label>
                            Image
                            <input
                              type="text"
                              name="image"
                              placeholder={daoMemberData?.image_url}
                            />
                          </label>
                        </div>

                        <div>
                          <label>
                            Roles
                            <input
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
                              type="text"
                              name="contributions"
                              placeholder={daoMemberData?.contributions}
                            />
                          </label>
                        </div>
                        <button type="submit">Submit</button>
                      </form>
                    </div>
                  )}
                </>
              )}
            </div>

            <div>{tab === "TaskBoard" && <div>If tab === Task Board</div>}</div>
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

//Replace with SWR for Client Side instant rendering
//Or just refresh page on data submit & lower revalidate time to make it work lmao
export const getStaticProps: GetServerSideProps = async () => {
  const availableMembers = await getUnclaimedMembers();
  const availableUsers = await getClaimedUsers();

  return {
    props: {
      member: availableMembers,
      user: availableUsers,
    },
    revalidate: 1,
  };
};

const getUnclaimedMembers = async () => {
  //Optional: Convert to tRPC Query to not directly access prisma
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

const getClaimedUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
    },
    where: {
      NOT: {
        daoMember: null,
      },
    },
  });
};

type MemberQueryResult = AsyncReturnType<typeof getUnclaimedMembers>;
