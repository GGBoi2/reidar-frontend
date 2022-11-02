import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
// import TwitterProvider from "next-auth/providers/twitter";
// import GoogleProvider from "next-auth/providers/google";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { env } from "../../../env/server.mjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  // Include user.id on session
  callbacks: {
    async jwt({ token, account, profile, user, isNewUser }) {
      //console.log(isNewUser); //Only defined on first render. Initiates after signIn so can't use in signIn flow :(
      if (account && profile && user) {
        token.profile = profile;
        token.refreshToken = account.refresh_token;
        token.accessToken = account.access_token;
        token.id = user.id;
      }

      return Promise.resolve(token);
    },
    async session({ session, token }) {
      if (token.profile) {
        session.accessToken = token.accessToken;
        session.user.refreshToken = token.refreshToken;
        session.user.profile = token.profile;
        session.user.id = token.id;
      }

      return session;
    },
    async signIn({ user, account, profile }) {
      //ToDo: filter sign in based on if isNewUser flag is triggered in jwt
      //Would love to be able to pass isNewUser state into signIn, but JWT triggered after sign in flow. Would likely need to be cookies of some kind.
      //Improve this flow in the future, but good enough for now

      //Check to see if account has claimed a daoMember already
      if (account?.providerAccountId) {
        const canClaim = await prisma.daoMember.findFirst({
          where: {
            discordId: account.providerAccountId,
            userId: null,
          },
        });

        //Take user id & assign to daoMember that has same discordId
        if (canClaim) {
          await prisma.daoMember.update({
            where: {
              discordId: account.providerAccountId,
            },
            data: {
              name: profile?.username,
              userId: user.id,
              image_url: `https://cdn.discordapp.com/avatars/${profile?.id}/${profile?.avatar}.jpg?size=256`,
            },
          });
        }
      }

      //Update username, image, or email if has changed on discord
      if (
        user.name !== profile?.username ||
        user.image !==
          `https://cdn.discordapp.com/avatars/${profile?.id}/${profile?.avatar}.jpg?size=256` ||
        user.email !== profile?.email
      ) {
        //Update Prisma user profile
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            name: profile?.username,
            image: `https://cdn.discordapp.com/avatars/${profile?.id}/${profile?.avatar}.jpg?size=256`,
            email: profile?.email,
          },
        });
        //Update daoMember Profile
        await prisma.daoMember.update({
          where: {
            userId: user.id,
          },
          data: {
            name: profile?.username,
            image_url: `https://cdn.discordapp.com/avatars/${profile?.id}/${profile?.avatar}.jpg?size=256`,
          },
        });
      }

      return true;
    },
  },

  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      authorization: {
        params: { scope: "identify guilds.members.read" },
      },

      profile(profile) {
        return {
          id: profile.id,
          name: profile.username,
          image: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.jpg?size=256`,
          email: profile.email,
        };
      },
    }),

    // TwitterProvider({
    //   clientId: env.TWITTER_CLIENT_ID,
    //   clientSecret: env.TWITTER_CLIENT_SECRET,
    //   version: "2.0",
    // }),
    // GoogleProvider({
    //   clientId: env.GOOGLE_CLIENT_ID,
    //   clientSecret: env.GOOGLE_CLIENT_SECRET,
    // }),
    // ...add more providers here
  ],
};

export default NextAuth(authOptions);
