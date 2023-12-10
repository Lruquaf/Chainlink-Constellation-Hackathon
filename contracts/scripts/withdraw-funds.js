const { ethers, getNamedAccounts, network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")

async function main() {
    const beneficiary1 = (await getNamedAccounts()).beneficiary1
    const founder1 = (await getNamedAccounts()).founder1
    const nftCollection = await ethers.getContract("MagisterMilitum", founder1)

    let proceedAmount = await nftCollection.getProceeds(founder1)
    console.log("Initial amount: ", proceedAmount.toString())

    const tx = await nftCollection.withdrawFunds()
    await tx.wait(1)

    proceedAmount = await nftCollection.getProceeds(founder1)
    console.log("Recent amount: ", proceedAmount.toString())
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
