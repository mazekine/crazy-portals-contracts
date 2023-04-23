import {expect} from "chai";
import chai from "chai";
import {
    Address,
    lockliftChai
} from "locklift";
import {FactorySource, GameAbi} from "../build/factorySource";

chai.use(lockliftChai);

async function main() {
    await locklift.deployments.fixture({include: ["deployer", "testGame"]});
/*
    const signer = (await locklift.keystore.getSigner("0"))!;
*/
    let deployer = await locklift.deployments.getAccount("Deployer").account.address;
    let game = locklift.deployments.getContract<GameAbi>("TestGame");

/*
    const {contract: game} = await locklift.factory.deployContract({
        contract: "Game",
        publicKey: signer.publicKey,
        initParams: {
            nonce: locklift.utils.getRandomNonce(),
        },
        constructorParams: {
            owner: deployer,
            size: 10
        },
        value: locklift.utils.toNano(1),
    });
*/

    console.log(`Game deployed at: ${game.address.toString()}`);

    const boardGeneratedTx = await locklift.tracing.trace(game
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

    const board = await game
        .methods
        .getBoard({answerId: 0})
        .call();

    expect(board._snakes.length).to.be.equal(6, "Wrong number of snakes");
    expect(board._ladders.length).to.be.equal(6, "Wrong number of ladders");

    console.log("Board generated");

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

    const prizeFundTx = await locklift.tracing.trace(game
        .methods
        .setPrizeFund({
            amount: locklift.utils.toNano(0.2)
        })
        .send({
            from: deployer,
            amount: locklift.utils.toNano(0.2),
            bounce: true
        }), {raise: true}
    )

    expect(prizeFundTx.traceTree).emit("PrizeFundUpdated")
        .and.not.to.have.error();

    const prizeFund = await game.methods.prizeFundPerRound().call();
    expect(prizeFund.prizeFundPerRound).to.be.equal(locklift.utils.toNano(0.2), "Wrong prize fund");

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

/*
    const roundEvents = createRoundTx.traceTree?.findEventsForContract({
        contract: game,
        name: "RoundCreated" as const
    });

    const roundId = roundEvents?.pop()?.roundId;

    expect(roundId).not.to.be.equal(undefined, "Round has not created");
*/
    const round = await game.methods.getRounds({ answerId: 0, status: 0 }).call();
    expect(round._rounds.length).to.be.equal(1, "Incorrect rounds number");

    const roundId = +round._rounds.pop()!!.id;


    const walletBalance = +(await locklift.provider.getBalance(new Address("0:2746d46337aa25d790c97f1aefb01a5de48cc1315b41a4f32753146a1e1aeb7d")));
    if (walletBalance < 1000) {
        await locklift
            .giver
            .sendTo(
                new Address("0:2746d46337aa25d790c97f1aefb01a5de48cc1315b41a4f32753146a1e1aeb7d"),
                locklift.utils.toNano(1000 - walletBalance)
            );
    }

    await locklift.tracing.trace(game
        .methods
        .transferOwnership({"newOwner": new Address("0:2746d46337aa25d790c97f1aefb01a5de48cc1315b41a4f32753146a1e1aeb7d")})
        .send({
            from: deployer,
            amount: locklift.utils.toNano(0.3),
            bounce: true
        })
    )


}

main()
    .then(() => process.exit(0))
    .catch(e => {
        console.log(e);
        process.exit(1);
    });
