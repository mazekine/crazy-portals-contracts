import {expect} from "chai";
import chai from "chai";
import {
    Address, Contract,
    lockliftChai
} from "locklift";
import {BoardAbi, FactorySource, RoundAbi} from "../build/factorySource";
import exp from "constants";
import {Account} from "everscale-standalone-client";

chai.use(lockliftChai);

type MethodReturnType<A extends any, N extends keyof Contract<A>["methods"] & string> = ReturnType<
    //@ts-ignore
    ReturnType<Contract<A>["methods"][N]>["call"]
> extends Promise<infer T>
    ? T
    : never;

type GetBoardResponse = MethodReturnType<BoardAbi, "getBoard">;
type GetRoundsResponse = MethodReturnType<BoardAbi, "getRounds">;
//type GetRoundLatestMoveResponse = MethodReturnType<BoardAbi, "getRoundLatestMove">;

let deployer: Address;
let opponent: Address;
let boardContract: Contract<FactorySource["Board"]>;
let roundContract: Contract<FactorySource["Round"]>;
let tabulator: string = "        ";
let nTabulator = "\n" + tabulator;
let boardResponse: GetBoardResponse;
let roundId: string;
let roundAddress: Address

const ROLL_GAS = locklift.utils.toNano(1);
const JOIN_GAS = locklift.utils.toNano(0.5);
const RAKE = locklift.utils.toNano(0.02);
const JACKPOT_RATE = 50;

