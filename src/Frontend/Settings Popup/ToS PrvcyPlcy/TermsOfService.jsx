import styles from '../Tabs.module.scss';

const TermsOfService = () => {
    return (
        <div className={styles.tabContainer}>
            <div className={styles.document}>
                <h1 className='componentTitle'>Terms of Service</h1>
                <div className={styles.header}>
                    <h1 className={styles.mainContent}>Terms of Service</h1>
                </div>
                    
                <p className={`${styles.desc} ${styles.lastUpdate}`}>Last Updated: 11/08/2024</p>

                <h1 className={styles.headerRules}>Welcome to Projectarium, (the "Site"). 
                    The Site is operated by LordBugsy ("we," "us," "our"). 
                    These Terms of Service ("Terms") govern your use of the Site and the services provided through the Site (the "Services"). 
                    By accessing or using the Site, you agree to be bound by these Terms. 
                    If you do not agree to these Terms, please do not use the Site.
                </h1>
                
                <div className={styles.rules}>

                    <div>
                        <h1 className={styles.main}>
                            1. Use of the site
                        </h1>
                        <p className={styles.desc}>
                            1.1. The Site allows users to share and sponsor projects, as well as interact with other users. 
                            These activities are for entertainment purposes only.
                        </p>
                        <p className={styles.desc}>
                            1.2. You acknowledge that the credits have no real-world value and cannot be exchanged for real currency, goods, 
                            or services outside the Site, unless specifically allowed within the Site's trading system.
                        </p>
                        <p className={styles.desc}>
                            1.3. You agree not to use the Site for any unlawful purpose or in any way that could damage, disable, overburden, 
                            or impair the Site.
                        </p>
                    </div>

                    <div>
                        <h1 className={styles.main}>
                            2. Virtual Items and Transactions
                        </h1>
                        <p className={styles.desc}>
                            2.1. All transactions involving virtual credits are final. Once you have sponsored a project or gifted credits, 
                            you cannot reverse the transaction.
                        </p>
                        <p className={styles.desc}>
                            2.2. We reserve the right to modify, suspend, or discontinue any feature of the Site, including the availability of your credits, 
                            at any time without notice.
                        </p>
                        <p className={styles.desc}>
                            2.3. We are not responsible for any losses resulting from unauthorized access to your account, credits or projects. 
                            It is your responsibility to ensure the security of your account.
                        </p>
                    </div>

                    <div>
                        <h1 className={styles.main}>
                            3. Prohibited Content
                        </h1>
                        <p className={styles.desc}>
                            You agree not to engage in any of the following prohibited activities:
                        </p>
                        <ul>
                            <li>Using cheats, exploits, automation software, bots, hacks, or any unauthorized third-party software.</li>
                            <li>Engaging in any fraudulent, misleading, or deceptive activities.</li>
                            <li>Attempting to gain unauthorized access to the Site, other user accounts, or other computer systems or networks.</li>
                            <li>Interfering with or disrupting the integrity or performance of the Site or the data contained therein.</li>
                        </ul>
                    </div>

                    <div>
                        <h1 className={styles.main}>
                            4. Intellectual Property
                        </h1>
                        <p className={styles.desc}>
                            4.1. All content, trademarks, service marks, and logos on the Site are the property of Projectarium 
                            or its licensors and are protected by intellectual property laws.
                        </p>
                        <p className={styles.desc}>
                            4.2. You may not use, copy, modify, or distribute any content from the Site without our prior written consent.
                        </p>
                    </div>

                    <div>
                        <h1 className={styles.main}>
                            5. Limitation of Liability
                        </h1>
                        <p className={styles.desc}>
                            5.1. The Site and Services are provided "as is" without warranties of any kind, either express or implied.
                            We do not warrant that the Site will be uninterrupted, error-free, or free of viruses or other harmful components.
                        </p>
                        <p className={styles.desc}>
                            5.2. In no event shall Projectarium, its affiliates, or their respective officers,
                            directors, employees, or agents be liable for any direct, indirect, incidental, special, consequential, or 
                            punitive damages arising out of or related to your use of the Site or Services.
                        </p>
                    </div>

                    <div>
                        <h1 className={styles.main}>
                            6. Indemnification
                        </h1>
                        <p className={styles.desc}>
                            You agree to indemnify and hold harmless Projectarium, its affiliates, and their respective officers, 
                            directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, 
                            including reasonable attorneys' fees, arising out of or in any way connected with your access to or use of the Site 
                            or Services.
                        </p>
                    </div>

                    <div>
                        <h1 className={styles.main}>
                            7. Termination
                        </h1>
                        <p className={styles.desc}>
                            We reserve the right, in our sole discretion, to terminate or suspend your account and access to the Site at any time, 
                            with or without cause, with or without notice.
                        </p>
                    </div>

                    <div>
                        <h1 className={styles.main}>
                            8. Limitation of Liability
                        </h1>
                        <p className={styles.desc}>
                        These Terms shall be governed by and construed in accordance with the laws of France, without regard to its conflict of law principles.
                        </p>
                    </div>

                    <div>
                        <h1 className={styles.main}>
                            9. Changes to the Terms
                        </h1>
                        <p className={styles.desc}>
                            We may update these Terms from time to time. If we make material changes, 
                            we will notify you by email or by posting a notice on the Site prior to the effective date of the changes. 
                            Your continued use of the Site after the effective date of the revised Terms constitutes your acceptance of the changes.
                        </p>
                    </div>

                    <div>
                        <h1 className={styles.main}>
                            10. Contact Us
                        </h1>
                        <p className={styles.desc}>
                            If you have any questions about these Terms, please contact 
                            us at <a target='_blank' className={styles.interact} href='https://github.com/LordBugsy'>@LordBugsy</a> on 
                            GitHub or <a target='_blank' className={styles.interact} href='https://twitter.com/mylordbugsy'>@mylordbugsy</a> on 
                            Twitter.
                        </p>
                    </div>

                    <div className={styles.copyright}>
                        <p>Copyright © {new Date().getFullYear() === 2024 ? 2024 : `2024 - ${new Date().getFullYear()}`} LordBugsy. All Rights Reserved.</p>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default TermsOfService;