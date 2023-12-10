const { ethers, getNamedAccounts, network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")

async function main() {
    const chainId = network.config.chainId
    const beneficiary2 = (await getNamedAccounts()).beneficiary2
    const newBeneficiary2 = (await getNamedAccounts()).founder1
    const nftCollection = await ethers.getContract(
        "MagisterMilitum",
        beneficiary2
    )

    let amount = await nftCollection.getProceeds(beneficiary2)
    console.log("Initial amount: ", amount.toString())
    let amountNew = await nftCollection.getProceeds(newBeneficiary2)
    console.log("Initial amount of new: ", amountNew.toString())

    const tx = await nftCollection.changeBeneficiary(newBeneficiary2)
    await tx.wait(1)

    amount = await nftCollection.getProceeds(beneficiary2)
    console.log("Recent amount: ", amount.toString())
    amountNew = await nftCollection.getProceeds(newBeneficiary2)
    console.log("Recent amount: ", amountNew.toString())
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
