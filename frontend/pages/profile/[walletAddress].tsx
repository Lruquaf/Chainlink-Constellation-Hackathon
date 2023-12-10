import {
	MediaRenderer,
	Web3Button,
	useAddress,
	useContract,
	useContractRead,
} from "@thirdweb-dev/react";
import styles from "../../styles/Home.module.css";
import { CONTRACT_ADDRESS } from "../../const/addresses";
import { useEffect, useState } from "react";
import { CONTRACT_ABI } from "../../const/abis";
import Modal from "../Modal";
import { ethers } from "ethers";
import { ThirdwebStorage } from "@thirdweb-dev/storage";

interface NFT {
	tokenId: number;
	tokenUri: any;
	name?: string;
	title?: string;
	image?: string;
	attributes?: Array<{ trait_type: string; value: any }>;
}

export default function Profile() {
	const storage = new ThirdwebStorage({
		clientId: "38f8f76fc6a5b0401f2a53b5afcece39",
		gatewayUrls: ["https://ipfs.io/ipfs/"],
	});
	const address = useAddress();
	const truncatedAddress = (address: string) =>
		`${address.slice(0, 6)}...${address.slice(-4)}`;

	const { contract, isLoading: isContractLoading } = useContract(
		CONTRACT_ADDRESS,
		CONTRACT_ABI
	);
	const { data: totalSupply, isLoading: isTotalSupplyLoading } =
		useContractRead(contract, "getTokenCounter");

	const [nfts, setNFTs] = useState<NFT[]>([]);
	const [isNFTsLoading, setIsNFTsLoading] = useState(false);

	const [isNFTModalOpen, setIsNFTModalOpen] = useState(false);
	const [selectedNFT, setSelectedNFT] = useState<NFT>({
		tokenId: 0,
		tokenUri: null,
	});
	const [selectedNFTDetails, setSelectedNFTDetails] = useState<{
		name?: string;
		title?: string;
		description?: string;
		image?: string;
		attributes?: Array<{ trait_type: string; value: any }>;
		tokenUri: string;
	} | null>(null);
	const [isNFTDetailsLoading, setNFTDetailsLoading] = useState(false);

	const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
	const [newAttributes, setNewAttributes] = useState({
		attack: 50,
		defence: 50,
		administration: 50,
		morale: 50,
	});

	const {
		data: price,
		isLoading: isPriceLoading,
		error,
	} = useContractRead(contract, "getUpdatePriceInEth");

	const getNFTDetails = async (tokenUri: string) => {
		try {
			setNFTDetailsLoading(true);
			const response = await fetch(tokenUri);
			const data = await response.json();
			return {
				name: data.name,
				title: data.title,
				description: data.description,
				image: data.image,
				attributes: data.attributes || [],
				tokenUri,
			};
		} catch (error) {
			console.error("Error fetching NFT details:", error);
			return null;
		} finally {
			setNFTDetailsLoading(false);
		}
	};

	const getOwnedNFTs = async () => {
		try {
			setIsNFTsLoading(true);
			if (!isTotalSupplyLoading && !isContractLoading) {
				const nfts: NFT[] = [];
				for (let i = 0; i < totalSupply.toNumber(); i++) {
					if (contract) {
						const owner = await contract.call("ownerOf", [
							i.toString(),
						]);
						if (owner === address) {
							const tokenId = i;
							const tokenUri = await contract.call("tokenURI", [
								tokenId.toString(),
							]);

							const details = await getNFTDetails(tokenUri);

							nfts.push({
								tokenId,
								tokenUri,
								name: details?.name,
								title: details?.title,
								image: details?.image,
								attributes: details?.attributes,
							});
						}
					}
				}
				setNFTs(nfts);
			}
		} catch (error) {
			console.error("Error:", error);
		} finally {
			setIsNFTsLoading(false);
		}
	};

	const handleNFTClick = async (tokenId: number, tokenUri: any) => {
		const details = await getNFTDetails(tokenUri);

		if (details) {
			setSelectedNFTDetails(details);
			setSelectedNFT({ tokenId, tokenUri });
			setIsNFTModalOpen(true);
		} else {
			console.error("NFT details could not be fetched.");
		}
	};

	const [newMetadataUrl, setNewMetadataUrl] = useState<string>();

	const handleUpdateURI = async (newAttributes: {
		attack: any;
		defence: any;
		administration: any;
		morale: any;
	}) => {
		const newMetadata = {
			name: selectedNFTDetails?.name || "",
			title: selectedNFTDetails?.title || "",
			description: selectedNFTDetails?.description || "",
			image: selectedNFTDetails?.image || "",
			attributes: [
				{ trait_type: "Attack", value: newAttributes.attack },
				{ trait_type: "Defence", value: newAttributes.defence },
				{
					trait_type: "Administration",
					value: newAttributes.administration,
				},
				{ trait_type: "Morale", value: newAttributes.morale },
			],
		};

		// Check if selectedNFTDetails.attributes is defined before using it
		if (selectedNFTDetails?.attributes) {
			// Continue with your logic here
			const uri = await storage.upload(newMetadata);
			console.info(uri);
			const url = storage.resolveScheme(uri);
			console.info(url.toString());
			setNewMetadataUrl(url.toString());
			console.log(newMetadataUrl);
			setIsAttributeModalOpen(false);
		} else {
			console.error("Attributes are undefined in selectedNFTDetails");
		}
	};

	const handleCreateMetadata = () => {
		setIsAttributeModalOpen(true);
	};

	useEffect(() => {
		if (address) {
			getOwnedNFTs();
		}
	}, [address]);

	return (
		<div className={styles.container}>
			{address ? (
				<div>
					<div>
						<h1>Profile</h1>
						<p>Wallet Address: {truncatedAddress(address || "")}</p>
					</div>
					<hr />
					<div>
						<h3>My NFTs</h3>
						<div className={styles.grid}>
							{!isNFTsLoading ? (
								nfts.length > 0 ? (
									<div className={styles.grid}>
										{nfts.map((nft) => (
											<div
												className={`${styles.card} ${
													selectedNFT?.tokenId ===
													nft.tokenId
														? styles.expanded
														: ""
												}`}
												key={nft.tokenId}
												onClick={() =>
													handleNFTClick(
														nft.tokenId,
														nft.tokenUri
													)
												}
											>
												<MediaRenderer
													className={styles.general}
													src={nft.image}
													width="250px"
													height="250px"
												/>
												<div className={styles.idName}>
													<p>#{nft.tokenId}</p>
													{nft.name && (
														<p>{nft.name}</p>
													)}
												</div>
											</div>
										))}
									</div>
								) : (
									<p>No NFTs owned.</p>
								)
							) : (
								<p>Loading...</p>
							)}
						</div>
					</div>
				</div>
			) : (
				<div className={styles.main}>Please connect your wallet</div>
			)}

			<Modal
				isOpen={isNFTModalOpen}
				onClose={() => setIsNFTModalOpen(false)}
				content={
					<div className={styles.modalContent}>
						<div>
							<h2>{selectedNFTDetails?.name}</h2>
							<h3>{selectedNFTDetails?.title}</h3>
							{selectedNFTDetails && (
								<div className={styles.modalImageDesc}>
									<MediaRenderer
										className={styles.general}
										src={selectedNFTDetails.image}
										width="250px"
										height="250px"
									/>
									<p>{selectedNFTDetails.description}</p>

									{/* Display attributes */}
									<div className={styles.attributes}>
										<ul>
											{selectedNFTDetails.attributes?.map(
												(attribute, index) => (
													<li key={index}>
														<strong>
															{
																attribute.trait_type
															}
															:
														</strong>{" "}
														{attribute.value}
													</li>
												)
											)}
										</ul>
									</div>
								</div>
							)}
							{!isPriceLoading ? (
								<h2 className={styles.price}>
									Update Price: $10 ~{" "}
									{ethers.utils.formatEther(price)} ETH
								</h2>
							) : (
								<p className={styles.price}>Loading...</p>
							)}
							<div className={styles.claimContainer}>
								<button
									className={styles.attributesButton}
									onClick={handleCreateMetadata}
								>
									Update Attributes
								</button>
							</div>
						</div>
					</div>
				}
			/>

			{/* Step 2: Render the AttributeModal */}
			{isAttributeModalOpen && (
				<Modal
					isOpen={isAttributeModalOpen}
					onClose={() => setIsAttributeModalOpen(false)}
					content={
						<div
							className={styles.modalContent}
							style={{ zIndex: 2 }}
						>
							<h2>Update Attributes</h2>
							<div className={styles.attributes}>
								<label>
									Attack:
									<input
										type="number"
										value={newAttributes.attack}
										onChange={(e) =>
											setNewAttributes({
												...newAttributes,
												attack:
													parseInt(e.target.value) ||
													0,
											})
										}
									/>
								</label>
								<br />
								<label>
									Defence:
									<input
										type="number"
										value={newAttributes.defence}
										onChange={(e) =>
											setNewAttributes({
												...newAttributes,
												defence:
													parseInt(e.target.value) ||
													0,
											})
										}
									/>
								</label>
								<br />
								<label>
									Administration:
									<input
										type="number"
										value={newAttributes.administration}
										onChange={(e) =>
											setNewAttributes({
												...newAttributes,
												administration:
													parseInt(e.target.value) ||
													0,
											})
										}
									/>
								</label>
								<br />
								<label>
									Morale:
									<input
										type="number"
										value={newAttributes.morale}
										onChange={(e) =>
											setNewAttributes({
												...newAttributes,
												morale:
													parseInt(e.target.value) ||
													0,
											})
										}
									/>
								</label>
								<br />
								<div className={styles.claimContainer}>
									<Web3Button
										contractAddress={CONTRACT_ADDRESS}
										contractAbi={CONTRACT_ABI}
										action={async (contract) => {
											await handleUpdateURI(
												newAttributes
											);
											const tokenId = selectedNFT.tokenId;
											const currentPrice = price;
											const args = [
												tokenId.toString(),
												newMetadataUrl,
											];
											await contract.call(
												"updateUri",
												args,
												{
													value: currentPrice,
												}
											);
										}}
										onSuccess={(result) =>
											alert(`Success!`)
										}
										onError={(error) =>
											alert(
												`Something went wrong: ${error}`
											)
										}
										onSubmit={() =>
											console.log("Transaction submitted")
										}
									>
										Update the URI
									</Web3Button>
								</div>
							</div>
						</div>
					}
				/>
			)}
		</div>
	);
}
