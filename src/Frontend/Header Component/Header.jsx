import styles from './Header.module.scss';
import { Link } from 'react-router-dom';
import React, {useEffect, useRef} from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { setContactShown } from '../Redux/store';
import { setSearchShown, logoutUser, setPromptShown } from '../Redux/store';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    // Get the user data from the Redux store
    const dispatch = useDispatch();

    const userData = useSelector((state) => state.user.user);
    const { localUserId, localUsername, profileColour, role, credits } = userData; // Extract the specific fields

    const navigate = useNavigate();

    const hiddenNavBar = useRef(null);
    const searchRef = useRef(null);
    const headerComponent = useRef(null);
    const closeIcon = useRef(null);


    const toggleNavBar = () => {
        // slideOut is the default class for the hiddenNavBar (it's hidden)

        if (hiddenNavBar.current.classList.contains(styles.slideOut)) {
            hiddenNavBar.current.classList.replace(styles.slideOut, styles.slideIn);
        }

        else {
            hiddenNavBar.current.classList.replace(styles.slideIn, styles.slideOut);
        }
    }

    useEffect(() => {
        const handleClickOutside = event => {
            // We are checking if the hiddenNavBar is open and if the click is outside of the hiddenNavBar
            if ( hiddenNavBar.current && hiddenNavBar.current.classList.contains(styles.slideIn) && !hiddenNavBar.current.contains(event.target) && event.target !== closeIcon.current) {
                toggleNavBar();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, []);

    const logOut = () => {
        dispatch(logoutUser());
        dispatch(setPromptShown(true));
        navigate('/');
    }

    const redirect = (path) => {
        navigate(path);
        toggleNavBar();
    }

    return (
        <>
            <div ref={headerComponent} className={styles.header}>
                <nav className={styles.nav}>
                    <div className={styles.left}>
                        { localUserId !== "" && (
                            <i ref={closeIcon} onClick={toggleNavBar} className={`ri-menu-line ${styles.icon}`}></i> 
                        )}
                        <Link className='link' to='/'>
                            <h1 className="logo"><i className={`fa-solid fa-code ${styles.icon}`}></i> Projectarium</h1>
                        </Link>
                    </div>
                    

                    <div onClick={() => dispatch(setSearchShown(true))} className={styles.searchBox}>
                        <input readOnly ref={searchRef} name='searchRef' spellCheck='false' type="text" placeholder="Search for projects..." />
                        <button className={`${styles.button} ${styles.search}`}><i className={`fa-solid fa-search ${styles.icon}`}></i></button>
                    </div>

                    <div className={styles.navLinks}>
                        <Link className='link' to='/publish'>
                            <p className={styles.redirect}><i className={`fa-solid fa-code-branch ${styles.icon}`}></i></p>
                        </Link>

                        <Link className='link' to='/buycredits'>
                            <p className={styles.redirect}><i className={`fa-solid fa-money-bill-wave ${styles.icon}`}></i> {credits}</p>
                        </Link>

                        <Link className='link' to='/messages/@me'>
                            <p className={styles.redirect}><i className={`fa-solid fa-message ${styles.icon}`}></i></p>
                        </Link>

                        <Link className='link' to='/settings'>
                            <p className={styles.redirect}><i className={`fa-solid fa-gear ${styles.icon}`}></i></p>
                        </Link>                 
                    </div>
                </nav>
            </div>

            {localUserId !== "" && (
                <div ref={hiddenNavBar} className={`${styles.hiddenNavBar} ${styles.slideOut}`}>
                    <div className={styles.profileInfo}>
                        <div className={styles.profileImage}>
                            <div className={styles.overlay}>
                                <i className={`fa-solid fa-pen ${styles.icon}`}></i>
                            </div>
                            <img src={`/${profileColour}.png`} alt="Profile" />
                        </div>

                        <div className={styles.profileDetails}>
                            <h2 className={styles.profileName}>{localUsername}</h2>
                        </div>
                    </div>

                    <div className={styles.navLinks}>
                        <p className={styles.redirect}>
                            <Link className='link' to={`/profile/${localUsername}`}>
                                My Profile
                            </Link>
                        </p>

                        <p className={styles.redirect}>
                            <Link className='link' to='/settings'>
                                Settings
                            </Link>
                        </p>

                        <p className={styles.redirect}>
                            <Link className='link' to='/' onClick={() => dispatch(setContactShown(true))}>
                                Contact Us
                            </Link>
                        </p>

                        { role === "admin" && (
                            <p className={styles.redirect}> {/* This button redirects to the admin panel, you can implement it yourself! */}
                                <Link className='link' to='/admin'>
                                    Admin Panel
                                </Link>
                            </p>
                        )}

                        <p onClick={logOut} className={styles.redirect}>
                            <Link className='link' to='/'>
                                Logout
                            </Link>
                        </p>
                    </div>

                    <div className={styles.legalCompliance}>
                        <Link className='link' to='/settings'>
                            <p className={styles.redirect}>Terms of Service</p>
                        </Link>

                        <Link className='link' to='/settings'>
                            <p className={styles.redirect}>Privacy Policy</p>
                        </Link>
                    </div>
                </div>
            )}


            <div className={styles.mobileFooter}>
                <Link className={`${styles.footerLink} link`} to='/publish' >
                    <i className={`fa-solid fa-code-branch ${styles.icon}`}></i>
                    <p className={styles.linkLabel}>Publish Repository</p>
                </Link>

                <Link onClick={() => dispatch(setSearchShown(true))} className={`${styles.footerLink} link`}>
                    <i className={`fa-solid fa-magnifying-glass ${styles.icon}`}></i>
                    <p className={styles.linkLabel}>Search</p>
                </Link>

                <Link className={`${styles.footerLink} link`} to='/messages/@me'>
                    <i className={`fa-solid fa-message ${styles.icon}`}></i>
                    <p className={styles.linkLabel}>My Messages</p>
                </Link>
            </div>
        </>
    )
}

export default Header;