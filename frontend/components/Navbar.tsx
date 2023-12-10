import Link from "next/link";
import styles from "../styles/Home.module.css";
import { ConnectWallet, useAddress } from "@thirdweb-dev/react";

export default function Navbar() {
	const address = useAddress();
	return (
		<div className={styles.container}>
			<div className={styles.navbar}>
				<Link href="/">
					<p>Mint an NFT</p>
				</Link>
				<div className={styles.navLinks}>
					<Link href="/almanac">
						<p>Almanac</p>
					</Link>
				</div>
				<div className={styles.navLinks}>
					{address && (
						<Link href={`/profile/${address}`}>
							<p>My NFTs</p>
						</Link>
					)}
				</div>
				<div className={styles.navLinks}>
					<Link href="/about-us">
						<p>About Us</p>
					</Link>
				</div>
				<div className={styles.socialLinks}>
					<a
						href="https://twitter.com/your-twitter-profile"
						target="_blank"
						rel="noopener noreferrer"
					>
						Twitter
					</a>
					<a
						href="https://facebook.com/your-facebook-profile"
						target="_blank"
						rel="noopener noreferrer"
					>
						Discord
					</a>
					<a
						href="https://instagram.com/your-instagram-profile"
						target="_blank"
						rel="noopener noreferrer"
					>
						Github
					</a>
					<a
						href="https://instagram.com/your-instagram-profile"
						target="_blank"
						rel="noopener noreferrer"
					>
						Etherscan
					</a>
				</div>
				<ConnectWallet />
			</div>
		</div>
	);
}
