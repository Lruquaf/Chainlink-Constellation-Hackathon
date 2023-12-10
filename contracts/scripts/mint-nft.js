const { ethers, getNamedAccounts, network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")

async function main() {
    const chainId = network.config.chainId
    const minter = (await getNamedAccounts()).user1
    const price = networkConfig[chainId].tokenPrice
    const nftCollection = await ethers.getContract("MagisterMilitum", minter)

    let tokenCounter = await nftCollection.getTokenCounter()
    console.log("Initial token counter: ", tokenCounter.toString())

    const tx = await nftCollection.mintNft({ value: price })
    await tx.wait(1)

    tokenCounter = await nftCollection.getTokenCounter()
    console.log("Recent token counter: ", tokenCounter.toString())

    const tokenUri = await nftCollection.getTokenUri(
        (tokenCounter.toString() - 1).toString()
    )
    console.log("Latest token: ", tokenUri)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
