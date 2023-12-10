const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    const tokenUris = networkConfig[chainId].MGUris
    const tokenPrice = networkConfig[chainId].tokenPrice
    const updatePrice = networkConfig[chainId].updatePrice
    const beneficiary1 = (await getNamedAccounts()).beneficiary1
    const beneficiary2 = (await getNamedAccounts()).beneficiary2

    const priceFeed = networkConfig[chainId].priceFeed
    const vrfCoordinator = networkConfig[chainId].vrfCoordinator
    const vrfSubscriptionId = networkConfig[chainId].vrfSubscriptionId
    const keyHash = networkConfig[chainId].keyHash
    const requestConfirmations = networkConfig[chainId].requestConfirmations
    const callbackGasLimit = networkConfig[chainId].callbackGasLimit
    const linkToken = networkConfig[chainId].linkToken
    const iweth = networkConfig[chainId].iweth
    const uniswapRouter = networkConfig[chainId].uniswapRouter
    const automationRegistry = networkConfig[chainId].automationRegistry
    const automationSubscriptionId =
        networkConfig[chainId].automationSubscriptionId
    const functionsRouter = networkConfig[chainId].functionsRouter
    const functionSubscriptionId = networkConfig[chainId].functionSubscriptionId
    const gasLimit = networkConfig[chainId].gasLimit
    const donId = networkConfig[chainId].donId

    const args = [
        tokenUris,
        beneficiary1,
        beneficiary2,
        tokenPrice,
        updatePrice,
        priceFeed,
        vrfCoordinator,
        vrfSubscriptionId,
        keyHash,
        requestConfirmations,
        callbackGasLimit,
        linkToken,
        iweth,
        uniswapRouter,
        automationRegistry,
        functionsRouter,
        functionSubscriptionId,
        gasLimit,
        donId,
    ]

    console.log("Deploying NFT collection...")

    const nftCollection = await deploy("MagisterMilitum", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
        gasLimit: 10000000,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(nftCollection.address, args)
    }
    console.log("Token contract was deployed!")

    // const contract = await ethers.getContract("MagisterMilitum")
    // const tx = await contract.setAutomation(automationSubscriptionId)
    // await tx.wait(1)
    // console.log("Automation was set!")
}

module.exports.tags = ["all", "nftCollection"]
