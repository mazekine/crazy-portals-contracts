import { WalletTypes } from "locklift";

export default async () => {

    await locklift.deployments.deployAccounts([
            {
                deploymentName: "Deployer", // user-defined custom account name
                signerId: "0", // locklift.keystore.getSigner("0") <- id for getting access to the signer
                accountSettings: {
                    type: WalletTypes.EverWallet,
                    value: locklift.utils.toNano(10),
                    nonce: locklift.utils.getRandomNonce()
                },
            },
        ],
    );
}

export const tag = "deployer";