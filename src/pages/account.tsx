import React, { useState } from "react";
import { useSession } from "next-auth/react";
import type { NextPage } from "next";

import Header from "src-components/Header";
import ManageDaoMember from "src-components/account/ManageDaoMember";

const ProfilePage: NextPage = () => {
  const { data: session } = useSession();
  const [tab, setTab] = useState("DaoMember");

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
              {tab === "DaoMember" && <ManageDaoMember />}
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
