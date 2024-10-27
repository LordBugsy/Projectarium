import styles from './BuyCredits.module.scss';

const BuyCredits = () => {
    return (
        <>
            <div className={`${styles.buyCreditsContainer} fadeIn`}>
                <div className={styles.buyCredits}>
                    <h1 className='componentTitle'>Buy Credits</h1>

                    <div className={styles.buyContainer}>

                        <div className={styles.card}>
                            <div className={styles.cardImage}>
                                <i className={`fa-solid fa-ticket ${styles.icon}`}></i>
                            </div>
                            <div className={styles.cardInfo}>
                                <p className={styles.cardText}>100 Credits</p>
                                <p className={styles.cardPrice}>$0.99</p>
                            </div>
                        </div>

                        <div className={styles.card}>
                            <div className={styles.cardImage}>
                                <i className={`fa-solid fa-ticket ${styles.icon}`}></i>
                            </div>
                            <div className={styles.cardInfo}>
                                <p className={styles.cardText}>305 Credits</p>
                                <p className={styles.cardPrice}>$2.99</p>
                            </div>
                        </div>

                        <div className={styles.card}>
                            <div className={styles.cardImage}>
                                <i className={`fa-solid fa-ticket ${styles.icon}`}></i>
                            </div>
                            <div className={styles.cardInfo}>
                                <p className={styles.cardText}>525 Credits</p>
                                <p className={styles.cardPrice}>$4.99</p>
                            </div>
                        </div>

                        <div className={styles.card}>
                            <div className={styles.cardImage}>
                                <i className={`fa-solid fa-ticket ${styles.icon}`}></i>
                            </div>
                            <div className={styles.cardInfo}>
                                <p className={styles.cardText}>875 Credits</p>
                                <p className={styles.cardPrice}>$7.99</p>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </>
    )
}

export default BuyCredits;