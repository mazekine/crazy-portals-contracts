export default async () => {
    await locklift.deployments.fixture({include: ["deployer"]});
    let deployer = await locklift.deployments.getAccount("Deployer").account.address;
    const signer = await locklift.deployments.getAccount("Deployer").signer;

    const platformData = await locklift.factory.getContractArtifacts("Platform");
    const roundData = await locklift.factory.getContractArtifacts("Round");

    await locklift.deployments.deploy({
        deploymentName: "TestBoard",
        deployConfig: {
            contract: "Board",
            publicKey: signer.publicKey,
            initParams: {
                nonce: locklift.utils.getRandomNonce(),
            },
            constructorParams: {
                owner: deployer,
                size: "16",
                _platformCode: platformData.code,
                _roundCode: roundData.code
            },
            value: locklift.utils.toNano(1),
        },
        enableLogs: false
    });
}

export const tag = "testBoard";