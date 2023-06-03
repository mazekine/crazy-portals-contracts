import {expect} from "chai";
import chai from "chai";
import {
    Address, Contract, ContractMethod, DecodeOutputParams,
    lockliftChai
} from "locklift";
import {FactorySource, GameAbi} from "../build/factorySource";
import exp from "constants";
import {Account} from "everscale-standalone-client";

chai.use(lockliftChai);

type MethodReturnType<A extends any, N extends keyof Contract<A>["methods"] & string> = ReturnType<
    //@ts-ignore
    ReturnType<Contract<A>["methods"][N]>["call"]
> extends Promise<infer T>
    ? T
    : never;

type GetBoardResponse = MethodReturnType<GameAbi, "getBoard">;
type GetRoundsResponse = MethodReturnType<GameAbi, "getRounds">;
type GetRoundResponse = MethodReturnType<GameAbi, "getRound">;
type GetRoundLatestMoveResponse = MethodReturnType<GameAbi, "getRoundLatestMove">;

let deployer: Address;
let opponent: Address;
let game: Contract<FactorySource["Game"]>;
let tabulator: string = "        ";
let nTabulator = "\n" + tabulator;
let board: GetBoardResponse;
let round: GetRoundResponse;
let roundId: string;

const ROLL_GAS = locklift.utils.toNano(1);
const RAKE = locklift.utils.toNano(0.02);
const JACKPOT_RATE = 50;

