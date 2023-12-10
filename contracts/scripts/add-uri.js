const { ethers, getNamedAccounts, network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")

async function main() {
    const chainId = network.config.chainId
    const deployer = (await getNamedAccounts()).deployer
    const newUris = networkConfig[chainId].newUris
    const nftCollection = await ethers.getContract("MagisterMilitum", deployer)

    let generalUri = await nftCollection.getGeneralUri("9")
    console.log("Initial latest URI: ", generalUri)

    const tx = await nftCollection.addTokenUri(newUris)
    await tx.wait(1)

    generalUri = await nftCollection.getGeneralUri("15")
    console.log("Recent latest URI: ", generalUri)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
