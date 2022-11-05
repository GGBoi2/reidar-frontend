import React, { useState } from "react";
import { AppRouterTypes, trpc } from "@/utils/trpc";
import { useSession } from "next-auth/react";
import Image from "next/image";

const ManageDaoMember = () => {
  const { data: session } = useSession();
  const [hasClaimedMember, setHasClaimedMember] = useState(true);
  const [daoMemberChoice, setDaoMemberChoice] = useState("");
  const [daoMemberData, setDaoMemberData] = useState<DaoMemberData>(null);
  type DaoMemberData = AppRouterTypes["example"]["getDaoMemberData"]["output"];

  //Check to see if user has Claimed a Dao Member Already
  trpc.example.checkClaim.useQuery(
    { id: session?.user.id || "" }, //Hacky fix due to type error in checkClaim
    {
      enabled: Boolean(session?.user.id),
      onSuccess(data) {
        if (!data) {
          setHasClaimedMember(false);
        }
      },
      refetchInterval: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  //Collect available members if user has not claimed a member
  const { data: availableMembers } = trpc.example.getUnclaimedMembers.useQuery(
    undefined,
    {
      enabled: Boolean(!hasClaimedMember),
      refetchInterval: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );
  type availableMembersType =
    AppRouterTypes["example"]["getUnclaimedMembers"]["output"];

  //Claim a dao member
  const claim = trpc.example.claimDaoMember.useMutation();
  const handleDaoMemberClaim = async () => {
    if (!session) return;
    claim.mutate({
      claimingUserId: session.user.id,
      daoMemberId: daoMemberChoice,
      image_url: session.user.image,
      name: session.user.name,
    });
  };

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

  //Update daoMember data stored in database
  const update = trpc.example.updateDaoMember.useMutation();
  const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (session?.user.id && daoMemberData) {
      update.mutate({ userId: session.user.id, ...daoMemberData });
    }
  };

  //Capture field changes in our form
  const inputChangeHander = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    //Ensure no typescript conflict
    if (daoMemberData) {
      setDaoMemberData({ ...daoMemberData, [name]: value });
    }
  };

  return (
    <div className="w-full p-4">
      {!hasClaimedMember && (
        <div className="pt-8">
          <div className="pb-4 text-xl">Claim your Dao Member</div>
          <form
            className="flex  items-center"
            onSubmit={() => handleDaoMemberClaim()}
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

              {availableMembers?.map(
                (individual: availableMembersType[number]) => {
                  return (
                    <option key={individual.id} value={individual.id}>
                      {individual.name}
                    </option>
                  );
                }
              )}
            </select>
            <button type="submit" className="m-2 border border-white px-2 py-1">
              Submit
            </button>
          </form>
        </div>
      )}
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
            <span className="text-l pl-1">{daoMemberData.name}</span>
          </div>
          <div className="flex items-center justify-center">
            Roles:
            <span className="text-l pl-1">{daoMemberData.roles}</span>
          </div>
          <form className="w-full" onSubmit={onSubmitHandler}>
            <div className="flex justify-center p-2 text-xl">
              Edit Your Information
            </div>

            <div className="w-100 flex flex-grow flex-col">
              <label>
                Biography - This will appear in the Dao Member Bio page
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
              <label>Contributions - This will appear in the game</label>
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
    </div>
  );
};

export default ManageDaoMember;
