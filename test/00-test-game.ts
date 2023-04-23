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

        it("Generate board", async function () {
            let boardGeneratedTx = await locklift.tracing.trace(game
                .methods
                .generateBoard({
                    _seed: "31071986",
                    _maxSnakes: 100,
                    _maxLadders: 100
                })
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(1),
                    bounce: true
                }), {raise: false}
            )

            expect(boardGeneratedTx.traceTree).has.error(3009);

            boardGeneratedTx = await locklift.tracing.trace(game
                .methods
                .generateBoard({
                    _seed: "31071986",
                    _maxSnakes: 6,
                    _maxLadders: 6
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

            expect(board._snakes.length).to.be.equal(6, "Wrong number of snakes");
            expect(board._ladders.length).to.be.equal(6, "Wrong number of ladders");

            let cells: Map<number, boolean> = new Map();
            board._snakes.forEach(
                (snake) => {
                    //  Head
                    let cols = +board._board.columns;
                    let cellNumber: number = getCell(+snake.from.x, +snake.from.y, cols);
                    expect(cellNumber).to.be.lessThanOrEqual(+board._board.columns * +board._board.rows, "Snake head is located incorrectly:" + snake);
                    expect(!cells.has(cellNumber), "Snakes generated incorrectly (head put on filled cell)\n" + board._snakes);
                    cells.set(cellNumber, true);

                    //  Tail
                    cellNumber = getCell(+snake.to.x, +snake.to.y, cols);
                    expect(cellNumber).to.be.lessThanOrEqual(+board._board.columns * +board._board.rows, "Snake tail is located incorrectly:" + snake);
                    expect(!cells.has(cellNumber), "Snakes generated incorrectly (tail put on filled cell)\n" + board._snakes);
                    cells.set(cellNumber, true);
                }
            );

            board._ladders.forEach(
                (ladder) => {
                    //  Head
                    let cols = +board._board.columns;
                    let cellNumber: number = getCell(+ladder.from.x, +ladder.from.y, cols);
                    expect(cellNumber).to.be.lessThanOrEqual(+board._board.columns * +board._board.rows, "Ladder head is located incorrectly:" + ladder);
                    expect(!cells.has(cellNumber), "Ladders generated incorrectly (head put on filled cell)\n" + board._snakes);
                    cells.set(cellNumber, true);

                    //  Tail
                    cellNumber = getCell(+ladder.to.x, +ladder.to.y, cols);
                    expect(cellNumber).to.be.lessThanOrEqual(+board._board.columns * +board._board.rows, "Ladder tail is located incorrectly:" + ladder);
                    expect(!cells.has(cellNumber), "Ladders generated incorrectly (tail put on filled cell)\n" + board._snakes);
                    cells.set(cellNumber, true);
                }
            );

            console.log(nTabulator + "Board generated");
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
        });

        it("Set prize fund", async function () {
            const prizeFundTx = await locklift.tracing.trace(game
                .methods
                .setPrizeFund({
                    amount: locklift.utils.toNano(2)
                })
                .send({
                    from: deployer,
                    amount: locklift.utils.toNano(0.2),
                    bounce: true
                }), {raise: true}
            )

            expect(prizeFundTx.traceTree).emit("PrizeFundUpdated")
                .and.not.to.have.error();

            await locklift.giver.sendTo(game.address, locklift.utils.toNano(2));

            const prizeFund = await game.methods.prizeFundPerRound().call();
            expect(prizeFund.prizeFundPerRound).to.be.equal(locklift.utils.toNano(2), "Wrong prize fund");
        });

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
        });

        it("Join round", async function () {
            let joinRoundTx = await locklift.tracing.trace(game
                .methods
                .joinRound({
                    roundId: 0,
                    answerId: 0
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
                    roundId: roundId,
                    answerId: 0
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

            console.log(nTabulator + "Deployer joined the round");

            joinRoundTx = await locklift.tracing.trace(game
                .methods
                .joinRound({
                    roundId: roundId,
                    answerId: 0
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
                    roundId: roundId,
                    answerId: 0
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

            console.log(tabulator + "Opponent joined the round");

            round = await game.methods.getRound({answerId: 0, roundId: roundId}).call();

            expect(round.round!!.status).to.be.equal("1", "Round is in the wrong status");
        });

        it("Roll dices", async function () {
            let stepsCounter: number = 0;
/*
            interface Coordinate {
                x: number;
                y: number;
            }

            interface Location {
                cell: number;
                coordinate: Coordinate;
            }

            interface Step {
                from: Location;
                to: Location;
            }

            interface Round {
                first: Step;
                second: Step;
            }

            let rounds: Map<number, Round>;
*/

            let winner: Address;

            while(true) {
                stepsCounter++;
                round = await game.methods.getRound({ roundId: roundId, answerId: 0 }).call();
                let roundStatus = +round.round!!.status;
                expect(roundStatus).not.to.equal(4, "Round lasted too long and expired");

                if(roundStatus == 3) {
                    winner = round.round!!.winner;
                    const winnerName = winner == deployer ? "Deployer" : "Opponent";
                    console.log(nTabulator + "Round finished. " + winnerName + " has won");
                    break;
                }

                let rollFirstTx = await locklift.tracing.trace(game
                    .methods
                    .roll({answerId: 0})
                    .send({
                        from: deployer,
                        amount: locklift.utils.toNano(0.2),
                        bounce: true
                    }), {raise: true, allowedCodes: {compute: [1060, 5005]}}
                );

                //expect(rollFirstTx.traceTree).to.not.have.error();

                let rollSecondTx  = await locklift.tracing.trace(game
                    .methods
                    .roll({answerId: 0})
                    .send({
                        from: opponent,
                        amount: locklift.utils.toNano(0.2),
                        bounce: true
                    }), {raise: true, allowedCodes: {compute: [1060, 5005]}}
                );

                //expect(rollSecondTx.traceTree).to.not.have.error();
                //expect(rollSecondTx.traceTree).to.emit("DiceRolled");

                let move = await game.methods.getRoundLatestMove({roundId: roundId, answerId: 0}).call();
                console.log(
                    nTabulator +
                    "Move " + stepsCounter + ": "
                );

                if (move.move) {
                    console.log(tabulator.repeat(2) + "Game balance: " + locklift.utils.fromNano(await locklift.provider.getBalance(game.address)) + " EVER");
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
                }
            }

            //  Check the balance before claiming
            let winnerBalanceBeforeClaim = +(await locklift.provider.getBalance(winner));

/*
            let claimTx = await locklift.tracing.trace(game
                .methods
                .claim({roundId: roundId})
                .send({
                    from: winner,
                    amount: locklift.utils.toNano(0.3),
                    bounce: true
                }), {raise: false}
            );

            expect(claimTx.traceTree).to.have.error(1060);
*/

            //await locklift.giver.sendTo(game.address, locklift.utils.toNano(2));

            let claimTx = await locklift.tracing.trace(game
                .methods
                .claim({roundId: roundId})
                .send({
                    from: winner,
                    amount: locklift.utils.toNano(0.4),
                    bounce: true
                }), {raise: false}
            );

            expect(claimTx.traceTree).to.not.have.error();
            //console.log(claimTx.traceTree?.balanceChangeInfo?.balanceDiff?.balanceDiff?.toNumber());

            console.log(claimTx.traceTree!.viewTraceTree);
            console.log(claimTx.traceTree?.getBalanceDiff([game, deployer, opponent]));

            let winnerBalanceAfterClaim = +(await locklift.provider.getBalance(winner));
            let prize = winnerBalanceAfterClaim - winnerBalanceBeforeClaim;

            console.log(nTabulator + "Received prize of " + locklift.utils.fromNano(prize) + " EVER\n");

            expect(prize).to.be.greaterThanOrEqual(+round.round!!.prizeFund - 1, "Incorrect prize received");
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