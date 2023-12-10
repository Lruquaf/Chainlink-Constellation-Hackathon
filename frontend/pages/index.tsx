import styles from "../styles/Home.module.css";
import { StaticImageData } from "next/image";
import { NextPage } from "next";
import {
	MediaRenderer,
	Web3Button,
	useAddress,
	useContract,
	useContractRead,
} from "@thirdweb-dev/react";
import { CONTRACT_ADDRESS } from "../const/addresses";
import { CONTRACT_ABI } from "../const/abis";
import collectionImage from "../images/cover-image/newImage.png";
import { ethers } from "ethers";

const Home: NextPage = () => {
	const address = useAddress();
	const { contract } = useContract(CONTRACT_ADDRESS);
	const {
		data: price,
		isLoading: isPriceLoading,
		error,
	} = useContractRead(contract, "getTokenPriceInEth");
	const collectionImageSrc = collectionImage.src as string;
	return (
		<div className={styles.container}>
			<main className={styles.main}>
				<div className={styles.heroSection}>
					<div className={styles.collectionImage}>
						<MediaRenderer
							className={styles.image}
							src={collectionImageSrc}
						/>
					</div>
					<div>
						<h1 className={styles.title}>Magister Militum</h1>
						<p className={styles.description}>
							Welcome to the world of Magister Militum, an
							innovative NFT collection where history meets
							blockchain technology. Dive into a realm where each
							NFT is a digital tribute to the legendary commanders
							of the past, uniquely minted with Chainlink&apos;s
							advanced services. Explore our collection,
							experience the fusion of historical significance and
							blockchain innovation, and own a piece of history
							reinvented for the digital age. Join us in this
							exciting venture and become a part of the Magister
							Militum legacy.
						</p>
						{!isPriceLoading ? (
							<h2 className={styles.price}>
								Mint Price: $20 ~{" "}
								{ethers.utils.formatEther(price)} ETH
							</h2>
						) : (
							<p className={styles.price}>Loading...</p>
						)}
						<div className={styles.claimContainer}>
							<Web3Button
								contractAddress={CONTRACT_ADDRESS}
								contractAbi={CONTRACT_ABI}
								action={async (contract) => {
									await contract.call("mintNft", [], {
										value: price,
									});
								}}
								onSuccess={(result) => alert(`Success!`)}
								onError={(error) =>
									alert(`Something went wrong: ${error}`)
								}
								onSubmit={() =>
									console.log("Transaction submitted")
								}
							>
								Mint an NFT
							</Web3Button>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default Home;
