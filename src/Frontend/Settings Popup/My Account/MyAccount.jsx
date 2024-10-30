import { useEffect, useState } from 'react';
import styles from '../Tabs.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import Popup from './MyAccountPopup';
import { setSettingsTabShown } from '../../Redux/store';

const MyAccount = () => {
    // Redux
    const { localUsername, localUserId, displayName } = useSelector(state => state.user.user);

    const settingsTabBoolean = useSelector(state => state.settingsTab.isSettingsTabShown);
    const dispatch = useDispatch();

    // React
    const [popupData, setPopupState] = useState('');
    const [changingFor, setChangingFor] = useState('');

    const openPopup = (request) => {
        setChangingFor(request);
        dispatch(setSettingsTabShown(true));
    }

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:5172/api/user/details/${localUserId}`);
                setPopupState(response.data);
            } 
            
            catch (error) {
                console.error('An error occurred while loading the profile:', error);
            }
        }

        loadProfile();
    }, []);


    return (
        <>
            <div className={styles.tabContainer}>
                <h1 className='componentTitle'>My Account</h1>

                <div className={styles.tabActions}>
                    <div className={styles.action}>
                        <p className={styles.tabAction}>Username: <span className={styles.userInformation}>@{localUsername} <i className={`fa-solid fa-circle-exclamation ${styles.info}`}></i></span></p> 
                        <i onClick={() => openPopup("Username")} className={`fa-solid fa-pen ${styles.icon}`}></i>
                    </div>

                    <div className={styles.action}>
                        <p className={styles.tabAction}>Display Name: <span className={styles.userInformation}>{displayName}</span></p>
                        <i onClick={() => openPopup("DisplayName")} className={`fa-solid fa-pen ${styles.icon}`}></i>
                    </div>

                    <div className={styles.action}>
                        <p className={styles.tabAction}>Profile Description <span className={styles.userDescription}></span></p>
                        <i onClick={() => openPopup("Description")} className={`fa-solid fa-pen ${styles.icon}`}></i>
                    </div>

                    <div className={styles.action}>
                        <button onClick={() => openPopup("Password")} className={`${styles.button} ${styles.change}`}>Change Password</button>
                        <button onClick={() => openPopup("Delete")} className={`${styles.button} ${styles.delete}`}>Delete Account</button>
                    </div>
                </div>
            </div>

            {settingsTabBoolean && <Popup changingFor={changingFor} data={popupData} id={localUserId} />}
        </>
    );
}

export default MyAccount;