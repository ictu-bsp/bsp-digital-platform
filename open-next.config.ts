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

import { defineHexConfig } from '@opennextjs/cloudflare';

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
    external: ['pg-cloudflare'], 
  },
  edgeExternals: ["node:crypto"],
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