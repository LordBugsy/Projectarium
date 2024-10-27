import MyAccount from './My Account/MyAccount';
import TermsOfService from './ToS PrvcyPlcy/TermsOfService';
import PrivacyPolicy from './ToS PrvcyPlcy/PrivacyPolicy';

import styles from './Settings.module.scss';
import { useState } from 'react';

const Settings = () => {
    // React
    const [settingsTab, setSettingsTab] = useState('My Account'); // The tabs will be 'My Account', 'Delete Account' and 'Terms of Service' for now
    // if you want to add more tabs, it's up to you! :) This project is only a prototype, so feel free to experiment with it!

    const [areTabsVisible, setTabsVisibility] = useState(false); // Show the settings tabs (mobile only)

    const loadTab = (tab) => {
        setSettingsTab(tab);
        setTabsVisibility(false);
    }

    return (
        <div className={`${styles.messagesContainer} fadeIn`}>
            <div className={`${styles.messageRecipient} ${areTabsVisible ? styles.shown : styles.hidden}`}>
                <div className={styles.messageHeader}>
                    <p onClick={() => loadTab("My Account")} className={`${styles.settingsTab} ${settingsTab === "My Account" ? styles.selected : ''}`}>My Account</p>
                    <p onClick={() => loadTab("Terms of Service")} className={`${styles.settingsTab} ${settingsTab === "Terms of Service" ? styles.selected : ''}`}>Terms of Service</p>
                    <p onClick={() => loadTab("Privacy Policy")} className={`${styles.settingsTab} ${settingsTab === "Privacy Policy" ? styles.selected : ''}`}>Privacy Policy</p>
                </div>
            </div>

            <div className={styles.rightSide}>
                <i onClick={() => setTabsVisibility(!areTabsVisible)} className={`fa-solid fa-arrow-left ${styles.icon}`}></i>

                {settingsTab === "My Account" && <MyAccount />}
                {settingsTab === "Terms of Service"  && <TermsOfService />}
                {settingsTab === "Privacy Policy" && <PrivacyPolicy />}

            </div>
        </div>
    );
}

export default Settings;