import styles from './MyAccountPopup.module.scss';
import { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSettingsTabShown, loginUser } from '../../Redux/store';
import axios from 'axios';

const Popup = (props) => {
    // Redux
    const { localUsername, localUserId, credits } = useSelector(state => state.user.user);
    const settingsTabBoolean = useSelector(state => state.settingsTab.isSettingsTabShown);
    const dispatch = useDispatch();

    // React
    // I had to use an array to store the response data because the state was being updated too quickly and the data couldn't be accessed
    const data = []; 
    const [isError, setIsError] = useState(false);

    const containerRef = useRef(null);
    const inputRef = useRef(null);

    const currentPassword = useRef(null);
    const newPassword = useRef(null);

    const closePopup = () => {
        if (containerRef.current) {
            containerRef.current.classList.replace('fadeIn', 'fadeOut');

            setTimeout(() => {
                dispatch(setSettingsTabShown(false));
            }, 500);
        }
    }

    useEffect(() => {
        const handleInput = () => {
            if (inputRef.current) {
                inputRef.current.style.height = 'auto';
                inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 335)}px`;
            }
        };

        const textArea = inputRef.current;
        if (textArea) {
            textArea.addEventListener('input', handleInput);
        }

        return () => {
            if (textArea) {
                textArea.removeEventListener('input', handleInput);
            }
        };
    }, []);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && event.target === containerRef.current) closePopup();
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, []);

    const saveChanges = async (target) => {
        setIsError(false);
        target = target.toLowerCase();

        if (target === "username" && inputRef.current.value === localUsername) {
            closePopup();
            return;
        }

        else if (target === "username" && inputRef.current.value.length < 3) {
            closePopup();
            return;
        }

        else if (inputRef.current.value.length < 3) {
            closePopup();
            return;
        }
        
        try {
            const backendResponse = await axios.post(`http://localhost:5172/api/user/edit/${target}`, {
                userID: localUserId,
                newValue: inputRef.current.value
            });

            data.push(backendResponse.data);
            if (data[0].error) {
                console.error(data[0].error);
                setIsError(true);
            }
        }

        catch (error) {
            console.error('An error occurred while saving the changes:', error);
            setIsError(true);
        }

        finally {
            if (isError) {
                return;
            }

            switch (props.changingFor) {
                case "Username":
                    if (data[0].username && data[0].credits >= 100) {
                        dispatch(loginUser({
                            localUserId: localUserId,
                            localUsername: data[0].username,
                            displayName: data[0].displayName,
                            profileColour: data[0].profileColour,
                            role: data[0].role,
                            credits: data[0].credits
                        }));
                    }

                    break;

                case "DisplayName":
                    dispatch(loginUser({
                        localUserId: localUserId,
                        localUsername: localUsername,
                        displayName: data[0].displayName,
                        profileColour: data[0].profileColour,
                        role: data[0].role,
                        credits: data[0].credits
                    }));
                    break;
            }

            if (data[0].username) { // If the username was changed
                closePopup();
            }
        }
    }

    const DeleteAccount = async () => {
        try {
            const backendResponse = await axios.post(`http://localhost:5172/api/user/delete`, {
                userID: localUserId
            });

            data.push(backendResponse.data);

            if (data[0].error) {
                console.error(data[0].error);
                setIsError(true);
            }
        }

        catch (error) {
            console.error('An error occurred while deleting the account:', error);
            setIsError(true);
        }

        finally {
            if (isError) {
                return;
            }

            if (data[0].message) {
                dispatch(loginUser({
                    localUserId: '',
                    localUsername: '',
                    displayName: '',
                    profileColour: '',
                    role: '',
                    credits: ''
                }));

                closePopup();
            }
        }
    }

    const saveNewPassword = async () => {
        setIsError(false);
        if (!currentPassword.current.value || !newPassword.current.value) {
            return;
        }

        try {
            const backendResponse = await axios.post('http://localhost:5172/api/user/edit/password', {
                userID: localUserId,
                currentPassword: currentPassword.current.value,
                newPassword: newPassword.current.value
            });

            if (backendResponse.data.error) {
                setIsError(true);
            }

            else {
                closePopup();
            }
        }

        catch (error) {
            console.error('An error occurred while saving the new password:', error);
            setIsError(true);
        }
    }

    return (
        <>
            { settingsTabBoolean && 
                <div ref={containerRef} className={`${styles.popupContainer} fadeIn`}>
                    <div className={styles.popup}>
                        {props.changingFor != "Delete" && props.changingFor != "Password" && (
                            <>
                                <i onClick={closePopup} className={`fa-solid fa-times ${styles.close}`}></i>
                                <h1 className='componentTitle'>Changing {props.changingFor}</h1>
    
                                <div className={styles.inputContainer}>
                                    <p className={styles.label}> New {props.changingFor} for <span className={styles.username}>{localUsername}</span>:</p>
                                    {props.changingFor !== "Description" && (
                                        <input 
                                            ref={inputRef} 
                                            name='input' 
                                            type='text' 
                                            maxLength='18' 
                                            className={`${styles.input}`} 
                                            placeholder={`Enter your new ${props.changingFor}`} 
                                        />
                                    )}
                                    {props.changingFor === "Description" && (
                                        <textarea 
                                            ref={inputRef} 
                                            name='textArea' 
                                            maxLength='360' 
                                            className={`${styles.textArea}`} 
                                            placeholder={`Enter your new ${props.changingFor}`}
                                        ></textarea>
                                    )}
                                </div>
    
                                <button 
                                    onClick={() => saveChanges(props.changingFor)} 
                                    disabled={props.changingFor === "Username" && props.data.credits < 100} 
                                    className={`${styles.button} ${props.changingFor === "Username" && props.data.credits < 100 ? styles.disabled : styles.save}`}
                                >
                                    {props.changingFor === "Username" ? (
                                        props.data.credits >= 100 ? (
                                            <>
                                                Save <i className={`fa-solid fa-coins ${styles.icon}`}></i>
                                            </>
                                        ) : (
                                            <>
                                                Not enough credits <i className={`fa-solid fa-coins ${styles.icon}`}></i>
                                            </>
                                        )
                                    ) : (
                                        "Save"
                                    )}
                                </button>
                                {isError && <p className={styles.error}>Username is already taken.</p>}
                            </>
                        )}

                        {props.changingFor === "Delete" && (
                            <>
                                <i onClick={closePopup} className={`fa-solid fa-times ${styles.close}`}></i>
                                <h1 className='componentTitle'>Delete Account</h1>
                                <p className={styles.warning}>Are you sure you want to delete your account? This action cannot be undone.</p>
                                <div className={styles.controls}>
                                    <button onClick={closePopup} className={`${styles.button} ${styles.cancel}`}>Cancel</button>
                                    <button onClick={DeleteAccount} className={`${styles.button} ${styles.delete}`}>Delete</button>
                                </div>
                            </>
                        )}

                        {props.changingFor === "Password" && (
                            <>
                                <i onClick={closePopup} className={`fa-solid fa-times ${styles.close}`}></i>
                                <h1 className='componentTitle'>Change Password</h1>
                                <div className={styles.inputContainer}>
                                    <p className={styles.label}>Current Password:</p>
                                    <input ref={currentPassword} name='currentPassword' type='password' className={`${styles.input}`} placeholder='Enter your current password' />
                                </div>
                                <div className={styles.inputContainer}>
                                    <p className={styles.label}>New Password:</p>
                                    <input ref={newPassword} name='newPassword' type='password' className={`${styles.input}`} placeholder='Enter your new password' />
                                </div>

                                <p className={styles.warning}>An administrator will never ask to change your password. Keep your account safe and never share your password.</p>
                                <div className={styles.controls}>
                                    <button onClick={closePopup} className={`${styles.button} ${styles.delete}`}>Cancel</button>
                                    <button onClick={saveNewPassword} className={`${styles.button} ${styles.save}`}>Save</button>
                                </div>
                                {isError && <p className={styles.error}>The current password is incorrect.</p>}
                            </>
                        )}
                    </div>
                </div>
            }
        </>
    );
};

export default Popup;
