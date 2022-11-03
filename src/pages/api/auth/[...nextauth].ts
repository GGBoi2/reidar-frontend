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
      if (account && profile && user) {
        token.profile = profile;
        token.refreshToken = account.refresh_token;
        token.accessToken = account.access_token;
        token.id = user.id;
      }

      //Check to see if new account is eligible to claim a daoMember
      if (isNewUser) {
        const canClaim = await prisma.daoMember.findFirst({
          where: {
            discordId: account?.providerAccountId,
            userId: null,
          },
        });

        //Take user id & assign to daoMember that has same discordId
        if (canClaim) {
          await prisma.daoMember.update({
            where: {
              discordId: account?.providerAccountId,
            },
            data: {
              name: profile?.username,
              userId: user?.id,
              image_url: `https://cdn.discordapp.com/avatars/${profile?.id}/${profile?.avatar}.jpg?size=256`,
            },
          });
        }
      }

      //Update username, image, or email if has changed on discord
      if (
        !isNewUser &&
        (token.name !== token.profile?.username ||
          token.picture !==
            `https://cdn.discordapp.com/avatars/${token.profile?.id}/${token.profile?.avatar}.jpg?size=256` ||
          token.email !== token.profile?.email)
      ) {
        //Ensure that profile & user exists
        if (token) {
          //Update Prisma user profile
          await prisma.user.update({
            where: {
              id: token.sub,
            },
            data: {
              name: token.profile?.username,
              image: `https://cdn.discordapp.com/avatars/${token.profile?.id}/${token.profile?.avatar}.jpg?size=256`,
              email: token.profile?.email,
            },
          });
          //Update daoMember Profile
          await prisma.daoMember.update({
            where: {
              userId: token.sub,
            },
            data: {
              name: token.profile?.username,
              image_url: `https://cdn.discordapp.com/avatars/${token.profile?.id}/${token.profile?.avatar}.jpg?size=256`,
            },
          });
        }
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
  },

  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      authorization: {
        params: { scope: "identify" },
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
