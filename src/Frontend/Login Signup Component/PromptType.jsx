import styles from './Sign.module.scss';

import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setPromptShown } from '../Redux/store';
import Loading from '../Loading/Loading';
import axios from 'axios';
import { loginUser } from '../Redux/store';

const PromptType = () => {
    // Redux
    const dispatch = useDispatch();

    // React
    const [isLoading, setIsLoading] = useState(false);
    const [promptType, setPromptType] = useState('signup'); // Default is signup
    
    const [isError, setIsError] = useState(false); // If the username is taken
    const [loginError, updateLoginStatus] = useState(false); // If the login is incorrect

    const loginContainer = useRef(null);
    const signupContainer = useRef(null);

    // Signup form refs
    const usernameRef = useRef(null); 
    const displayNameRef = useRef(null);
    const passwordRef = useRef(null);

    // Login form refs
    const loginUsernameRef = useRef(null);
    const loginPasswordRef = useRef(null);

    const closePrompt = (type) => {
        if (type === 'login') {
            if (loginContainer.current.classList.contains(styles.fadeIn)) loginContainer.current.classList.replace(styles.fadeIn, styles.fadeOut);
            else loginContainer.current.classList.add(styles.fadeOut);
        }

        else {
            if (signupContainer.current.classList.contains(styles.fadeIn)) signupContainer.current.classList.replace(styles.fadeIn, styles.fadeOut);
            else signupContainer.current.classList.add(styles.fadeOut);
        }

        setTimeout(() => {
            dispatch(setPromptShown(false));
        }, 500);
    }

    const submitForm = async (event, type) => {
        event.preventDefault();
        setIsLoading(true);
        setIsError(false);
        updateLoginStatus(false);
        
        if (type === 'signup') {
            try {
                const response = await axios.post('http://localhost:5172/api/signup', {
                    username: usernameRef.current.value,
                    displayName: displayNameRef.current.value,
                    password: passwordRef.current.value
                });

                dispatch(loginUser({
                    localUserId: response.data._id,
                    localUsername: response.data.username,
                    displayName: response.data.displayName,
                    profileColour: response.data.profileColour,
                    role: response.data.role,
                    credits: response.data.credits
                }));
                
                closePrompt('signup');                
            }

            catch (error) {
                if (error.response) {
                    // the username is already taken
                    console.error('Username is already taken.');
                    setIsError(true);
                } 
                
                else {
                    console.error('Unknown error occurred:', error.message);
                }
            }

            finally {
                setIsLoading(false);
            }
        }

        else {
            try {
                const response = await axios.post('http://localhost:5172/api/login', {
                    username: loginUsernameRef.current.value,
                    password: loginPasswordRef.current.value
                });

                dispatch(loginUser({
                    localUserId: response.data._id,
                    localUsername: response.data.username,
                    displayName: response.data.displayName,
                    profileColour: response.data.profileColour,
                    role: response.data.role,
                    credits: response.data.credits
                }));

                closePrompt('login');
            }

            catch (error) {
                updateLoginStatus(true);
                console.error("Incorrect login details.");
            }

            finally {
                setIsLoading(false);
                setIsError(false);
            }
        }
    }

    return (
        <>
        {promptType === 'signup' && (
            <div ref={signupContainer} className={styles.signupContainer}>
                <h1 className='logo'>Projectarium</h1>
                <div className={styles.signupContent}>
                    <h1 className={styles.heading}>Sign Up</h1>
                    <form method='post' className={styles.formContent} onSubmit={(event) => submitForm(event, 'signup')}>
                        <div className={styles.inputGroup}>
                            <i className={`fa-solid fa-user ${styles.icon}`}></i>
                            <input ref={usernameRef} autoComplete='true' spellCheck='false' maxLength='18' id='username' name='username' type="text" placeholder="Enter your username.." className={styles.input} />
                        </div>
                        {isError && <p className={styles.error}>Username is already taken</p>}

                        <div className={styles.inputGroup}>
                            <i className={`fa-solid fa-user-group ${styles.icon}`}></i>
                            <input ref={displayNameRef} autoComplete='true' spellCheck='false' maxLength='18' id='displayName' name='displayName' type="text" placeholder="Enter your display name.." className={styles.input} />
                        </div>

                        <div className={styles.inputGroup}>
                            <i className={`fa-solid fa-key ${styles.icon}`}></i>
                            <input ref={passwordRef} name='password' type="password" placeholder="Enter your password.." className={styles.input} />
                        </div>

                        <button type='submit' className={`${styles.button} ${styles.signupButton}`}>Signup</button>
                    </form>

                    {isLoading && <Loading />}

                    <div onClick={() => setPromptType('login')} className={styles.redirectContainer}>
                        <p className={styles.redirect}>Already have an account?</p>
                    </div>

                </div>
            </div>
        )}

        {promptType === 'login' && (
            <div ref={loginContainer} className={styles.loginContainer}>
                <h1 className='logo'>Projectarium</h1>
                <div className={styles.loginContent}>
                    <h1 className={styles.heading}>Login</h1>
                    <form method='post' className={styles.formContent} onSubmit={(event) => submitForm(event, 'login')}>
                        <div className={styles.inputGroup}>
                            <i className={`fa-solid fa-user ${styles.icon}`}></i>
                            <input ref={loginUsernameRef} autoComplete='true' spellCheck='false' id='username' maxLength='18' name='username' type="text" placeholder="Enter your username.." className={styles.input} />
                        </div>

                        <div className={styles.inputGroup}>
                            <i className={`fa-solid fa-key ${styles.icon}`}></i>
                            <input ref={loginPasswordRef} name='password' type="password" placeholder="Enter your password.." className={styles.input} />
                        </div>
                        {loginError && <p className={styles.error}>Wrong username or password.</p>}

                        <button type='submit' className={`${styles.button} ${styles.loginButton}`}>Login</button>
                    </form>

                    {isLoading && <Loading />}

                    <div onClick={() => setPromptType('signup')} className={styles.redirectContainer}>
                        <p className={styles.redirect}>Don't have an account?</p>
                    </div>

                </div>
            </div>
        )}
        </>
    )

}

export default PromptType;