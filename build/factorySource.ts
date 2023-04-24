const accountAbi = {"ABIversion":2,"version":"2.2","header":["time"],"functions":[{"name":"constructor","inputs":[],"outputs":[]}],"data":[],"events":[],"fields":[{"name":"_pubkey","type":"uint256"},{"name":"_timestamp","type":"uint64"},{"name":"_constructorFlag","type":"bool"}]} as const
const gameAbi = {"ABIversion":2,"version":"2.2","header":["time"],"functions":[{"name":"constructor","inputs":[{"name":"owner","type":"address"},{"name":"size","type":"uint16"}],"outputs":[]},{"name":"generateBoard","inputs":[{"name":"_seed","type":"uint256"},{"name":"_maxSnakes","type":"uint16"},{"name":"_maxLadders","type":"uint16"}],"outputs":[]},{"name":"getBoard","inputs":[{"name":"answerId","type":"uint32"}],"outputs":[{"components":[{"name":"columns","type":"uint16"},{"name":"rows","type":"uint16"}],"name":"_board","type":"tuple"},{"components":[{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"from","type":"tuple"},{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"to","type":"tuple"},{"name":"type_","type":"uint8"}],"name":"_snakes","type":"tuple[]"},{"components":[{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"from","type":"tuple"},{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"to","type":"tuple"},{"name":"type_","type":"uint8"}],"name":"_ladders","type":"tuple[]"}]},{"name":"roll","inputs":[{"name":"answerId","type":"uint32"}],"outputs":[{"name":"dice","type":"uint16"},{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"newPosition","type":"tuple"}]},{"name":"getRoundLatestMove","inputs":[{"name":"answerId","type":"uint32"},{"name":"roundId","type":"uint64"}],"outputs":[{"components":[{"name":"expiresAt","type":"uint64"},{"components":[{"components":[{"name":"cell","type":"uint16"},{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"coordinate","type":"tuple"}],"name":"from","type":"tuple"},{"components":[{"name":"cell","type":"uint16"},{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"coordinate","type":"tuple"}],"name":"to","type":"tuple"}],"name":"playerSteps","type":"map(address,tuple[])"}],"name":"move","type":"optional(tuple)"}]},{"name":"createRound","inputs":[{"name":"answerId","type":"uint32"}],"outputs":[{"components":[{"name":"id","type":"uint64"},{"name":"validUntil","type":"uint64"},{"name":"moveDuration","type":"uint64"},{"name":"status","type":"uint8"},{"name":"maxPlayers","type":"uint16"},{"name":"entryStake","type":"uint128"},{"name":"prizeFund","type":"uint128"},{"name":"prizeClaimed","type":"bool"},{"name":"winner","type":"address"}],"name":"round","type":"tuple"}]},{"name":"getRound","inputs":[{"name":"answerId","type":"uint32"},{"name":"roundId","type":"uint64"}],"outputs":[{"components":[{"name":"id","type":"uint64"},{"name":"validUntil","type":"uint64"},{"name":"moveDuration","type":"uint64"},{"name":"status","type":"uint8"},{"name":"maxPlayers","type":"uint16"},{"name":"entryStake","type":"uint128"},{"name":"prizeFund","type":"uint128"},{"name":"prizeClaimed","type":"bool"},{"name":"winner","type":"address"}],"name":"round","type":"optional(tuple)"}]},{"name":"getRounds","inputs":[{"name":"answerId","type":"uint32"},{"name":"status","type":"optional(uint8)"}],"outputs":[{"components":[{"name":"id","type":"uint64"},{"name":"validUntil","type":"uint64"},{"name":"moveDuration","type":"uint64"},{"name":"status","type":"uint8"},{"name":"maxPlayers","type":"uint16"},{"name":"entryStake","type":"uint128"},{"name":"prizeFund","type":"uint128"},{"name":"prizeClaimed","type":"bool"},{"name":"winner","type":"address"}],"name":"_rounds","type":"tuple[]"}]},{"name":"setMaxPlayers","inputs":[{"name":"qty","type":"uint16"}],"outputs":[]},{"name":"setMaxRoundTimeMs","inputs":[{"name":"ms","type":"uint64"}],"outputs":[]},{"name":"setPrizeFund","inputs":[{"name":"amount","type":"uint128"}],"outputs":[]},{"name":"setEntryStake","inputs":[{"name":"amount","type":"uint128"}],"outputs":[]},{"name":"joinRound","inputs":[{"name":"answerId","type":"uint32"},{"name":"roundId","type":"uint64"}],"outputs":[{"name":"result","type":"bool"}]},{"name":"claim","inputs":[{"name":"roundId","type":"uint64"}],"outputs":[]},{"name":"owner","inputs":[{"name":"answerId","type":"uint32"}],"outputs":[{"name":"value0","type":"address"}]},{"name":"renounceOwnership","inputs":[],"outputs":[]},{"name":"transferOwnership","inputs":[{"name":"newOwner","type":"address"}],"outputs":[]},{"name":"nonce","inputs":[],"outputs":[{"name":"nonce","type":"uint64"}]},{"name":"maxPlayers","inputs":[],"outputs":[{"name":"maxPlayers","type":"uint16"}]},{"name":"maxRoundDurationMs","inputs":[],"outputs":[{"name":"maxRoundDurationMs","type":"uint64"}]},{"name":"maxMoveDurationMs","inputs":[],"outputs":[{"name":"maxMoveDurationMs","type":"uint64"}]},{"name":"board","inputs":[],"outputs":[{"components":[{"name":"columns","type":"uint16"},{"name":"rows","type":"uint16"}],"name":"board","type":"tuple"}]},{"name":"boardInitialized","inputs":[],"outputs":[{"name":"boardInitialized","type":"bool"}]},{"name":"prizeFundPerRound","inputs":[],"outputs":[{"name":"prizeFundPerRound","type":"uint128"}]},{"name":"entryStake","inputs":[],"outputs":[{"name":"entryStake","type":"uint128"}]},{"name":"maxSnakes","inputs":[],"outputs":[{"name":"maxSnakes","type":"uint16"}]},{"name":"maxLadders","inputs":[],"outputs":[{"name":"maxLadders","type":"uint16"}]}],"data":[{"key":1,"name":"nonce","type":"uint64"}],"events":[{"name":"OwnershipTransferred","inputs":[{"name":"previousOwner","type":"address"},{"name":"newOwner","type":"address"}],"outputs":[]},{"name":"DiceRolled","inputs":[{"name":"player","type":"address"},{"name":"dice","type":"uint16"}],"outputs":[]},{"name":"PathFound","inputs":[{"name":"player","type":"address"},{"components":[{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"from","type":"tuple"},{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"to","type":"tuple"},{"name":"type_","type":"uint8"}],"name":"path","type":"tuple"}],"outputs":[]},{"name":"BoardGenerated","inputs":[{"components":[{"name":"columns","type":"uint16"},{"name":"rows","type":"uint16"}],"name":"board","type":"tuple"},{"components":[{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"from","type":"tuple"},{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"to","type":"tuple"},{"name":"type_","type":"uint8"}],"name":"snakes","type":"tuple[]"},{"components":[{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"from","type":"tuple"},{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"to","type":"tuple"},{"name":"type_","type":"uint8"}],"name":"ladders","type":"tuple[]"}],"outputs":[]},{"name":"EntryStakeUpdated","inputs":[{"name":"board","type":"address"},{"name":"oldValue","type":"uint128"},{"name":"newValue","type":"uint128"}],"outputs":[]},{"name":"PrizeFundUpdated","inputs":[{"name":"board","type":"address"},{"name":"oldValue","type":"uint128"},{"name":"newValue","type":"uint128"}],"outputs":[]},{"name":"MaxRoundTimeMsUpdated","inputs":[{"name":"board","type":"address"},{"name":"oldValue","type":"uint64"},{"name":"newValue","type":"uint64"}],"outputs":[]},{"name":"MaxPlayersUpdated","inputs":[{"name":"board","type":"address"},{"name":"oldValue","type":"uint16"},{"name":"newValue","type":"uint16"}],"outputs":[]},{"name":"RoundCreated","inputs":[{"name":"board","type":"address"},{"name":"roundId","type":"uint64"}],"outputs":[]},{"name":"RoundJoined","inputs":[{"name":"board","type":"address"},{"name":"roundId","type":"uint64"},{"name":"player","type":"address"}],"outputs":[]},{"name":"PlayerMoved","inputs":[{"name":"board","type":"address"},{"name":"round","type":"uint64"},{"name":"player","type":"address"},{"components":[{"name":"cell","type":"uint16"},{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"coordinate","type":"tuple"}],"name":"from","type":"tuple"},{"components":[{"name":"cell","type":"uint16"},{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"coordinate","type":"tuple"}],"name":"to","type":"tuple"}],"outputs":[]},{"name":"RoundFinished","inputs":[{"name":"board","type":"address"},{"name":"roundId","type":"uint64"},{"name":"winner","type":"address"}],"outputs":[]},{"name":"PrizeClaimed","inputs":[{"name":"board","type":"address"},{"name":"roundId","type":"uint64"},{"name":"player","type":"address"}],"outputs":[]}],"fields":[{"name":"_pubkey","type":"uint256"},{"name":"_timestamp","type":"uint64"},{"name":"_constructorFlag","type":"bool"},{"name":"_owner","type":"address"},{"name":"_initialized","type":"bool"},{"name":"nonce","type":"uint64"},{"name":"MAX_ROUND_DURATION_MS_DEFAULT","type":"uint64"},{"name":"MOVE_DURATION_MS_DEFAULT","type":"uint64"},{"name":"TX_STORAGE_FEE","type":"uint128"},{"name":"RAKE","type":"uint128"},{"components":[{"name":"id","type":"uint64"},{"name":"validUntil","type":"uint64"},{"name":"moveDuration","type":"uint64"},{"name":"status","type":"uint8"},{"name":"maxPlayers","type":"uint16"},{"name":"entryStake","type":"uint128"},{"name":"prizeFund","type":"uint128"},{"name":"prizeClaimed","type":"bool"},{"name":"winner","type":"address"}],"name":"rounds","type":"map(uint64,tuple)"},{"name":"maxPlayers","type":"uint16"},{"name":"maxRoundDurationMs","type":"uint64"},{"name":"maxMoveDurationMs","type":"uint64"},{"components":[{"name":"columns","type":"uint16"},{"name":"rows","type":"uint16"}],"name":"board","type":"tuple"},{"components":[{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"from","type":"tuple"},{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"to","type":"tuple"},{"name":"type_","type":"uint8"}],"name":"snakes","type":"tuple[]"},{"components":[{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"from","type":"tuple"},{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"to","type":"tuple"},{"name":"type_","type":"uint8"}],"name":"ladders","type":"tuple[]"},{"name":"boardInitialized","type":"bool"},{"name":"seed","type":"uint256"},{"name":"prizeFundPerRound","type":"uint128"},{"name":"entryStake","type":"uint128"},{"name":"maxSnakes","type":"uint16"},{"name":"maxLadders","type":"uint16"},{"name":"playerRound","type":"map(address,uint64)"},{"name":"roundPlayers","type":"map(uint64,address[])"},{"components":[{"name":"expiresAt","type":"uint64"},{"components":[{"components":[{"name":"cell","type":"uint16"},{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"coordinate","type":"tuple"}],"name":"from","type":"tuple"},{"components":[{"name":"cell","type":"uint16"},{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"coordinate","type":"tuple"}],"name":"to","type":"tuple"}],"name":"playerSteps","type":"map(address,tuple[])"}],"name":"roundMoves","type":"map(uint64,tuple)"},{"name":"playerCell","type":"map(address,uint16)"},{"components":[{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"from","type":"tuple"},{"components":[{"name":"x","type":"uint16"},{"name":"y","type":"uint16"}],"name":"to","type":"tuple"},{"name":"type_","type":"uint8"}],"name":"cells","type":"map(uint16,optional(tuple))"}]} as const

export const factorySource = {
    Account: accountAbi,
    Game: gameAbi
} as const

export type FactorySource = typeof factorySource
export type AccountAbi = typeof accountAbi
export type GameAbi = typeof gameAbi
