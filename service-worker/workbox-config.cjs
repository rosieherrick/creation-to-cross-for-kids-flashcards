module.exports = {
  globDirectory: "./",
  globPatterns: ["**/**.html", "**/**.mjs"],
  globIgnores: [
    "**/**.json",
    "**/node_modules/**",
    "**/service-worker/**",
    "index.mjs",
    "workbox-*.cjs",
  ],
  swDest: "./service-worker.js",
  sourcemap: false,
  // https://developer.chrome.com/docs/workbox/modules/workbox-build#property-BasePartial-maximumFileSizeToCacheInBytes
  maximumFileSizeToCacheInBytes: 2097152 * 3,
  // define runtime caching rules
  runtimeCaching: [
    {
      // match any request
      urlPattern: new RegExp("^.*$"),

      // apply a network-first strategy
      handler: "NetworkFirst",

      options: {
        // use a custom cache name
        cacheName: "cck-flashcards-cache",

        expiration: {
          // 365 days
          maxAgeSeconds: 365 * 24 * 60 * 60,
        },
      },
    },
  ],
};