describe("Test Game", async function () {
    before(async () => {
        await locklift.deployments.fixture({include: ["deployer", "testGame"]});
        deployer = await locklift.deployments.getAccount("Deployer").account.address;
        opponent = await locklift.deployments.getAccount("Opponent").account.address;
        game = locklift.deployments.getContract<GameAbi>("TestGame");

        console.log("\nGame deployed at: " + game.address + "\n");
    });

    describe("Contracts", async function () {
        it("Preliminary checks", async function () {
            const gameData = await locklift.factory.getContractArtifacts("Game");

            expect(gameData.code).not.to.equal(undefined, "Code should be available");
            expect(gameData.abi).not.to.equal(undefined, "ABI should be available");
            expect(gameData.tvc).not.to.equal(undefined, "tvc should be available");

            expect(+(await locklift.provider.getBalance(deployer))).to.be.greaterThan(+locklift.utils.toNano(5), "Deployer balance is insufficient");
            expect(+(await locklift.provider.getBalance(opponent))).to.be.greaterThan(+locklift.utils.toNano(5), "Opponent balance is insufficient");
        });


/*
        it("Test sorting methods", async function() {
            const inputArray = generateRandomUintArray(30, 0, 100);
            console.log(nTabulator + "Input array: " + inputArray.toString());

            let balance = await locklift.provider.getBalance(game.address);

            const mapSortTx = await locklift.tracing.trace(game
                .methods
                .tryMapSort({
                    arr: inputArray
                })
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(1),
                    bounce: true
                }), {raise: false}
            )

            mapSortTx.traceTree?.beautyPrint();
            console.log(tabulator + "Map sort consumed "+ mapSortTx.totalFees + " gas");

            const quickSortTx = await locklift.tracing.trace(game
                .methods
                .tryQuickSort({
                    arr: inputArray
                })
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(1),
                    bounce: true
                }), {raise: false}
            )

            quickSortTx.traceTree?.beautyPrint();
            console.log(tabulator + "Quick sort consumed "+ quickSortTx.totalFees + " gas");
        });
*/

        it("Generate board", async function () {
            let boardGeneratedTx = await locklift.tracing.trace(game
                .methods
                .generateBoard({
                    _seed: "31071986",
                    _maxRedBeams: 100,
                    _maxBlueBeams: 100
                })
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(1),
                    bounce: true
                }), {raise: false}
            )

            expect(boardGeneratedTx.traceTree).has.error(3009);

            const SNAKES = 8;
            const LADDERS = 8;

            boardGeneratedTx = await locklift.tracing.trace(game
                .methods
                .generateBoard({
                    _seed: "31071986",
                    _maxRedBeams: SNAKES,
                    _maxBlueBeams: LADDERS
                })
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(1),
                    bounce: true
                }), {raise: true}
            )

            expect(boardGeneratedTx.traceTree).emit("BoardGenerated")
                .and.not.to.have.error();

            board = await game
                .methods
                .getBoard({answerId: 0})
                .call();

            expect(board._redBeams.length).to.be.equal(SNAKES, "Wrong number of redBeams");
            expect(board._blueBeams.length).to.be.equal(LADDERS, "Wrong number of blueBeams");

            let cells: Map<number, boolean> = new Map();
            board._redBeams.forEach(
                (redBeam) => {
                    //  Head
                    let cols = +board._board.columns;
                    let cellNumber: number = getCell(+redBeam.from.x, +redBeam.from.y, cols);
                    expect(cellNumber).to.be.lessThanOrEqual(+board._board.columns * +board._board.rows, "RedBeam head is located incorrectly:" + redBeam);
                    expect(!cells.has(cellNumber), "RedBeams generated incorrectly (head put on filled cell)\n" + board._redBeams);
                    cells.set(cellNumber, true);

                    //  Tail
                    cellNumber = getCell(+redBeam.to.x, +redBeam.to.y, cols);
                    expect(cellNumber).to.be.lessThanOrEqual(+board._board.columns * +board._board.rows, "RedBeam tail is located incorrectly:" + redBeam);
                    expect(!cells.has(cellNumber), "RedBeams generated incorrectly (tail put on filled cell)\n" + board._redBeams);
                    cells.set(cellNumber, true);
                }
            );

            board._blueBeams.forEach(
                (blueBeam) => {
                    //  Head
                    let cols = +board._board.columns;
                    let cellNumber: number = getCell(+blueBeam.from.x, +blueBeam.from.y, cols);
                    expect(cellNumber).to.be.lessThanOrEqual(+board._board.columns * +board._board.rows, "BlueBeam head is located incorrectly:" + blueBeam);
                    expect(!cells.has(cellNumber), "BlueBeams generated incorrectly (head put on filled cell)\n" + board._redBeams);
                    cells.set(cellNumber, true);

                    //  Tail
                    cellNumber = getCell(+blueBeam.to.x, +blueBeam.to.y, cols);
                    expect(cellNumber).to.be.lessThanOrEqual(+board._board.columns * +board._board.rows, "BlueBeam tail is located incorrectly:" + blueBeam);
                    expect(!cells.has(cellNumber), "BlueBeams generated incorrectly (tail put on filled cell)\n" + board._redBeams);
                    cells.set(cellNumber, true);
                }
            );

            console.log(nTabulator + "Board generated");
            console.log(tabulator + "Game balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(game.address)) + " EVER");
        });

        it("Set maximum players", async function () {
            const maxPlayerTx = await locklift.tracing.trace(game
                .methods
                .setMaxPlayers({
                    qty: 2
                })
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(0.2),
                    bounce: true
                }), {raise: true}
            )

            expect(maxPlayerTx.traceTree).emit("MaxPlayersUpdated")
                .and.not.to.have.error();

            const maxPlayers = await game.methods.maxPlayers().call();
            expect(+maxPlayers.maxPlayers).to.be.equal(2, "Wrong players number");
            console.log(nTabulator + "Max players set to 2");
            console.log(tabulator + "Game balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(game.address)) + " EVER");
        });

        const PRIZE_FUND = 10;

        it("Set prize fund", async function () {
            const prizeFundTx = await locklift.tracing.trace(game
                .methods
                .setPrizeFund({
                    amount: locklift.utils.toNano(PRIZE_FUND)
                })
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(0.2),
                    bounce: true
                }), {raise: true}
            )

            expect(prizeFundTx.traceTree).emit("PrizeFundUpdated")
                .and.not.to.have.error();

            await locklift.giver.sendTo(game.address, locklift.utils.toNano(PRIZE_FUND));

            const prizeFund = await game.methods.prizeFundPerRound().call();
            expect(prizeFund.prizeFundPerRound).to.be.equal(locklift.utils.toNano(PRIZE_FUND), "Wrong prize fund");

            console.log(nTabulator + "Prize fund set to " + PRIZE_FUND + " EVER");
            console.log(tabulator + "Game balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(game.address)) + " EVER");
        });

        it("Set rake rate", async function () {
            const prizeFundTx = await locklift.tracing.trace(game
                .methods
                .setRake({
                    amount: RAKE
                })
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(0.2),
                    bounce: true
                }), {raise: true}
            )

            expect(prizeFundTx.traceTree).emit("RakeUpdated")
                .and.not.to.have.error();

            const rake = await game.methods.rake().call();
            expect(rake.rake).to.be.equal(RAKE, "Wrong rake");

            console.log(nTabulator + "Rake set to " + locklift.utils.fromNano(rake.rake) + " EVER");
            console.log(tabulator + "Game balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(game.address)) + " EVER");
        });

        it("Set jackpot rate", async function () {
            const prizeFundTx = await locklift.tracing.trace(game
                .methods
                .setJackpotRate({
                    rate: JACKPOT_RATE
                })
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(0.2),
                    bounce: true
                }), {raise: true}
            )

            expect(prizeFundTx.traceTree).emit("JackpotRateUpdated")
                .and.not.to.have.error();

            const jpRate = await game.methods.jackpotRate().call();
            expect(jpRate.jackpotRate).to.be.equal(JACKPOT_RATE.toString(), "Wrong jackpot rate");

            console.log(nTabulator + "Jackpot rate set to " + jpRate.jackpotRate + "%");
            console.log(tabulator + "Game balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(game.address)) + " EVER");
        });

        it("Set jackpot averaged periods", async function () {
            const jpAveragedPeriodsTx = await locklift.tracing.trace(game
                .methods
                .setJackpotAveragedPeriods({
                    qty: 5
                })
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(0.2),
                    bounce: true
                }), {raise: true}
            )

            expect(jpAveragedPeriodsTx.traceTree).emit("JackpotAveragedPeriodsUpdated")
                .and.not.to.have.error();

            const jpAveragedPeriods = await game.methods.jackpotAveragedPeriods().call();
            expect(jpAveragedPeriods.jackpotAveragedPeriods).to.be.equal("5", "Incorrect averaged periods value");
        })

        it("Set jackpot minimum probability", async function () {
            const MIN_PROBABILITY = 1000;

            const jpMinProbabilityTx = await locklift.tracing.trace(game
                .methods
                .setJackpotMinProbability({
                    p: MIN_PROBABILITY
                })
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(0.2),
                    bounce: true
                }), {raise: true}
            )

            expect(jpMinProbabilityTx.traceTree).emit("JackpotMinProbabilityUpdated")
                .and.not.to.have.error();

            const jpMinProbability = await game.methods.jackpotMinProbability().call();
            expect(jpMinProbability.jackpotMinProbability).to.be.equal(MIN_PROBABILITY.toString(), "Incorrect minimum jackpot probability value");
        })

        it("Set jackpot maximum probability", async function () {
            const MAX_PROBABILITY = 99;

            const jpMaxProbabilityTx = await locklift.tracing.trace(game
                .methods
                .setJackpotMaxProbability({
                    p: MAX_PROBABILITY
                })
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(0.2),
                    bounce: true
                }), {raise: true}
            )

            expect(jpMaxProbabilityTx.traceTree).emit("JackpotMaxProbabilityUpdated")
                .and.not.to.have.error();

            const jpMaxProbability = await game.methods.jackpotMaxProbability().call();
            expect(jpMaxProbability.jackpotMaxProbability).to.be.equal(MAX_PROBABILITY.toString(), "Incorrect maximum jackpot probability value");
        })

        it("Set jackpot probability freeze period", async function () {
            const FREEZE_PERIOD = 30;

            const jpProbabilityFreezeTx = await locklift.tracing.trace(game
                .methods
                .setJackpotProbabilityFreezePeriod({
                    period: FREEZE_PERIOD
                })
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(0.2),
                    bounce: true
                }), {raise: true}
            )

            expect(jpProbabilityFreezeTx.traceTree).emit("JackpotFreezePeriodUpdated")
                .and.not.to.have.error();

            const jpProbabilityFreezePeriod = await game.methods.jackpotProbabilityFreezePeriod().call();
            expect(jpProbabilityFreezePeriod.jackpotProbabilityFreezePeriod).to.be.equal(FREEZE_PERIOD.toString(), "Incorrect jackpot probability freeze period");
        })

        it("Create round", async function () {
            const preRounds: GetRoundsResponse = await game.methods.getRounds({ answerId: 0, status: 0 }).call();

            const createRoundTx = await locklift.tracing.trace(game
                .methods
                .createRound({
                    answerId: 0
                })
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(0.2),
                    bounce: true
                }), {raise: true}
            )

            expect(createRoundTx.traceTree).emit("RoundCreated")
                .and.not.to.have.error();

            const postRounds: GetRoundsResponse = await game.methods.getRounds({ answerId: 0, status: 0 }).call();
            const newRounds = postRounds._rounds.filter(
                (r1) =>
                    !preRounds._rounds.some(
                        (r2) =>
                            r1 == r2
                    )
            );

            expect(newRounds.length).to.be.equal(1, "Incorrect rounds number");

            roundId = newRounds.pop()!!.id;
            round = await game.methods.getRound({answerId: 0, roundId: roundId}).call();

            console.log(nTabulator + "Created round " + roundId);
            console.log(tabulator + "Game balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(game.address)) + " EVER");
        });

        it("Join round", async function () {
            let joinRoundTx = await locklift.tracing.trace(game
                .methods
                .joinRound({
                    roundId: 0
                })
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(0.2),
                    bounce: true
                }), {raise: false}
            );

            expect(joinRoundTx.traceTree).has.error(3006);

            joinRoundTx = await locklift.tracing.trace(game
                .methods
                .joinRound({
                    roundId: roundId
                })
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(0.2),
                    bounce: true
                }), {raise: false}
            );

            expect(joinRoundTx.traceTree)
                .to.emit("RoundJoined")
                .and.not.have.error();

            console.log(nTabulator + "Deployer " + maskAddress(deployer.toString()) + " joined the round");

            joinRoundTx = await locklift.tracing.trace(game
                .methods
                .joinRound({
                    roundId: roundId
                })
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(0.2),
                    bounce: true
                }), {raise: false}
            );

            expect(joinRoundTx.traceTree).to.have.error(3008);

            joinRoundTx = await locklift.tracing.trace(game
                .methods
                .joinRound({
                    roundId: roundId
                })
                .send({
                    from: opponent,
                    amount: locklift.utils.toNano(0.2),
                    bounce: true
                }), {raise: false}
            );

            expect(joinRoundTx.traceTree)
                .to.emit("RoundJoined")
                .and.not.have.error();

            console.log(tabulator + "Opponent " + maskAddress(opponent.toString()) + " joined the round");
            console.log(tabulator + "Game balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(game.address)) + " EVER");

            round = await game.methods.getRound({answerId: 0, roundId: roundId}).call();
            expect(round.round!!.status).to.be.equal("1", "Round is in the wrong status");

            let roundPlayers = await game.fields.roundPlayers.call(0);
            roundPlayers.forEach(([_rid, _rp]) => {
                if(_rid == roundId)
                    expect(_rp.length.toString()).to.be.equal(round.round!!.maxPlayers, "Wrong number of players in round");
            });

        });

        it("Roll dices", async function () {
            let stepsCounter: number = 0;

            let winner: Address;
            let deployerBalance = +(await locklift.provider.getBalance(deployer));
            let opponentBalance = +(await locklift.provider.getBalance(opponent));

            while(true) {
                stepsCounter++;
                round = await game.methods.getRound({ roundId: roundId, answerId: 0 }).call();
                let roundStatus = +round.round!!.status;
                expect(roundStatus).not.to.equal(4, "Round lasted too long and expired");

                if(roundStatus == 3) {
                    winner = round.round!!.winner;
                    const winnerName = winner == deployer ? "Deployer" : "Opponent";
                    console.log(nTabulator + "Round finished. " + winnerName + " has won");
                    console.log(tabulator + "Game balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(game.address)) + " EVER");
                    break;
                }

                let rollFirstTx = await locklift.tracing.trace(game
                    .methods
                    .roll({})
                    .send({
                        from: deployer,
                        amount: ROLL_GAS,
                        bounce: true
                    }), {raise: true, allowedCodes: {compute: [1060, 5005]}}
                );

                //rollFirstTx.traceTree?.beautyPrint();
                //expect(rollFirstTx.traceTree).to.not.have.error();

                let rollSecondTx  = await locklift.tracing.trace(game
                    .methods
                    .roll({})
                    .send({
                        from: opponent,
                        amount: ROLL_GAS,
                        bounce: true
                    }), {raise: true, allowedCodes: {compute: [1060, 5005]}}
                );

                //rollSecondTx.traceTree?.beautyPrint();

                //expect(rollSecondTx.traceTree).to.not.have.error();
                //expect(rollSecondTx.traceTree).to.emit("DiceRolled");

                let move = await game.methods.getRoundLatestMove({roundId: roundId, answerId: 0}).call();
                console.log(
                    nTabulator +
                    "Move " + stepsCounter + ": "
                );

                expect(move.move).to.not.be.null;

                if (move.move) {
                    if(move.move.playerSteps.length < 2) {
                        round = await game.methods.getRound({ roundId: roundId, answerId: 0 }).call();
                        roundStatus = +round.round!!.status;
                        if(roundStatus < 3) //  Round not finished or expired
                            expect(move.move.playerSteps.length).to.be.equal(2, "One of players hasn't moved");
                    }


                    for (const [address, steps] of move.move.playerSteps) {
                        const maskedAddress = maskAddress(address.toString());
                        const stepsSummary = steps
                            .map(
                                (step) =>
                                    `[${step.from.cell}, ${step.from.coordinate.x}, ${step.from.coordinate.y}] --> [${step.to.cell}, ${step.to.coordinate.x}, ${step.to.coordinate.y}]`,
                            )
                            .join('; ');
                        console.log(tabulator.repeat(2) + `${maskedAddress}: ${stepsSummary}`);
                    }
                    console.log(tabulator.repeat(2) + "Game balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(game.address)) + " EVER");
                } else {
                    throw "Move is empty";
                }
            }

            //  Check the balance before claiming
            //let winnerBalanceBeforeClaim = +(await locklift.provider.getBalance(winner));

            let claimTx = await locklift.tracing.trace(game
                .methods
                .claim({roundId: roundId})
                .send({
                    from: winner,
                    amount: locklift.utils.toNano(0.1),
                    bounce: true
                }), {raise: false}
            );

            expect(claimTx.traceTree).to.not.have.error();

            let winnerBalanceAfterClaim = +(await locklift.provider.getBalance(winner));

            console.log(nTabulator + "Received prize of " + locklift.utils.fromNano(round.round!.prizeFund) + " EVER");
            console.log(tabulator + "Game balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(game.address)) + " EVER\n");

            let winnerBalanceBeforeClaim = (winner == deployer) ? deployerBalance : opponentBalance;
            let winnerSpent = winnerBalanceAfterClaim - winnerBalanceBeforeClaim - +round.round!.prizeFund;

            console.log(tabulator + "Winner spent: " + locklift.utils.fromNano(winnerSpent) + " EVER");
            console.log(tabulator + "Average gas per roll: " + (+locklift.utils.fromNano(winnerSpent / stepsCounter)).toPrecision(3) + " EVER\n")

            //expect(prize).to.be.greaterThanOrEqual(+round.round!!.prizeFund - +locklift.utils.toNano(1), "Incorrect prize received");
        });
    });
});

function maskAddress(address: string): string {
    return address.slice(0, 6) + '...' + address.slice(-6);
}

function getCell(x: number, y: number, boardColumns: number): number {
    const rtl: boolean = y % 2 === 0;
    if (rtl) {
        x = boardColumns - x + 1;
    }
    return (y - 1) * boardColumns + x;
}

function generateRandomUintArray(length: number, minValue: number, maxValue: number): number[] {
    const randomArray: number[] = [];
    for (let i = 0; i < length; i++) {
        const randomValue = Math.floor(Math.random() * (maxValue - minValue + 1) + minValue);
        randomArray.push(randomValue);
    }
    return randomArray;
}