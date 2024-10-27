import { useEffect, useRef, useState } from 'react';
import styles from './FollowType.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { setFollowShown } from '../../Redux/store';
import Loading from '../../Loading/Loading';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FollowType = (props) => {
    // Redux
    const dispatch = useDispatch();
    const isFollowShown = useSelector((state) => state.follow.isFollowShown);

    // React
    const [loading, setLoading] = useState(false);
    const [returnData, setReturnData] = useState([]); // Datas depending on the type of follow (followers or following)
    const [error, setError] = useState(false);

    const containerRef = useRef(null);
    const navigate = useNavigate();

    const closeFollowTab = () => {
        // close the contact form
        if (containerRef.current) containerRef.current.classList.replace("fadeIn", "fadeOut");
        setTimeout(() => dispatch(setFollowShown(false)), 300);
    }

    const redirectProfile = (username) => {
        closeFollowTab();
        navigate(`/profile/${encodeURIComponent(username)}`);
    }

    useEffect(() => {
        const fetchFollowData = async () => {
            if (!props.userID) {
                setLoading(true);
                setError(true);
                return;
            }

            else if (props.type !== "followers" && props.type !== "following") { 
                setError(true);
                return;
            }

            try {
                const response = await axios.get(`http://localhost:5172/api/user/${props.type}/${props.userID}`);
                setReturnData(response.data);
                setLoading(false);
            } 
            
            catch (error) {
                console.error(error);
                setError(true);
            }

            finally {
                setLoading(false);
            }
        }

        fetchFollowData();
    }, []);

    useEffect(() => {
        const clickOutside = event => {
            if (containerRef.current && event.target === containerRef.current) closeFollowTab();
        }

        document.addEventListener('mousedown', clickOutside);

        return () => document.removeEventListener('mousedown', clickOutside);
    }, []);

    return (
        <>
            {isFollowShown && (<div ref={containerRef} className={`${styles.followContainer} fadeIn`}>
                <div className={styles.follow}>
                    {!error && <h2 className={styles.information}>{props.type === "followers" ? "Followed by:" : "Following:"}</h2>}
                    <i className={`ri-close-line ${styles.close}`} onClick={closeFollowTab}></i>
                    {loading && <Loading />}
                    {!loading && error && <p className={`${styles.error} ${styles.fadeIn}`}>An error occurred while fetching the data, please try again later.</p>}
                    <div className={styles.fetchedDataContainer}>
                        {!loading && !error && 
                            (returnData.map((data, index) => 
                                <div onClick={() => redirectProfile(`${data.username}`)} key={index} className={styles.followData}>
                                    <img src={data.profileColour !== undefined ? `/${data.profileColour}.png` : '/error.png'} alt="Profile" className={styles.profilePicture} />
                                    <div className={styles.usernameContent}>
                                        <p className={styles.displayName}>{data.displayName} {data.isVerified && <i className={`ri-check-line ${styles.verified}`}></i>}</p>
                                        <p className={styles.username}>
                                            (@{data.username})
                                        
                                        </p> 
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>)}
        </>
    )
}

export default FollowType;