import chai, {expect} from "chai";
import {Address, lockliftChai} from "locklift";
import {GameAbi} from "../build/factorySource";
import fs from 'fs';

chai.use(lockliftChai);

interface Config {
    board: {
        size: number | null;
        seed: number | null;
        maxBlueBeams: number | null;
        maxRedBeams: number | null;
        owner: Address | null
    };
    round: {
        maxPlayers: number | null;
        prizeFund: number | null;
        entryStake: number | null;
        rake: number | null;
        giveUpAllowed: boolean | null;
        time: {
            maxRoundTime: number | null;
            maxMoveTime: number | null;
            autostart: number | null;
        };
        jackpot: {
            rate: number | null;
            averagedPeriods: number | null;
            maxProbability: number | null;
            minProbability: number | null;
            probabilityFreezePeriod: number | null;
        };
        createFirstRound: boolean;
    };
}

async function main() {
    await locklift.deployments.fixture({include: ["deployer", "testGame"]});

    let deployer = await locklift.deployments.getAccount("Deployer");
    let deployerAddress = deployer.account.address;
    let game = locklift.deployments.getContract<GameAbi>("TestGame");

    let configPath: string = "./cp.deploy.config.localNode.json";

    process.argv.forEach((arg, index) => {
        if(arg == "--deploy_config" && (process.argv.length - 1) >= (index + 1)) {
            configPath = process.argv[index + 1];
        }
    })

    let config = readConfigFile(configPath)!!;
    let boardConfig = config.board;
    let roundConfig = config.round;

    let defaultConfig: Config = {
        board: {
            size: 10,
            seed: Math.floor(Date.now() / 1000),
            maxRedBeams: 8,
            maxBlueBeams: 8,
            owner: deployerAddress
        },
        round: {
            maxPlayers: 4,
            entryStake: 0,
            giveUpAllowed: false,
            prizeFund: 1_000_000_000,
            rake: 20_000_000,
            time: {
                maxRoundTime: 1800,
                autostart: 300,
                maxMoveTime: 60
            },
            jackpot: {
                rate: 0,
                averagedPeriods: 10,
                maxProbability: 100,
                minProbability: 10_000_000,
                probabilityFreezePeriod: 60
            },
            createFirstRound: false
        }
    }

    console.log(`Game deployed at: ${game.address.toString()}`);
    console.log("Configuring...")
    const tabulator = "    ";
    const treeTabulator = tabulator + "└ ";

    //  Global configurations
    let boardSeed = defaultConfig.board.seed!!;
    if(boardConfig.seed !== undefined) { boardSeed = boardConfig.seed!! }

    let maxRedBeams = defaultConfig.board.maxRedBeams!!;
    if(boardConfig.maxRedBeams !== undefined) { maxRedBeams = boardConfig.maxRedBeams!! }

    let maxBlueBeams = defaultConfig.board.maxBlueBeams!!;
    if(boardConfig.maxBlueBeams !== undefined) { maxBlueBeams = boardConfig.maxBlueBeams!! }

    const boardGeneratedTx = await locklift.tracing.trace(game
        .methods
        .generateBoard({
            _seed: boardSeed,
            _maxRedBeams: maxRedBeams,
            _maxBlueBeams: maxBlueBeams
        })
        .send({
            from: deployerAddress,
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

    expect(board._redBeams.length).to.be.equal(maxRedBeams, "Wrong number of redBeams");
    expect(board._blueBeams.length).to.be.equal(maxBlueBeams, "Wrong number of blueBeams");

    console.log(treeTabulator + "Board generated");

    //  Configure max number of players per round
    if(roundConfig.maxPlayers) {
        let maxPlayersCfg = roundConfig.maxPlayers!!;
        if(maxPlayersCfg > 0 && maxPlayersCfg != defaultConfig.round.maxPlayers) {
            const maxPlayerTx = await locklift.tracing.trace(game
                .methods
                .setMaxPlayers({
                    qty: maxPlayersCfg
                })
                .send({
                    from: deployerAddress,
                    amount: locklift.utils.toNano(0.2),
                    bounce: true
                }), {raise: true}
            )

            expect(maxPlayerTx.traceTree).emit("MaxPlayersUpdated")
                .and.not.to.have.error();

            const maxPlayers = await game.methods.maxPlayers().call();
            expect(+maxPlayers.maxPlayers).to.be.equal(maxPlayersCfg, "Wrong players number");

            console.log(treeTabulator + `Max number of players per round set to ${maxPlayersCfg}`)
        }
    }

    if(roundConfig.prizeFund) {
        let prizeFundCfg = roundConfig.prizeFund!!;
        if(prizeFundCfg > 0 && prizeFundCfg != defaultConfig.round.prizeFund) {
            const prizeFundTx = await locklift.tracing.trace(game
                .methods
                .setPrizeFund({
                    amount: prizeFundCfg
                })
                .send({
                    from: deployerAddress,
                    amount: locklift.utils.toNano(0.2),
                    bounce: true
                }), {raise: true}
            )

            expect(prizeFundTx.traceTree).emit("PrizeFundUpdated")
                .and.not.to.have.error();

            const prizeFund = await game.methods.prizeFundPerRound().call();
            expect(+prizeFund.prizeFundPerRound).to.be.equal(prizeFundCfg, "Wrong prize fund");

            console.log(treeTabulator + `Prize fund per round set to ${prizeFundCfg}`);

            //await locklift.giver.sendTo(game.address, prizeFundCfg.toString());
        }
    }

    if(roundConfig.entryStake) {
        let entryStakeCfg = roundConfig.entryStake!!;
        if(entryStakeCfg != defaultConfig.round.entryStake) {
            const entryStakeTx = await locklift.tracing.trace(game
                .methods
                .setEntryStake({
                    amount: entryStakeCfg
                })
                .send({
                    from: deployerAddress,
                    amount: locklift.utils.toNano(0.2),
                    bounce: true
                }), {raise: true}
            )

            expect(entryStakeTx.traceTree).emit("EntryStakeUpdated")
                .and.not.to.have.error();

            const entryStake = await game.methods.entryStake().call();
            expect(+entryStake.entryStake).to.be.equal(entryStakeCfg, "Wrong entry stake");

            console.log(treeTabulator + `Entry stake per round set to ${entryStakeCfg}`);
        }
    }

    if(roundConfig.giveUpAllowed !== undefined) {
        let giveUpAllowedCfg = roundConfig.giveUpAllowed!!;
        if(giveUpAllowedCfg != defaultConfig.round.giveUpAllowed) {
            const giveUpAllowedTx = await locklift.tracing.trace(game
                .methods
                .setPlayerGiveUpAllowed({
                    allowed: giveUpAllowedCfg
                })
                .send({
                    from: deployerAddress,
                    amount: locklift.utils.toNano(0.2),
                    bounce: true
                }), {raise: true}
            )

            expect(giveUpAllowedTx.traceTree).emit("PlayerGiveUpAllowedUpdated")
                .and.not.to.have.error();

            const giveUpAllowed = await game.methods.giveUpAllowed().call();
            expect(giveUpAllowed.giveUpAllowed).to.be.equal(giveUpAllowedCfg, "Wrong player give up allowed configuration");

            console.log(treeTabulator + `Player give up allowed set to ${giveUpAllowedCfg}`);
        }
    }

    if(roundConfig.time) {
        let timeConfig = roundConfig.time!!;

        if(timeConfig.maxMoveTime) {
            let maxMoveTimeCfg = timeConfig.maxMoveTime!!;
            if(maxMoveTimeCfg > 0 && maxMoveTimeCfg != defaultConfig.round.time.maxMoveTime) {
                const maxMoveTimeTx = await locklift.tracing.trace(game
                    .methods
                    .setMaxMoveTimeSec({
                        sec: maxMoveTimeCfg
                    })
                    .send({
                        from: deployerAddress,
                        amount: locklift.utils.toNano(0.2),
                        bounce: true
                    }), {raise: true}
                )

                expect(maxMoveTimeTx.traceTree).emit("MaxMoveTimeSecUpdated")
                    .and.not.to.have.error();

                const maxMoveTime = await game.methods.maxMoveDurationSec().call();
                expect(+maxMoveTime.maxMoveDurationSec).to.be.equal(maxMoveTimeCfg, "Wrong max move time");

                console.log(treeTabulator + `Max move time set to ${maxMoveTimeCfg}`);
            }
        }

        if(timeConfig.maxRoundTime) {
            let maxRoundTimeCfg = timeConfig.maxRoundTime!!;
            if(maxRoundTimeCfg > 0 && maxRoundTimeCfg != defaultConfig.round.time.maxRoundTime) {
                const maxRoundTimeTx = await locklift.tracing.trace(game
                    .methods
                    .setMaxRoundTimeSec({
                        sec: maxRoundTimeCfg
                    })
                    .send({
                        from: deployerAddress,
                        amount: locklift.utils.toNano(0.2),
                        bounce: true
                    }), {raise: true}
                )

                expect(maxRoundTimeTx.traceTree).emit("MaxRoundTimeSecUpdated")
                    .and.not.to.have.error();

                const maxRoundTime = await game.methods.maxRoundDurationSec().call();
                expect(+maxRoundTime.maxRoundDurationSec).to.be.equal(maxRoundTimeCfg, "Wrong max round time");

                console.log(treeTabulator + `Max round time set to ${maxRoundTimeCfg}`);
            }
        }

        if(timeConfig.autostart) {
            let autostartCfg = timeConfig.autostart!!;
            if(autostartCfg > 0 && autostartCfg != defaultConfig.round.time.autostart) {
                const autostartTx = await locklift.tracing.trace(game
                    .methods
                    .setAutostartSec({
                        sec: autostartCfg
                    })
                    .send({
                        from: deployerAddress,
                        amount: locklift.utils.toNano(0.2),
                        bounce: true
                    }), {raise: true}
                )

                expect(autostartTx.traceTree).emit("RoundAutostartSecUpdated")
                    .and.not.to.have.error();

                const autostart = await game.methods.roundAutostartSec().call();
                expect(+autostart.roundAutostartSec!!).to.be.equal(autostartCfg, "Wrong auto start time");

                console.log(treeTabulator + `Auto start time set to ${autostartCfg}`);
            }
        }
    }

    if(roundConfig.jackpot) {
        let jackpotConfig = roundConfig.jackpot!!;

        if(jackpotConfig.probabilityFreezePeriod) {
            let pfPeriodCfg = jackpotConfig.probabilityFreezePeriod!!;
            if(pfPeriodCfg > 0 && pfPeriodCfg != defaultConfig.round.jackpot.probabilityFreezePeriod) {
                const pfPeriodTx = await locklift.tracing.trace(game
                    .methods
                    .setJackpotProbabilityFreezePeriod({
                        period: pfPeriodCfg
                    })
                    .send({
                        from: deployerAddress,
                        amount: locklift.utils.toNano(0.2),
                        bounce: true
                    }), {raise: true}
                )

                expect(pfPeriodTx.traceTree).emit("RoundAutostartSecUpdated")
                    .and.not.to.have.error();

                const pfPeriod = await game.methods.jackpotProbabilityFreezePeriod().call();
                expect(+pfPeriod.jackpotProbabilityFreezePeriod).to.be.equal(pfPeriodCfg, "Wrong jackpot probability freeze period");

                console.log(treeTabulator + `Jackpot probability freeze period set to ${pfPeriodCfg}`);
            }
        }

        if(jackpotConfig.minProbability) {
            let minPCfg = jackpotConfig.minProbability!!;
            if(minPCfg > 0 && minPCfg != defaultConfig.round.jackpot.minProbability) {
                const minPCfgTx = await locklift.tracing.trace(game
                    .methods
                    .setJackpotMinProbability({
                        p: minPCfg
                    })
                    .send({
                        from: deployerAddress,
                        amount: locklift.utils.toNano(0.2),
                        bounce: true
                    }), {raise: true}
                )

                expect(minPCfgTx.traceTree).emit("JackpotMinProbabilityUpdated")
                    .and.not.to.have.error();

                const minP = await game.methods.jackpotMinProbability().call();
                expect(+minP.jackpotMinProbability).to.be.equal(minPCfg, "Wrong jackpot min probability");

                console.log(treeTabulator + `Jackpot min probability set to ${minPCfg}`);
            }
        }

        if(jackpotConfig.maxProbability) {
            let maxPCfg = jackpotConfig.maxProbability!!;
            if(maxPCfg > 0 && maxPCfg != defaultConfig.round.jackpot.maxProbability) {
                const maxPCfgTx = await locklift.tracing.trace(game
                    .methods
                    .setJackpotMaxProbability({
                        p: maxPCfg
                    })
                    .send({
                        from: deployerAddress,
                        amount: locklift.utils.toNano(0.2),
                        bounce: true
                    }), {raise: true}
                )

                expect(maxPCfgTx.traceTree).emit("JackpotMaxProbabilityUpdated")
                    .and.not.to.have.error();

                const maxP = await game.methods.jackpotMaxProbability().call();
                expect(+maxP.jackpotMaxProbability).to.be.equal(maxPCfg, "Wrong jackpot max probability");

                console.log(treeTabulator + `Jackpot max probability set to ${maxPCfg}`);
            }
        }

        if(jackpotConfig.rate) {
            let rateCfg = jackpotConfig.rate!!;
            if(rateCfg > 0 && rateCfg != defaultConfig.round.jackpot.rate) {
                const rateTx = await locklift.tracing.trace(game
                    .methods
                    .setJackpotRate({
                        rate: rateCfg
                    })
                    .send({
                        from: deployerAddress,
                        amount: locklift.utils.toNano(0.2),
                        bounce: true
                    }), {raise: true}
                )

                expect(rateTx.traceTree).emit("JackpotRateUpdated")
                    .and.not.to.have.error();

                const rate = await game.methods.jackpotRate().call();
                expect(+rate.jackpotRate).to.be.equal(rateCfg, "Wrong jackpot rate");

                console.log(treeTabulator + `Jackpot rate set to ${rateCfg}`);
            }
        }

        if(jackpotConfig.averagedPeriods) {
            let jpPeriodsCfg = jackpotConfig.averagedPeriods!!;
            if(jpPeriodsCfg > 0 && jpPeriodsCfg != defaultConfig.round.jackpot.averagedPeriods) {
                const jpPeriodsTx = await locklift.tracing.trace(game
                    .methods
                    .setJackpotAveragedPeriods({
                        qty: jpPeriodsCfg
                    })
                    .send({
                        from: deployerAddress,
                        amount: locklift.utils.toNano(0.2),
                        bounce: true
                    }), {raise: true}
                )

                expect(jpPeriodsTx.traceTree).emit("JackpotAveragedPeriodsUpdated")
                    .and.not.to.have.error();

                const jpPeriods = await game.methods.jackpotAveragedPeriods().call();
                expect(+jpPeriods.jackpotAveragedPeriods).to.be.equal(jpPeriodsCfg, "Wrong jackpot averaged periods");

                console.log(treeTabulator + `Jackpot averaged periods set to ${jpPeriodsCfg}`);
            }
        }
    }

    if(roundConfig.createFirstRound !== undefined) {
        const createRoundTx = await locklift.tracing.trace(game
            .methods
            .createRound({
                answerId: 0
            })
            .send({
                from: deployerAddress,
                amount: locklift.utils.toNano(0.2),
                bounce: true
            }), {raise: true}
        )

        expect(createRoundTx.traceTree).emit("RoundCreated")
            .and.not.to.have.error();

        const round = await game.methods.getRounds({answerId: 0, status: 0}).call();
        expect(round._rounds.length).to.be.equal(1, "Incorrect rounds number");

        const roundId = +round._rounds.pop()!!.id;

        console.log(treeTabulator + `Created round ${roundId}`);
    }

/*
    const walletBalance = +(await locklift.provider.getBalance(new Address("0:2746d46337aa25d790c97f1aefb01a5de48cc1315b41a4f32753146a1e1aeb7d")));
    if (walletBalance < 1000) {
        await locklift
            .giver
            .sendTo(
                new Address("0:2746d46337aa25d790c97f1aefb01a5de48cc1315b41a4f32753146a1e1aeb7d"),
                locklift.utils.toNano(1000 - walletBalance)
            );
    }
*/

    if(boardConfig.owner) {
        let newOwner = boardConfig.owner!!;

        await locklift.tracing.trace(game
            .methods
            .transferOwnership({"newOwner": newOwner})
            .send({
                from: deployerAddress,
                amount: locklift.utils.toNano(0.3),
                bounce: true
            })
        )

        console.log(treeTabulator + `Owner changed to ${newOwner}`)
    }


}

main()
    .then(() => process.exit(0))
    .catch(e => {
        console.log(e);
        process.exit(1);
    });

function readConfigFile(filePath: string): Config | null {
    try {
        const fileData = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileData) as Config;
    } catch (err) {
        console.log(`Configuration file ${filePath} not found`);
        return null;
    }
}