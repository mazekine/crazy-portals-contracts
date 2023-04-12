const accountAbi = {"ABIversion":2,"version":"2.2","header":["time"],"functions":[{"name":"constructor","inputs":[],"outputs":[]}],"data":[],"events":[],"fields":[{"name":"_pubkey","type":"uint256"},{"name":"_timestamp","type":"uint64"},{"name":"_constructorFlag","type":"bool"}]} as const
const gameAbi = {"ABIversion":2,"version":"2.2","header":["pubkey","time"],"functions":[{"name":"constructor","inputs":[{"name":"owner","type":"address"},{"name":"size","type":"uint8"}],"outputs":[]},{"name":"generateBoard","inputs":[{"name":"_seed","type":"uint256"}],"outputs":[]},{"name":"getSnake","inputs":[{"name":"answerId","type":"uint32"}],"outputs":[{"components":[{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"from","type":"tuple"},{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"to","type":"tuple"},{"name":"type_","type":"uint8"}],"name":"value0","type":"tuple"}]},{"name":"onSnakeReceived","inputs":[{"components":[{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"from","type":"tuple"},{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"to","type":"tuple"},{"name":"type_","type":"uint8"}],"name":"snake","type":"tuple"}],"outputs":[]},{"name":"getBoard","inputs":[{"name":"answerId","type":"uint32"}],"outputs":[{"components":[{"name":"columns","type":"uint8"},{"name":"rows","type":"uint8"}],"name":"_board","type":"tuple"},{"components":[{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"from","type":"tuple"},{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"to","type":"tuple"},{"name":"type_","type":"uint8"}],"name":"_snakes","type":"tuple[]"},{"components":[{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"from","type":"tuple"},{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"to","type":"tuple"},{"name":"type_","type":"uint8"}],"name":"_ladders","type":"tuple[]"}]},{"name":"roll","inputs":[{"name":"answerId","type":"uint32"}],"outputs":[{"name":"dice","type":"uint8"},{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"newPosition","type":"tuple"}]},{"name":"createRound","inputs":[{"name":"answerId","type":"uint32"}],"outputs":[{"components":[{"name":"id","type":"uint64"},{"name":"validUntil","type":"uint64"},{"name":"status","type":"uint8"},{"name":"maxPlayers","type":"uint8"},{"name":"entryStake","type":"uint128"},{"name":"prizeFund","type":"uint128"},{"name":"prizeClaimed","type":"bool"},{"name":"winner","type":"address"}],"name":"round","type":"tuple"}]},{"name":"getRound","inputs":[{"name":"answerId","type":"uint32"},{"name":"roundId","type":"uint64"}],"outputs":[{"components":[{"name":"id","type":"uint64"},{"name":"validUntil","type":"uint64"},{"name":"status","type":"uint8"},{"name":"maxPlayers","type":"uint8"},{"name":"entryStake","type":"uint128"},{"name":"prizeFund","type":"uint128"},{"name":"prizeClaimed","type":"bool"},{"name":"winner","type":"address"}],"name":"round","type":"optional(tuple)"}]},{"name":"getRounds","inputs":[{"name":"answerId","type":"uint32"}],"outputs":[{"components":[{"name":"id","type":"uint64"},{"name":"validUntil","type":"uint64"},{"name":"status","type":"uint8"},{"name":"maxPlayers","type":"uint8"},{"name":"entryStake","type":"uint128"},{"name":"prizeFund","type":"uint128"},{"name":"prizeClaimed","type":"bool"},{"name":"winner","type":"address"}],"name":"_rounds","type":"tuple[]"}]},{"name":"setMaxPlayers","inputs":[{"name":"qty","type":"uint8"}],"outputs":[]},{"name":"setMaxRoundTimeMs","inputs":[{"name":"ms","type":"uint64"}],"outputs":[]},{"name":"setPrizeFund","inputs":[{"name":"amount","type":"uint128"}],"outputs":[]},{"name":"setEntryStake","inputs":[{"name":"amount","type":"uint128"}],"outputs":[]},{"name":"joinRound","inputs":[{"name":"answerId","type":"uint32"},{"name":"roundId","type":"uint64"}],"outputs":[{"name":"result","type":"bool"}]},{"name":"claim","inputs":[{"name":"roundId","type":"uint64"}],"outputs":[]},{"name":"owner","inputs":[{"name":"answerId","type":"uint32"}],"outputs":[{"name":"value0","type":"address"}]},{"name":"renounceOwnership","inputs":[],"outputs":[]},{"name":"transferOwnership","inputs":[{"name":"newOwner","type":"address"}],"outputs":[]},{"name":"rounds","inputs":[],"outputs":[{"components":[{"name":"id","type":"uint64"},{"name":"validUntil","type":"uint64"},{"name":"status","type":"uint8"},{"name":"maxPlayers","type":"uint8"},{"name":"entryStake","type":"uint128"},{"name":"prizeFund","type":"uint128"},{"name":"prizeClaimed","type":"bool"},{"name":"winner","type":"address"}],"name":"rounds","type":"map(uint64,tuple)"}]},{"name":"maxPlayers","inputs":[],"outputs":[{"name":"maxPlayers","type":"uint8"}]},{"name":"maxRoundTimeMs","inputs":[],"outputs":[{"name":"maxRoundTimeMs","type":"uint64"}]},{"name":"board","inputs":[],"outputs":[{"components":[{"name":"columns","type":"uint8"},{"name":"rows","type":"uint8"}],"name":"board","type":"tuple"}]},{"name":"boardInitialized","inputs":[],"outputs":[{"name":"boardInitialized","type":"bool"}]},{"name":"seed","inputs":[],"outputs":[{"name":"seed","type":"uint256"}]},{"name":"prizeFundPerRound","inputs":[],"outputs":[{"name":"prizeFundPerRound","type":"uint128"}]},{"name":"entryStake","inputs":[],"outputs":[{"name":"entryStake","type":"uint128"}]}],"data":[],"events":[{"name":"OwnershipTransferred","inputs":[{"name":"previousOwner","type":"address"},{"name":"newOwner","type":"address"}],"outputs":[]},{"name":"DiceRolled","inputs":[{"name":"player","type":"address"},{"name":"dice","type":"uint8"},{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"from","type":"tuple"},{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"to","type":"tuple"}],"outputs":[]},{"name":"PathFound","inputs":[{"name":"player","type":"address"},{"components":[{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"from","type":"tuple"},{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"to","type":"tuple"},{"name":"type_","type":"uint8"}],"name":"path","type":"tuple"}],"outputs":[]},{"name":"BoardGenerated","inputs":[{"components":[{"name":"columns","type":"uint8"},{"name":"rows","type":"uint8"}],"name":"board","type":"tuple"},{"components":[{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"from","type":"tuple"},{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"to","type":"tuple"},{"name":"type_","type":"uint8"}],"name":"snakes","type":"tuple[]"},{"components":[{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"from","type":"tuple"},{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"to","type":"tuple"},{"name":"type_","type":"uint8"}],"name":"ladders","type":"tuple[]"}],"outputs":[]},{"name":"EntryStakeUpdated","inputs":[{"name":"board","type":"address"},{"name":"oldValue","type":"uint128"},{"name":"newValue","type":"uint128"}],"outputs":[]},{"name":"PrizeFundUpdated","inputs":[{"name":"board","type":"address"},{"name":"oldValue","type":"uint128"},{"name":"newValue","type":"uint128"}],"outputs":[]},{"name":"MaxRoundTimeMsUpdated","inputs":[{"name":"board","type":"address"},{"name":"oldValue","type":"uint64"},{"name":"newValue","type":"uint64"}],"outputs":[]},{"name":"MaxPlayersUpdated","inputs":[{"name":"board","type":"address"},{"name":"oldValue","type":"uint8"},{"name":"newValue","type":"uint8"}],"outputs":[]},{"name":"RoundCreated","inputs":[{"name":"board","type":"address"},{"components":[{"name":"id","type":"uint64"},{"name":"validUntil","type":"uint64"},{"name":"status","type":"uint8"},{"name":"maxPlayers","type":"uint8"},{"name":"entryStake","type":"uint128"},{"name":"prizeFund","type":"uint128"},{"name":"prizeClaimed","type":"bool"},{"name":"winner","type":"address"}],"name":"round","type":"tuple"}],"outputs":[]},{"name":"RoundJoined","inputs":[{"name":"board","type":"address"},{"components":[{"name":"id","type":"uint64"},{"name":"validUntil","type":"uint64"},{"name":"status","type":"uint8"},{"name":"maxPlayers","type":"uint8"},{"name":"entryStake","type":"uint128"},{"name":"prizeFund","type":"uint128"},{"name":"prizeClaimed","type":"bool"},{"name":"winner","type":"address"}],"name":"round","type":"tuple"},{"name":"player","type":"address"}],"outputs":[]},{"name":"PrizeClaimed","inputs":[{"name":"board","type":"address"},{"components":[{"name":"id","type":"uint64"},{"name":"validUntil","type":"uint64"},{"name":"status","type":"uint8"},{"name":"maxPlayers","type":"uint8"},{"name":"entryStake","type":"uint128"},{"name":"prizeFund","type":"uint128"},{"name":"prizeClaimed","type":"bool"},{"name":"winner","type":"address"}],"name":"rouns","type":"tuple"},{"name":"player","type":"address"}],"outputs":[]}],"fields":[{"name":"_pubkey","type":"uint256"},{"name":"_timestamp","type":"uint64"},{"name":"_constructorFlag","type":"bool"},{"name":"_owner","type":"address"},{"name":"_initialized","type":"bool"},{"name":"MAX_SNAKES","type":"map(uint8,uint8)"},{"name":"MAX_LADDERS","type":"map(uint8,uint8)"},{"name":"MAX_ROUND_TIME_MS_DEFAULT","type":"uint64"},{"components":[{"name":"id","type":"uint64"},{"name":"validUntil","type":"uint64"},{"name":"status","type":"uint8"},{"name":"maxPlayers","type":"uint8"},{"name":"entryStake","type":"uint128"},{"name":"prizeFund","type":"uint128"},{"name":"prizeClaimed","type":"bool"},{"name":"winner","type":"address"}],"name":"rounds","type":"map(uint64,tuple)"},{"name":"maxPlayers","type":"uint8"},{"name":"maxRoundTimeMs","type":"uint64"},{"components":[{"name":"columns","type":"uint8"},{"name":"rows","type":"uint8"}],"name":"board","type":"tuple"},{"components":[{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"from","type":"tuple"},{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"to","type":"tuple"},{"name":"type_","type":"uint8"}],"name":"snakes","type":"tuple[]"},{"components":[{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"from","type":"tuple"},{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"to","type":"tuple"},{"name":"type_","type":"uint8"}],"name":"ladders","type":"tuple[]"},{"name":"boardInitialized","type":"bool"},{"name":"seed","type":"uint256"},{"name":"prizeFundPerRound","type":"uint128"},{"name":"entryStake","type":"uint128"},{"name":"mapPlayerRound","type":"map(address,uint64)"},{"name":"mapRoundPlayers","type":"map(uint64,address[])"},{"name":"playerCell","type":"map(address,uint8)"},{"components":[{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"from","type":"tuple"},{"components":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"to","type":"tuple"},{"name":"type_","type":"uint8"}],"name":"cells","type":"map(uint8,optional(tuple))"}]} as const

export const factorySource = {
    Account: accountAbi,
    Game: gameAbi
} as const

export type FactorySource = typeof factorySource
export type AccountAbi = typeof accountAbi
export type GameAbi = typeof gameAbi