describe("Test Board.tsol", async function () {
    before(async () => {
        await locklift.deployments.fixture({include: ["testBoard", "opponent"]});
        //console.log("Fixtures ready");

        deployer = await locklift.deployments.getAccount("Deployer").account.address;
        console.log(nTabulator + `First player: ${deployer}`);

        opponent = await locklift.deployments.getAccount("Opponent").account.address;
        console.log(tabulator + `Second player: ${opponent}`);

        boardContract = await locklift.deployments.getContract<BoardAbi>("TestBoard");
        console.log(tabulator + "Board deployed at: " + boardContract.address + "\n");
    });

    describe("Contracts", async function () {
        it("Preliminary checks", async function () {
            const boardData = await locklift.factory.getContractArtifacts("Board");

            expect(boardData.code).not.to.equal(undefined, "Code should be available");
            expect(boardData.abi).not.to.equal(undefined, "ABI should be available");
            expect(boardData.tvc).not.to.equal(undefined, "tvc should be available");

            expect(+(await locklift.provider.getBalance(deployer))).to.be.greaterThan(+locklift.utils.toNano(5), "Deployer balance is insufficient");
            expect(+(await locklift.provider.getBalance(opponent))).to.be.greaterThan(+locklift.utils.toNano(5), "Opponent balance is insufficient");
        });

        it("Generate board", async function () {
            let boardGeneratedTx = await locklift.tracing.trace(boardContract
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

            const RED_BEAMS = 14;
            const BLUE_BEAMS = 14;

            boardGeneratedTx = await locklift.tracing.trace(boardContract
                .methods
                .generateBoard({
                    _seed: "31071986",
                    _maxRedBeams: RED_BEAMS,
                    _maxBlueBeams: BLUE_BEAMS
                })
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(1),
                    bounce: true
                }), {raise: true}
            )

            expect(boardGeneratedTx.traceTree).emit("BoardGenerated")
                .and.not.to.have.error();

            boardResponse = await boardContract
                .methods
                .getBoard({answerId: 0})
                .call();

            expect(boardResponse._redBeams.length).to.be.equal(RED_BEAMS, "Wrong number of redBeams");
            expect(boardResponse._blueBeams.length).to.be.equal(BLUE_BEAMS, "Wrong number of blueBeams");

            let cells: Map<number, boolean> = new Map();
            for (const redBeam of boardResponse._redBeams) {
                //  Head
                let path = await boardContract.methods.decodePath({mask: redBeam}).call();

                expect(+path.fromCell).to.be.lessThanOrEqual(+boardResponse._board.columns * +boardResponse._board.rows, "RedBeam head is located incorrectly:" + redBeam);
                expect(!cells.has(+path.fromCell), "RedBeams generated incorrectly (head put on filled cell)\n" + boardResponse._redBeams);
                cells.set(+path.fromCell, true);

                //  Tail
                expect(+path.toCell).to.be.lessThanOrEqual(+boardResponse._board.columns * +boardResponse._board.rows, "RedBeam tail is located incorrectly:" + redBeam);
                expect(!cells.has(+path.toCell), "RedBeams generated incorrectly (tail put on filled cell)\n" + boardResponse._redBeams);
                cells.set(+path.toCell, true);
            }

            for (const blueBeam of boardResponse._blueBeams) {
                let path = await boardContract.methods.decodePath({mask: blueBeam}).call();

                expect(+path.fromCell).to.be.lessThanOrEqual(+boardResponse._board.columns * +boardResponse._board.rows, "BlueBeam head is located incorrectly:" + blueBeam);
                expect(!cells.has(+path.fromCell), "BlueBeams generated incorrectly (head put on filled cell)\n" + boardResponse._redBeams);
                cells.set(+path.fromCell, true);

                //  Tail
                expect(+path.toCell).to.be.lessThanOrEqual(+boardResponse._board.columns * +boardResponse._board.rows, "BlueBeam tail is located incorrectly:" + blueBeam);
                expect(!cells.has(+path.toCell), "BlueBeams generated incorrectly (tail put on filled cell)\n" + boardResponse._redBeams);
                cells.set(+path.toCell, true);
            }

            console.log(nTabulator + "Board generated");
            console.log(tabulator + "Board balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(boardContract.address)) + " EVER");
        });

/*
        it("Turn on debug mode on Board contract", async function() {
            const debugModeTx = await locklift.tracing.trace(boardContract
                .methods
                .setDebugMode({
                    status: true
                })
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(0.2),
                    bounce: true
                }), {raise: true}
            );

            expect(debugModeTx.traceTree).emit("DebugModeChanged")
                .and.not.to.have.error();
        });
*/

        it("Set maximum players", async function () {
            const maxPlayerTx = await locklift.tracing.trace(boardContract
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

            const maxPlayers = await boardContract.methods.maxPlayers().call();
            expect(+maxPlayers.maxPlayers).to.be.equal(2, "Wrong players number");
            console.log(nTabulator + "Max players set to 2");
            console.log(tabulator + "Board balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(boardContract.address)) + " EVER");
        });

        const PRIZE_FUND = 10;

        it("Set prize fund", async function () {
            const prizeFundTx = await locklift.tracing.trace(boardContract
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

            await locklift.giver.sendTo(boardContract.address, locklift.utils.toNano(PRIZE_FUND));

            const prizeFund = await boardContract.methods.prizeFundPerRound().call();
            expect(prizeFund.prizeFundPerRound).to.be.equal(locklift.utils.toNano(PRIZE_FUND), "Wrong prize fund");

            console.log(nTabulator + "Prize fund set to " + PRIZE_FUND + " EVER");
            console.log(tabulator + "Board balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(boardContract.address)) + " EVER");
        });

        it("Set rake rate", async function () {
            const prizeFundTx = await locklift.tracing.trace(boardContract
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

            const rake = await boardContract.methods.rake().call();
            expect(rake.rake).to.be.equal(RAKE, "Wrong rake");

            console.log(nTabulator + "Rake set to " + locklift.utils.fromNano(rake.rake) + " EVER");
            console.log(tabulator + "Board balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(boardContract.address)) + " EVER");
        });

        it("Set jackpot rate", async function () {
            const prizeFundTx = await locklift.tracing.trace(boardContract
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

            const jpRate = await boardContract.methods.jackpotRate().call();
            expect(jpRate.jackpotRate).to.be.equal(JACKPOT_RATE.toString(), "Wrong jackpot rate");

            console.log(nTabulator + "Jackpot rate set to " + jpRate.jackpotRate + "%");
            console.log(tabulator + "Board balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(boardContract.address)) + " EVER");
        });

        it("Set jackpot averaged periods", async function () {
            const jpAveragedPeriodsTx = await locklift.tracing.trace(boardContract
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

            const jpAveragedPeriods = await boardContract.methods.jackpotAveragedPeriods().call();
            expect(jpAveragedPeriods.jackpotAveragedPeriods).to.be.equal("5", "Incorrect averaged periods value");
        })

        it("Set jackpot minimum probability", async function () {
            const MIN_PROBABILITY = 1000;

            const jpMinProbabilityTx = await locklift.tracing.trace(boardContract
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

            const jpMinProbability = await boardContract.methods.jackpotMinProbability().call();
            expect(jpMinProbability.jackpotMinProbability).to.be.equal(MIN_PROBABILITY.toString(), "Incorrect minimum jackpot probability value");
        })

        it("Set jackpot maximum probability", async function () {
            const MAX_PROBABILITY = 99;

            const jpMaxProbabilityTx = await locklift.tracing.trace(boardContract
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

            const jpMaxProbability = await boardContract.methods.jackpotMaxProbability().call();
            expect(jpMaxProbability.jackpotMaxProbability).to.be.equal(MAX_PROBABILITY.toString(), "Incorrect maximum jackpot probability value");
        })

        it("Set jackpot probability freeze period", async function () {
            const FREEZE_PERIOD = 30;

            const jpProbabilityFreezeTx = await locklift.tracing.trace(boardContract
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

            const jpProbabilityFreezePeriod = await boardContract.methods.jackpotProbabilityFreezePeriod().call();
            expect(jpProbabilityFreezePeriod.jackpotProbabilityFreezePeriod).to.be.equal(FREEZE_PERIOD.toString(), "Incorrect jackpot probability freeze period");
        })

        it("Create round", async function () {
            const preRounds: GetRoundsResponse = await boardContract.methods.getRounds({ answerId: 0, status: 0 }).call();

            const createRoundTx = await locklift.tracing.trace(boardContract
                .methods
                .createRound()
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(1),
                    bounce: true
                }), {raise: true}
            )

            expect(createRoundTx.traceTree).emit("RoundCreated")
                .and.not.to.have.error();

            //createRoundTx.traceTree?.beautyPrint();

            const postRounds: GetRoundsResponse = await boardContract.methods.getRounds({ answerId: 0, status: 0 }).call();
            const newRounds = postRounds._rounds.filter(
                (r1) =>
                    !preRounds._rounds.some(
                        (r2) =>
                            r1 == r2
                    )
            );

            expect(newRounds.length).to.be.equal(1, "Incorrect rounds number");

            roundId = newRounds.pop()!!;
            roundAddress = (await boardContract.methods.getRoundAddress({roundId: roundId}).call()).value0;
            console.log(nTabulator + "Created round " + roundId + " at the address " + roundAddress);
            console.log(tabulator + "Board balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(boardContract.address)) + " EVER");
            console.log(tabulator + "Round balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(roundAddress)) + " EVER");

            await locklift.deployments.saveContract({
                address: roundAddress,
                deploymentName: "TestRound",
                contractName: "Round"
            });

            roundContract = locklift.deployments.getContract("TestRound");

            const id = await roundContract.fields.id.call({});
            expect(id).to.equal(roundId, "Round id is incorrect");
            //roundResponse = await boardContract.methods.getRound({answerId: 0, roundId: roundId}).call();
        });

/*
        it("Turn on debug mode on Round contract", async function() {
            const debugModeTx = await locklift.tracing.trace(roundContract
                .methods
                .setDebugMode({
                    status: true
                })
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(0.2),
                    bounce: true
                }), {raise: true}
            );

            expect(debugModeTx.traceTree).emit("DebugModeChanged")
                .and.not.to.have.error();
        });
*/

        it("Join round", async function () {
            let joinRoundViaBoardTx = await locklift.tracing.trace(boardContract
                .methods
                .joinRound({
                    roundId: 0
                })
                .send({
                    from: deployer,
                    amount: JOIN_GAS,
                    bounce: true
                }), {raise: false}
            );

            expect(joinRoundViaBoardTx.traceTree).has.error(3006);  //  ITEM_NOT_FOUND

            joinRoundViaBoardTx = await locklift.tracing.trace(boardContract
                .methods
                .joinRound({
                    roundId: roundId
                })
                .send({
                    from: deployer,
                    amount: JOIN_GAS,
                    bounce: true
                }), {raise: false}
            );

            expect(joinRoundViaBoardTx.traceTree)
                .to.emit("RoundJoined")
                .and.not.have.error();

            console.log(nTabulator + "Deployer " + maskAddress(deployer.toString()) + " joined the round");

            joinRoundViaBoardTx = await locklift.tracing.trace(boardContract
                .methods
                .joinRound({
                    roundId: roundId
                })
                .send({
                    from: deployer,
                    amount: JOIN_GAS,
                    bounce: true
                }), {raise: false}
            );

            expect(joinRoundViaBoardTx.traceTree).has.error(3008);  //  NOTHING_CHANGED

            let joinRoundTx = await locklift.tracing.trace(roundContract
                .methods
                .join({
                    meta: {
                        callId: roundId,
                        returnGasTo: deployer
                    }
                })
                .send({
                    from: deployer,
                    amount: JOIN_GAS,
                    bounce: true
                }), {raise: false}
            );

            expect(joinRoundTx.traceTree).has.error(4001);  //  NOT_ALLOWED

            joinRoundViaBoardTx = await locklift.tracing.trace(boardContract
                .methods
                .joinRound({
                    roundId: roundId
                })
                .send({
                    from: opponent,
                    amount: JOIN_GAS,
                    bounce: true
                }), {raise: false}
            );

            expect(joinRoundViaBoardTx.traceTree)
                .to.emit("RoundJoined")
                .and.not.have.error();

            console.log(tabulator + "Opponent " + maskAddress(opponent.toString()) + " joined the round");

            console.log(tabulator + "Board balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(boardContract.address)) + " EVER");
            console.log(tabulator + "Round balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(roundAddress)) + " EVER");

            let roundStatus = await roundContract.fields.status.call({});
            expect(roundStatus).to.be.equal("1", "Round is in the wrong status");

            let roundPlayers = await roundContract.fields.roundPlayers.call({});
            expect(roundPlayers.length).to.be.equal(2, "Wrong number of players in round");

            let playerRound = await boardContract.fields.playerRound.call({});
            playerRound.forEach((_item, _index) => {
                    _item.forEach((_addr, _rid) => {
                        expect(_addr == deployer || _addr == opponent, "Incorrect participants list");
                        expect(_rid.toString() == roundId, "Incorrect round Id");
                    })
                }
            )
        });

        it("Roll dices", async function () {
            let stepsCounter: number = 0;

            let winner: Address;
            let deployerBalance = +(await locklift.provider.getBalance(deployer));
            let opponentBalance = +(await locklift.provider.getBalance(opponent));

            while(true) {
                stepsCounter++;
                let roundStatus = +(await roundContract.fields.status.call({}));
                //roundResponse = await boardContract.methods.getRound({ roundId: roundId, answerId: 0 }).call();
                expect(roundStatus).not.to.equal(4, "Round lasted too long and expired");

                if(roundStatus == 3) {
                    winner = await roundContract.fields.winner.call({});
                    const winnerName = winner == deployer ? "Deployer" : "Opponent";
                    console.log(nTabulator + "Round finished. " + winnerName + " has won");
                    console.log(tabulator + "Board balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(boardContract.address)) + " EVER");
                    break;
                }

                let rollFirstTx = await locklift.tracing.trace(roundContract
                    .methods
                    .roll({})
                    .send({
                        from: deployer,
                        amount: ROLL_GAS,
                        bounce: true
                    }), {raise: false, allowedCodes: {compute: [1060, 5005]}}
                );

                rollFirstTx.traceTree?.beautyPrint();
                //expect(rollFirstTx.traceTree).to.not.have.error();

                let rollSecondTx  = await locklift.tracing.trace(roundContract
                    .methods
                    .roll({})
                    .send({
                        from: opponent,
                        amount: ROLL_GAS,
                        bounce: true
                    }), {raise: false, allowedCodes: {compute: [1060, 5005]}}
                );

                rollSecondTx.traceTree?.beautyPrint();

                //expect(rollSecondTx.traceTree).to.not.have.error();
                //expect(rollSecondTx.traceTree).to.emit("DiceRolled");

                let move = await roundContract.methods.getLatestMove({answerId: 0}).call();
                console.log(
                    nTabulator +
                    "Move " + stepsCounter + ": "
                );

                expect(move.move).to.not.be.null;

                if (move.move) {
                    if(move.move.playerSteps.length < 2) {
                        roundStatus = +(await roundContract.fields.status.call({}));
                        if(roundStatus < 3) { //  Round not finished or expired
                            let troublemaker = (move.move.playerSteps[0][0] == deployer) ? deployer : opponent;
                            console.log(nTabulator + `Retrying (potentially) failed transaction of ${maskAddress(troublemaker.toString())}...`)
                            let rollRetryTx = await locklift.tracing.trace(roundContract
                                .methods
                                .roll({})
                                .send({
                                    from: troublemaker,
                                    amount: ROLL_GAS,
                                    bounce: true
                                }), {raise: true, allowedCodes: {compute: [1060, 5005]}}
                            );
                            expect(rollRetryTx).to.emit("DiceRolled")
                                .and.not.to.have.error();

                            //expect(move.move.playerSteps.length).to.be.equal(2, "One of players hasn't moved");
                        }
                    }

                    for (const [address, steps] of move.move.playerSteps) {
                        const maskedAddress = maskAddress(address.toString());
                        let stepsSummary: string[] = [];
                        for (const step of steps) {
                            let stepD = await roundContract.methods.decodePath({mask: step}).call();
                            stepsSummary.push(
                                `[${stepD.fromCell}, ${stepD.fromX}, ${stepD.fromY}] --> [${stepD.toCell}, ${stepD.toX}, ${stepD.toY}]`
                            );
                        }

                        /*const stepsSummary = steps
                            .map(
                                (step) =>
                                    (await roundContract.methods.decodePath({mask: step}).call())

                                    )
                                    //`[${step.from.cell}, ${step.from.coordinate.x}, ${step.from.coordinate.y}] --> [${step.to.cell}, ${step.to.coordinate.x}, ${step.to.coordinate.y}]`,
                            )
                            .join('; ');*/
                        console.log(tabulator.repeat(2) + `${maskedAddress}: ${stepsSummary.join('; ')}`);
                    }
                    console.log(tabulator.repeat(2) + "Board balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(boardContract.address)) + " EVER");
                    console.log(tabulator.repeat(2) + "Round balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(roundAddress)) + " EVER\n");
                } else {
                    throw "Move is empty";
                }
            }

            //  Check the balance before claiming
            //let winnerBalanceBeforeClaim = +(await locklift.provider.getBalance(winner));

            let claimTx = await locklift.tracing.trace(roundContract
                .methods
                .claim({})
                .send({
                    from: winner,
                    amount: locklift.utils.toNano(0.1),
                    bounce: true
                }), {raise: false}
            );

            expect(claimTx.traceTree).to.not.have.error();

            let winnerBalanceBeforeClaim = (winner == deployer) ? deployerBalance : opponentBalance;
            let winnerBalanceAfterClaim = +(await locklift.provider.getBalance(winner));
            let prizeFund = +(await roundContract.fields.prizeFund.call({}));

            console.log(nTabulator + "Received prize of " + locklift.utils.fromNano(prizeFund) + " EVER");
            console.log(tabulator + "Board balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(boardContract.address)) + " EVER");
            console.log(tabulator + "Round balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(roundAddress)) + " EVER\n");
            console.log(tabulator + "Winner balance before claim: " + locklift.utils.fromNano(winnerBalanceBeforeClaim) + " EVER");
            console.log(tabulator + "Winner balance after claim: " + locklift.utils.fromNano(winnerBalanceAfterClaim) + " EVER\n");

            let winnerSpent = winnerBalanceBeforeClaim - (winnerBalanceAfterClaim - prizeFund);
            let profit = prizeFund - winnerSpent;

            console.log(tabulator + "Winner spent: " + locklift.utils.fromNano(winnerSpent) + " EVER");
            console.log(tabulator + `${(winnerSpent > prizeFund) ? "Loss" : "Profit"}: ${locklift.utils.fromNano(profit)} EVER`);
            console.log(tabulator + "Average gas per roll: " + (+locklift.utils.fromNano(winnerSpent / stepsCounter)).toPrecision(3) + " EVER\n")
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