import { useContract, useNFT } from "@thirdweb-dev/react";
import { CONTRACT_ADDRESS } from "../../const/addresses";
import { CONTRACT_ABI } from "../../const/abis";
import styles from "../../styles/Home.module.css";

interface NFTGalleryProps {
	tokenIds: number[];
	onNFTClick: (tokenId: number, tokenUri: any) => void;
}

function NFTGallery({ tokenIds, onNFTClick }: NFTGalleryProps) {
	if (!tokenIds) {
		return <p>No tokenIds provided.</p>;
	}

	return (
		<div className={styles.grid}>
			{tokenIds.map((tokenId: number, index: number) => (
				<NFTImage
					key={index}
					tokenId={tokenId}
					onNFTClick={(tokenId, tokenUri) =>
						onNFTClick(tokenId, tokenUri)
					}
				/>
			))}
		</div>
	);
}

interface NFTImageProps {
	tokenId: number;
	onNFTClick: (tokenId: number, tokenUri: any) => void;
}

function NFTImage({ tokenId, onNFTClick }: NFTImageProps) {
	const { contract, isLoading: isContractLoading } = useContract(
		CONTRACT_ADDRESS,
		CONTRACT_ABI
	);

	const { data: nft, isLoading: isNFTLoading } = useNFT(contract, tokenId);

	if (!nft) {
		return null;
	}

	const handleClick = () => {
		// Pass the required parameters to onNFTClick
		onNFTClick(tokenId, nft.metadata.tokenUri);
	};

	return (
		<div onClick={handleClick} className={styles.clickableNFT}>
			{isNFTLoading ? (
				<p>Loading...</p>
			) : (
				<div className={styles.card}>
					<img
						src={nft.metadata.image || ""}
						alt={`NFT #${tokenId}`}
					/>
					<h3>{`Token Id: #${tokenId}`}</h3>
					<p>{nft.metadata.name}</p>
				</div>
			)}
		</div>
	);
}

export default NFTGallery;
