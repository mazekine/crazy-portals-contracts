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

  const response = await locklift.tracing.trace(game
      .methods
      .generateBoard({
        _seed: "31071986"
      })
      .send({
        from: deployer,
        amount: locklift.utils.toNano(20),
        bounce: true
      }), {raise: true}
  )

    expect(response.traceTree).not.to.have.error();
  response.traceTree?.beautyPrint();

  await locklift
      .giver
      .sendTo (
          new Address("0:2d67f5cdd25d5aebcb690f2b378fffa600cadb2c581e71e6e386b18e08d84a94"),
          locklift.utils.toNano(1000)
        );

  await locklift.tracing.trace(game
      .methods
      .transferOwnership({"newOwner": new Address("0:2d67f5cdd25d5aebcb690f2b378fffa600cadb2c581e71e6e386b18e08d84a94")})
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
