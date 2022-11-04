# Getting Started

Clone the github repo

Next navigate into the downloaded file with ```cd reidar-frontend```

Using npm, run the following command
``` npm install ```

Once installed, create a .env file. Ensure that the .env filetype is ignored in the .gitignore file so that the variables aren't shared publically. There are 6 variables you need to enter for the app to work. Message GGboi.eth#9737 for the missing .env variables.
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

To ensure that you don't accidently delete the main database, I will give you access to a copy of the database that I don't care what happens to. :)
