import {expect} from "chai";
import chai from "chai";
import {
    Address,
    lockliftChai
} from "locklift";

chai.use(lockliftChai);

async function main() {
  await locklift.deployments.fixture({ include: ["deployer"] });
  const signer = (await locklift.keystore.getSigner("0"))!;
  let deployer = await locklift.deployments.getAccount("Deployer").account.address;

  const { contract: game, tx } = await locklift.factory.deployContract({
    contract: "Game",
    publicKey: signer.publicKey,
    initParams: {
      _nonce: locklift.utils.getRandomNonce(),
    },
    constructorParams: {
      owner: deployer,
      size: 10
    },
    value: locklift.utils.toNano(1),
  });
/*

  const response = await locklift.tracing.trace(game
      .methods
      .generateBoard({
        _seed: "31071986",
          maxSnakes: 3,
          maxLadders: 3
      })
      .send({
        from: deployer,
        amount: locklift.utils.toNano(20),
        bounce: true
      }), {raise: true}
  )

  expect(response.traceTree).not.to.have.error();
  response.traceTree?.beautyPrint();
*/

  const walletBalance = +(await locklift.provider.getBalance(new Address("0:2746d46337aa25d790c97f1aefb01a5de48cc1315b41a4f32753146a1e1aeb7d")));
  if(walletBalance < 1000) {
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

  console.log(`Game deployed at: ${game.address.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
