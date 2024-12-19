import styles from '../Tabs.module.scss';

const PrivacyPolicy = () => {
    return (
        <div className={styles.tabContainer}>
            <div className={styles.document}>
                <h1 className='componentTitle'>Privacy Policy</h1>
                <p className={`${styles.desc} ${styles.lastUpdate}`}>Last Updated: 11/08/2024</p>
                <h1 className={styles.headerRules}>
                    Welcome to Projectarium (the "Site"). This Privacy Policy explains how Projectarium ("we," "us," "our") handles your information when 
                    you visit our Site. The Site is a demonstration project designed to showcase how a website like this might work. <br />
                    <span className={styles.important}>Please note that we do not collect, store, or share any personal information from visitors to this Site.</span>
                </h1>

                <div className={styles.rules}>
                    <div>
                        <h1 className={styles.main}>
                            1. Informations we do not collect
                        </h1>
                        <ul>
                            <li><span className={styles.bold}>Personal Information</span>: We do not collect any personal information such as your name, email address, or payment details.</li>
                            <li><span className={styles.bold}>Usage Data</span>: We do not collect any data on how the Site is accessed or used.</li>
                            <li><span className={styles.bold}>Cookies and Tracking Technologies</span>: We do not use cookies or any other tracking technologies.</li>
                        </ul>
                    </div>

                    <div>
                        <h1 className={styles.main}>
                            2. Links to Other Websites
                        </h1>
                        <p className={styles.desc}>
                        Our Site may contain links to other websites that are not operated by us. If you click on a third-party link, 
                        you will be directed to that third party's site.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default PrivacyPolicy;
