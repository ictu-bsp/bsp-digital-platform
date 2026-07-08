// const config = {
//   default: {
//     override: {
//       wrapper: "cloudflare-node",
//       converter: "edge",
//       proxyExternalRequest: "fetch",
//       incrementalCache: "dummy",
//       tagCache: "dummy",
//       queue: "dummy",
//     },
//     external: ['pg-cloudflare'],
//   },
//   edgeExternals: ["node:crypto"],
//   middleware: {
//     external: true,
//     override: {
//       wrapper: "cloudflare-edge",
//       converter: "edge",
//       proxyExternalRequest: "fetch",
//       incrementalCache: "dummy",
//       tagCache: "dummy",
//       queue: "dummy",
//     },
//   },
// };

// export default config;

// const config = {
//   default: {
//     override: {
//       wrapper: "cloudflare-node",
//       converter: "edge",
//       proxyExternalRequest: "fetch",
//       incrementalCache: "dummy",
//       tagCache: "dummy",
//       queue: "dummy",
//     },
//     buildCommand: 'npx @opennextjs/cloudflare',
//     external: ['pg-cloudflare'], 
//   },
//   edgeExternals: ["node:crypto"],
//   middleware: {
//     external: true,
//     override: {
//       wrapper: "cloudflare-edge",
//       converter: "edge",
//       proxyExternalRequest: "fetch",
//       incrementalCache: "dummy",
//       tagCache: "dummy",
//       queue: "dummy",
//     },
//   },
// };

// export default config;

const config = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
    buildCommand: 'npx @opennextjs/cloudflare',
  },
  
  edgeExternals: ["node:crypto", "pg-cloudflare"],
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
};

export default config;