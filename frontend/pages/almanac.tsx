import { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import Modal from "./Modal";
import {
	MediaRenderer,
	useContract,
	useContractRead,
} from "@thirdweb-dev/react";
import { CONTRACT_ADDRESS } from "../const/addresses";

interface TextContent {
	id: string;
	name: string;
	title: string;
	description: string;
	image: string;
	attributes?: { trait_type: string; value: string }[];
}

const Almanac: NextPage = () => {
	const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [expandedCard, setExpandedCard] = useState<TextContent | null>(null);
	const [textContentList, setTextContentList] = useState<TextContent[]>([]);
	const { contract } = useContract(CONTRACT_ADDRESS);
	const {
		data: generalUris,
		isLoading: isPriceLoading,
		error,
	} = useContractRead(contract, "getGeneralUris");

	const fetchContent = async () => {
		const ipfsLinks = generalUris;

		try {
			const contentPromises = ipfsLinks.map(
				async (
					link: string | URL | Request,
					index: { toString: () => any }
				) => {
					const response = await fetch(link);

					if (!response.ok) {
						throw new Error(`Failed to fetch content from ${link}`);
					}

					const data = await response.json();
					return {
						id: index.toString(),
						name: data.name,
						title: data.title,
						description: data.description,
						image: data.image,
						attributes: data.attributes || [],
					};
				}
			);

			const newContent = await Promise.all(contentPromises);
			setTextContentList(newContent);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		fetchContent();
	}, []);

	const handleCardClick = (id: string | null) => {
		if (expandedCardId === id) {
			setExpandedCardId(null);
		} else {
			setExpandedCardId(id);
			const card = textContentList.find((item) => item.id === id);
			if (card) {
				setExpandedCard(card);
			}
			setIsModalOpen(true);
		}
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};

	return (
		<div className={styles.container}>
			<h1>Almanac</h1>
			<hr />
			<div className={styles.grid}>
				{textContentList.map((item) => (
					<div
						className={`${styles.card} ${
							expandedCardId === item.id ? styles.expanded : ""
						}`}
						key={item.id}
						onClick={() => handleCardClick(item.id)}
					>
						{/* MediaRenderer component */}
						<div className={styles.idName}>
							<p>#{item.id}</p>
						</div>
						<MediaRenderer
							className={styles.general}
							src={item.image}
							// width="250px"
							// height="250px"
						/>
						<div className={styles.idName}>
							<p>{item.name}</p>
						</div>
					</div>
				))}
			</div>
			<Modal
				isOpen={isModalOpen}
				onClose={closeModal}
				content={
					<div className={styles.modalContent}>
						<div>
							<h2>{expandedCard?.name}</h2>
							<h3>{expandedCard?.title}</h3>
							<div className={styles.modalImageDesc}>
								<MediaRenderer
									className={styles.general}
									src={expandedCard?.image}
									width="250px"
									height="250px"
								/>
								<p className={styles.generalDescription}>
									{expandedCard?.description}
								</p>
								<div className={styles.attributes}>
									{expandedCard?.attributes && (
										<ul>
											{expandedCard.attributes.map(
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
									)}
								</div>
							</div>
						</div>
					</div>
				}
			/>
		</div>
	);
};

export default Almanac;
