import { WalletTypes } from "locklift";

export default async () => {
    await locklift.deployments.fixture({include: ["deployer"]});
    let deployer = await locklift.deployments.getAccount("Deployer").account.address;

    const signer = (await locklift.keystore.getSigner("0"))!;

    await locklift.deployments.deploy({
        deploymentName: "TestGame",
        deployConfig: {
            contract: "Game",
            publicKey: signer.publicKey,
            initParams: {
                nonce: locklift.utils.getRandomNonce(),
            },
            constructorParams: {
                owner: deployer,
                size: 10
            },
            value: locklift.utils.toNano(0.2),
        }
    });
}

export const tag = "testGame";