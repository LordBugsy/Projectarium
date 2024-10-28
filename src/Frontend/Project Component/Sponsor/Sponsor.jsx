import styles from './Sponsor.module.scss';

import { useDispatch, useSelector } from 'react-redux';
import { setSponsorShown, updateCredits } from '../../Redux/store';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Sponsor = props => {
    // Redux
    const dispatch = useDispatch();
    const isSponsorShown = useSelector(state => state.sponsor.isSponsorShown);
    const { localUserId, credits } = useSelector(state => state.user.user);

    // React
    const containerRef = useRef(null);
    const navigate = useNavigate();

    const closeSponsor = () => {
        if (containerRef.current) {
            containerRef.current.classList.replace('fadeIn', 'fadeOut');
        }
        
        setTimeout(() => {
            props.onDecision(false);
            dispatch(setSponsorShown(false));
        }, 340);
    };

    const submitSponsor = async () => {
        if (props.projectID === '' || localUserId === '') {
            closeSponsor();
            return;
        }

        try {
            const backendResponse = await axios.post(`http://localhost:5172/api/project/sponsor`, {
                projectID: props.projectID,
                userID: localUserId,
            });

            props.onDecision(true);
            
            if (containerRef.current) {
                containerRef.current.classList.replace('fadeIn', 'fadeOut');
                setTimeout(() => dispatch(setSponsorShown(false)), 340);
            }

            // Update user credits
            dispatch(updateCredits({ credits: credits - 1200 }));
            
        }
    
        catch (error) {
            console.error(error);
        }
    }

    const goToStore = () => {
        closeSponsor();
        navigate('/buycredits');
    }

    useEffect(() => {
        const handleClickOutside = event => {
            if (isSponsorShown && containerRef.current && event.target === containerRef.current) closeSponsor();
        }

        document.addEventListener('click', handleClickOutside);

        return () => document.removeEventListener('click', handleClickOutside);
    }, []);
    

    return (
        <>
        {isSponsorShown && (
            <div ref={containerRef} className={`${styles.sponsorContainer} fadeIn`}>
                <div className={styles.sponsor}>
                    <i className={`fas fa-times ${styles.close}`} onClick={closeSponsor}></i>
                    <h1>Sponsor {props.projectName}</h1>
                    <p className={styles.info}>Would you like to spend 1200 credits to sponsor {props.projectName}?</p>
                    {credits >= 1200 ? (
                        <>
                            <p className={styles.info}>You will have <span className={styles.bold}>{credits -1200} credits</span> after this transaction.</p> 
                            <div className={styles.actions}>
                                <button className={`${styles.button} ${styles.sponsorButton}`} onClick={submitSponsor}>Sponsor</button>
                                <button className={`${styles.button} ${styles.cancel}`} onClick={closeSponsor}>Cancel</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className={styles.error}>You do not have enough credits to sponsor this project.</p>
                            <div className={styles.actions}>
                                <button className={`${styles.button} ${styles.cancel}`} onClick={closeSponsor}>Close</button>
                                <button className={`${styles.button} ${styles.buy}`} onClick={goToStore}>Buy Credit</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}
        </>
    );
}

export default Sponsor;