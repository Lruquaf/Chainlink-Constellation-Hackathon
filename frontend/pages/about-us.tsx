import Link from "next/link";
import styles from "../styles/Home.module.css";

const About = () => {
    return (
        <div className={styles.container}>
            <h1>About Us</h1>
            <hr />
            <main className={styles.main}>
                <div className={styles.grid}>
                    <div className={styles.card}>Samet</div>
                    <div className={styles.card}>Yavuz</div>
                </div>
            </main>
        </div>
    );
};

export default About;
