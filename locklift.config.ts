import { LockliftConfig } from "locklift";
import { FactorySource } from "./build/factorySource";
import "@broxus/locklift-deploy";
import { Deployments } from "@broxus/locklift-deploy";
import "@broxus/locklift-verifier";
//import {ConnectionFactory} from "everscale-standalone-client";

declare global {
  const locklift: import("locklift").Locklift<FactorySource>;
}

declare module "locklift" {
  //@ts-ignore
  export interface Locklift {
    deployments: Deployments<FactorySource>;
  }
}

const LOCAL_NETWORK_ENDPOINT = process.env.NETWORK_ENDPOINT || "http://localhost/graphql";
const DEV_NET_NETWORK_ENDPOINT = process.env.DEV_NET_NETWORK_ENDPOINT || "https://devnet-sandbox.evercloud.dev/graphql";
const VENOM_DEV_NET_NETWORK_ENDPOINT = process.env.VENOM_DEV_NET_NETWORK_ENDPOINT || "https://jrpc-devnet.venom.foundation/rpc";

// Create your own link on https://dashboard.evercloud.dev/
const MAIN_NET_NETWORK_ENDPOINT = process.env.MAIN_NET_NETWORK_ENDPOINT || "https://mainnet.evercloud.dev/XXX/graphql";

// @ts-ignore
const config: LockliftConfig = {
  compiler: {
    // Specify path to your TON-Solidity-Compiler
    // path: "/mnt/o/projects/broxus/TON-Solidity-Compiler/build/solc/solc",

    // Or specify version of compiler
    version: "0.66.0",

    // Specify config for extarnal contracts as in exapmple
    // externalContracts: {
    //   "node_modules/broxus-ton-tokens-contracts/build": ['TokenRoot', 'TokenWallet']
    // }
  },
  linker: {
    // Specify path to your stdlib
    // lib: "/mnt/o/projects/broxus/TON-Solidity-Compiler/lib/stdlib_sol.tvm",
    // // Specify path to your Linker
    // path: "/mnt/o/projects/broxus/TVM-linker/target/release/tvm_linker",

    // Or specify version of linker
    version: "0.20.2" //"0.15.48",
  },
  networks: {
    locklift: {
      giver: {
        // Check if you need provide custom giver
        address: "0:ece57bcc6c530283becbbd8a3b24d3c5987cdddc3c8b7b33be6e4a6312490415",
        key: "172af540e43a524763dd53b26a066d472a97c4de37d5498170564510608250c3",
      },
      connection: {
        id: 1001,
        type: "proxy",
        //@ts-ignore
        data: {}
      },
      keys: {
        amount: 20,
      },
    },
    local: {
      // Specify connection settings for https://github.com/broxus/everscale-standalone-client/
      connection: {
        id: 1,
        group: "localnet",
        type: "graphql",
        data: {
          endpoints: [LOCAL_NETWORK_ENDPOINT],
          latencyDetectionInterval: 1000,
          local: true,
        },
      },
      // This giver is default local-node giverV2
      giver: {
        // Check if you need provide custom giver
        address: "0:ece57bcc6c530283becbbd8a3b24d3c5987cdddc3c8b7b33be6e4a6312490415",
        key: "172af540e43a524763dd53b26a066d472a97c4de37d5498170564510608250c3",
      },
      tracing: {
        endpoint: LOCAL_NETWORK_ENDPOINT,
      },
      keys: {
        // Use everdev to generate your phrase
        // !!! Never commit it in your repos !!!
        // phrase: "action inject penalty envelope rabbit element slim tornado dinner pizza off blood",
        amount: 20,
      },
    },
    test: {
      connection: {
        id: 1,
        type: "graphql",
        group: "dev",
        data: {
          endpoints: [DEV_NET_NETWORK_ENDPOINT],
          latencyDetectionInterval: 1000,
          local: false,
        },
      },
      giver: {
        address: "0:2746d46337aa25d790c97f1aefb01a5de48cc1315b41a4f32753146a1e1aeb7d",
        key: "bb2903d025a330681e78f3bcb248d7d89b861f3e8a480eb74438ec0299319f7a",
      },
      tracing: {
        endpoint: DEV_NET_NETWORK_ENDPOINT,
      },
      keys: {
        // Use everdev to generate your phrase
        // !!! Never commit it in your repos !!!
        // phrase: "action inject penalty envelope rabbit element slim tornado dinner pizza off blood",
        amount: 20,
      },
    },
    venomDevnet: {
      connection: {
        id: 1002,
        type: "jrpc",
        group: "dev",
        data: {
          endpoint: VENOM_DEV_NET_NETWORK_ENDPOINT
        },
      },
      giver: {
        address: "0:c1ae39628c7a9b22f7da6522c6daa609290bb6394be1d31292d83b85be4baeb7",
        key: "e8ed2c8e681e9fdb57bd4338307cd00056edf42f9b3c8fdf36d1f624af686607"
      },
      tracing: {
        endpoint: VENOM_DEV_NET_NETWORK_ENDPOINT,
      },
      keys: {
        // Use everdev to generate your phrase
        // !!! Never commit it in your repos !!!
        // phrase: "action inject penalty envelope rabbit element slim tornado dinner pizza off blood",
        amount: 20,
      },
    },
    main: {
      // Specify connection settings for https://github.com/broxus/everscale-standalone-client/
      connection: {
        id: 1,
        type: "graphql",
        group: "main",
        data: {
          endpoints: [MAIN_NET_NETWORK_ENDPOINT],
          latencyDetectionInterval: 1000,
          local: false,
        },
      },
      // This giver is default Wallet
      giver: {
        address: "0:0000000000000000000000000000000000000000000000000000000000000000",
        key: "secret key",
      },
      tracing: {
        endpoint: MAIN_NET_NETWORK_ENDPOINT,
      },
      keys: {
        // Use everdev to generate your phrase
        // !!! Never commit it in your repos !!!
        // phrase: "action inject penalty envelope rabbit element slim tornado dinner pizza off blood",
        amount: 20,
      },
    },
  },
  mocha: {
    timeout: 2000000,
    bail: true
  },
  verifier: {
    verifierVersion: "latest", // contract verifier binary, see https://github.com/broxus/everscan-verify/releases
    apiKey: "uwJlTyvauW",
    secretKey: "IEx2jg4hqE3V1YUqcVOY",
    // license: "AGPL-3.0-or-later", <- this is default value and can be overrided
  },
};

export default config;
