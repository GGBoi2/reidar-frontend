import React, { useState, FormEvent } from "react";
import { AppRouterTypes, trpc } from "@/utils/trpc";

import { prisma } from "../utils/prisma";
import type { GetServerSideProps } from "next";
import { AsyncReturnType } from "../utils/ts-bs";
import { useSession } from "next-auth/react";
import Header from "src-components/Header";
import Image from "next/image";

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

  //Ensure form data is kept current in Manage Dao Member Tab
  const inputChangeHander = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    //Ensure no typescript conflict
    if (daoMemberData) {
      setDaoMemberData({ ...daoMemberData, [name]: value });
    }
  };

  //Update Dao Data from Manage Dao Member Tab
  const update = trpc.example.updateDaoMember.useMutation();
  const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (session?.user.id && daoMemberData) {
      update.mutate({ userId: session.user.id, ...daoMemberData });
    }
  };

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
          <div className="flex h-64 w-1/5 flex-col  ">
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

          <div className="flex grow flex-col items-center  border-l border-white">
            <div>
              {tab === "" && (
                <div className="pt-8 text-2xl">
                  {String.fromCharCode(8592)} Select a Tab
                </div>
              )}
            </div>
            <div className="w-full p-4">
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
                  {hasClaimedMember && daoMemberData && (
                    <div className=" flex flex-col items-center">
                      <div className="">
                        <Image
                          src={daoMemberData.image_url}
                          alt="profile pic"
                          width={128}
                          height={128}
                          objectFit="contain"
                        />
                      </div>
                      <div className="flex items-center justify-center">
                        Name:
                        <span className="text-l pl-1">
                          {daoMemberData.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        Roles:
                        <span className="text-l pl-1">
                          {daoMemberData.roles}
                        </span>
                      </div>
                      <form className="w-full" onSubmit={onSubmitHandler}>
                        <div className="flex justify-center p-2 text-xl">
                          Edit Your Information
                        </div>

                        <div className="w-100 flex flex-grow flex-col">
                          <label>
                            Biography - This will appear in the Dao Member Bio
                            page
                          </label>
                          <textarea
                            className="m-2  flex-grow p-1 text-black"
                            rows={3}
                            name="biography"
                            placeholder={daoMemberData.biography}
                            onChange={(e) => inputChangeHander(e)}
                          />
                        </div>
                        <div className="w-100 flex flex-grow flex-col">
                          <label>
                            Contributions - This will appear in the game
                          </label>
                          <textarea
                            className="m-2 flex-grow  p-1 text-black"
                            rows={3}
                            name="contributions"
                            placeholder={daoMemberData.contributions}
                            onChange={(e) => inputChangeHander(e)}
                          />
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
    revalidate: 60,
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
      discordId: null,
    },
  });
};
