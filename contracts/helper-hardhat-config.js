const { ethers } = require("hardhat")

const networkConfig = {
    31337: {
        name: "localhost",
        MGUris: [
            "ipfs://QmeYXFyq34jaEeb5SRBCXGx27Mxbf8KjHhjfeodTjxqUMT",
            "ipfs://QmNd8e6gZ3sHiUA9P5ndxUGBSGAFyjGLyy63sTnpK1Akao",
            "ipfs://QmcnHVpyBcErHhAN8JEBcZHtzLo6jZhfKipcMEaLryNyb8",
            "ipfs://QmQjva3vPXaff9kJAYnPnonXKvnA7pjpaciwveXpb58WZA",
            "ipfs://QmdgS3vrexrbM4AantVfJizCA8Y6PYLBBsm8agdMeNXZpS",
            "ipfs://QmdeHiieGj62bxNtSpingL7ggsjzb457F1Yn8osTawYfsm",
            "ipfs://QmRmuYMvZvGWkgXa1wDKZrbSs9YioWAvu1tnEQ1QFbQvoz",
            "ipfs://QmeQbMtc6GDb18VbvNaUp17ypTsS2fvB6wDGynid9iYvS5",
            "ipfs://QmTFU9UACYV7KjVyMy41bMX6W8hcySGKrpoRrgx3tBM6XG",
            "ipfs://QmRzsLjCL2LZQSC4T5LDCRCFHBLNS1YxDnmqJgF54aexrT",
        ],
        tokenPrice: ethers.parseEther("1"),
        updatePrice: ethers.parseEther("5"),
        newUris: [
            "ipfs://bafybeidlmadropcwraycov5hoeped536jasdqudq7oeojcz2h2so55v3vq",
            "ipfs://bafybeiaenq6huoqke5apsmm54tdlnp4rbb7h2swivbvur2f6inn4p3yfo4",
            "ipfs://bafybeihmlt5bxerdcpij4jst5tmbbvadyp7b64mysb3jadmpqjdthj6scq",
            "ipfs://bafybeid6gv7ksk7uald5fcguwnyqix37h3bdlqkuo5wv6hb3fmc2tutfhq",
            "ipfs://bafybeiav2fspl7l42m4dwemg3km7fvhku6na5nit7k7jk3xlm5a7iyugle",
            "ipfs://bafybeifol6vcogyucktp7zi7nhq4bid6ehvg2wppoykl5ysqu2lfr7p4le",
        ],
        priceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        vrfSubscriptionId: 1,
        keyHash:
            "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        requestConfirmations: 3,
        callbackGasLimit: 1000000,
        linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
        iweth: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
        uniswapRouter: "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008",
        automationRegistry: "0x86EFBD0b6736Bed994962f9797049422A3A8E8Ad",
        automationSubscriptionId: 1,
        functionsRouter: "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0",
        source: `const originalUri = args[0]
        const newUri = args[1]
        let returnedValue = ""
        let isValid = 0;
        const originalApiResponse = await Functions.makeHttpRequest({
            url: originalUri
        })
        if (originalApiResponse.error) {
            console.error(originalApiResponse.error)
            throw Error("Original Api Request failed")
        }
        const { data: originalData } = originalApiResponse;
        console.log('Original API response data:', JSON.stringify(originalData, null, 2));
        const newApiResponse = await Functions.makeHttpRequest({
            url: newUri
        })
        if (newApiResponse.error) {
            console.error(newApiResponse.error)
            throw Error("New Api Request failed")
        }
        const { data: newData } = newApiResponse;
        console.log('New API response data:', JSON.stringify(newData, null, 2));
        console.log(Object.keys(originalData).length)
        console.log(Object.keys(newData).length)
        if (Object.keys(originalData).length !== Object.keys(newData).length) {
            isValid = 0;
        } else {
            const originalName = originalData.name
            const newName = newData.name
            const originalDescription = originalData.description
            const newDescription = newData.description
            const originalImage = originalData.image
            const newImage = newData.image
            const originalAttributes = originalData.attributes
            const newAttributes = newData.attributes
            if (Object.keys(originalAttributes).length !== Object.keys(newAttributes).length) {
                isValid = 0;
            } else {
                if (originalName !== newName) {
                    isValid = 0;
                }
                else if (originalDescription !== newDescription) {
                    isValid = 0;
                }
                else if (originalImage !== newImage) {
                    isValid = 0;
                }
                for (i = 0; i < originalAttributes.length; i++) {
                    if ((originalAttributes[i].trait_type !== newAttributes[i].trait_type) || (newAttributes[i].value > 100 && newAttributes[i].value < 0)) {
                        isValid = 0;
                    }
                    else {
                        isValid = 1;
                    }
                }
            }
        }
        if (isValid === 1) {
            returnedValue = newUri;
        }
        return Functions.encodeString(returnedValue)
        `,
        functionSubscriptionId: 1,
        gasLimit: 1000000,
        donId: "0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000",
    },
    11155111: {
        name: "sepolia",
        MGUris: [
            "https://nftstorage.link/ipfs/bafybeifo2pwz53ac25zgw2d7tqs5hi6eorvotdq7sj4yf5oc5gkopny7tm/1.json",
            "https://nftstorage.link/ipfs/bafybeifo2pwz53ac25zgw2d7tqs5hi6eorvotdq7sj4yf5oc5gkopny7tm/2.json",
            "https://nftstorage.link/ipfs/bafybeifo2pwz53ac25zgw2d7tqs5hi6eorvotdq7sj4yf5oc5gkopny7tm/3.json",
            "https://nftstorage.link/ipfs/bafybeifo2pwz53ac25zgw2d7tqs5hi6eorvotdq7sj4yf5oc5gkopny7tm/4.json",
            "https://nftstorage.link/ipfs/bafybeifo2pwz53ac25zgw2d7tqs5hi6eorvotdq7sj4yf5oc5gkopny7tm/5.json",
            "https://nftstorage.link/ipfs/bafybeifo2pwz53ac25zgw2d7tqs5hi6eorvotdq7sj4yf5oc5gkopny7tm/6.json",
            "https://nftstorage.link/ipfs/bafybeifo2pwz53ac25zgw2d7tqs5hi6eorvotdq7sj4yf5oc5gkopny7tm/7.json",
            "https://nftstorage.link/ipfs/bafybeifo2pwz53ac25zgw2d7tqs5hi6eorvotdq7sj4yf5oc5gkopny7tm/8.json",
            "https://nftstorage.link/ipfs/bafybeifo2pwz53ac25zgw2d7tqs5hi6eorvotdq7sj4yf5oc5gkopny7tm/9.json",
            "https://nftstorage.link/ipfs/bafybeifo2pwz53ac25zgw2d7tqs5hi6eorvotdq7sj4yf5oc5gkopny7tm/10.json",
        ],
        tokenPrice: ethers.parseEther("20"),
        updatePrice: ethers.parseEther("10"),
        newUris: [
            "ipfs://bafybeidlmadropcwraycov5hoeped536jasdqudq7oeojcz2h2so55v3vq",
            "ipfs://bafybeiaenq6huoqke5apsmm54tdlnp4rbb7h2swivbvur2f6inn4p3yfo4",
            "ipfs://bafybeihmlt5bxerdcpij4jst5tmbbvadyp7b64mysb3jadmpqjdthj6scq",
            "ipfs://bafybeid6gv7ksk7uald5fcguwnyqix37h3bdlqkuo5wv6hb3fmc2tutfhq",
            "ipfs://bafybeiav2fspl7l42m4dwemg3km7fvhku6na5nit7k7jk3xlm5a7iyugle",
            "ipfs://bafybeifol6vcogyucktp7zi7nhq4bid6ehvg2wppoykl5ysqu2lfr7p4le",
        ],
        priceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        vrfSubscriptionId: "7590",
        keyHash:
            "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        requestConfirmations: "3",
        callbackGasLimit: "1000000",
        linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
        iweth: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
        uniswapRouter: "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008",
        automationRegistry: "0x86EFBD0b6736Bed994962f9797049422A3A8E8Ad",
        automationSubscriptionId:
            "55771538274210359506481408088011805144333572906696393572020017732364250068564",
        functionsRouter: "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0",
        functionSubscriptionId: "1795",
        gasLimit: "300000",
        donId: "0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000",
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = { networkConfig, developmentChains }
