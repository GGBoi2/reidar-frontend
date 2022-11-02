import { DefaultSession, Profile } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      refreshToken: JWT;
      profile?: Profile;
    } & DefaultSession["user"];
    accessToken: JWT;
  }
  interface Profile {
    id: string;
    username: string;
    avatar: string;
    providerAccountId: string;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    profile?: Profile;
  }
}
