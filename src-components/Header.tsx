import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

function Header() {
  const { data: session } = useSession();
  return (
    <div className=" w-full pb-2 text-center text-xl">
      <div className="p-2">
        {session && (
          <div className="p-2">
            Signed in as{" "}
            <span className="text-pink-500">{session.user?.name}</span>
          </div>
        )}
        <Link href="/">
          <a className="px-2">The Game</a>
        </Link>
        <Link href="/results">
          <a className="px-2">Results</a>
        </Link>
        {session && (
          <Link href="/account">
            <a className="px-2 pr-4">Account</a>
          </Link>
        )}
        {session && (
          <>
            <button
              className="cursor-pointer border border-white p-1"
              onClick={() => signOut()}
            >
              Sign Out
            </button>
          </>
        )}
        {!session && (
          <button
            className=" cursor-pointer border border-white p-1"
            onClick={() => signIn()}
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
}

export default Header;
