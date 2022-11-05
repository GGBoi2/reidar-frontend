# Getting Started

Clone the github repo

Next navigate into the downloaded file with ```cd reidar-frontend```

Using npm, run the following command
``` npm install ```

Once installed, edit the .env-example file. You will need to message GGboi.eth#9737 to get the missing variables. Rename the file to .env after you have added the variables so that the they aren't shared publically. There are 6 variables you need to enter for the app to work.
```
#Prisma
DATABASE_URL=
SHADOW_URL=

#Next Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

#Next Auth Discord Provider
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
```

Once everything is set up correctly, type ```npm run dev``` to spin up a test server on NEXTAUTH_URL. The page will auto refresh on save.

To ensure that you don't accidently delete the main database, we will be working with the development databases on planetscale. :)
The data matches what is in our production database.

You will need to login to view edits to "The Game" with the same discord account as in ReidarDao. Let me know if anything doesn't work
