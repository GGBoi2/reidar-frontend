// @ts-check
/* run the build with this set to skip validation */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function defineNextConfig(config) {
  return config;
}

export default defineNextConfig({
  reactStrictMode: true,
  swcMinify: false, //Error with react-chart-2.js
  /** Next.js i18n docs:
   * @see https://nextjs.org/docs/advanced-features/i18n-routing
   * Reference repo for i18n:
   * @see https://github.com/juliusmarminge/t3-i18n
   **/
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    loader: "default",
    domains: [
      "raw.githubusercontent.com",
      "i.ibb.co",
      "ibb.co",
      "cdn.discordapp.com",
    ],
  },
});
