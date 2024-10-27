import { useEffect, useState, useRef } from 'react';
import styles from './Profile.module.scss';
import { useParams, useNavigate } from 'react-router-dom'; 
import { Link } from 'react-router-dom';
import axios from 'axios';
import thumbnailPlaceholder from '../../assets/thumbnailPlaceholder.png';
import { useSelector, useDispatch } from 'react-redux';
import { setLastChatIndex, setFollowShown, setReportShown } from '../Redux/store';

import FollowType from './Followers Following/FollowType';
import Report from '../Report/Report';

const Profile = () => {
    // Redux
    const { localUserId } = useSelector((state) => state.user.user);
    const isFollowShown = useSelector((state) => state.follow.isFollowShown);
    const isReportShown = useSelector((state) => state.report.isReportShown);

    const dispatch = useDispatch();

    // React
    const navigate = useNavigate();
    const { username } = useParams();

    const dropdownRef = useRef(null);

    const [projectsList, updateProjectsList] = useState([]);
    const [userData, updateUserData] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isMutualFollow, setIsMutualFollow] = useState(false);

    const [followType, setFollowType] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:5172/api/user/${username}`);
                updateUserData(response.data);
                updateProjectsList(response.data.projectsCreated);

                if (localUserId) {
                    if (response.data.followers.includes(localUserId) && response.data.following.includes(localUserId)) {
                        setIsFollowing(true);
                        setIsMutualFollow(true);
                    }

                    else if (response.data.followers.includes(localUserId)) {
                        setIsFollowing(true);
                    }
                }
            } 
            
            catch (error) {
                console.error('An error occurred while loading the profile:', error);
            }
        }

        loadProfile();
    }, [isFollowing, localUserId, username, isMutualFollow]);

    const sendPrivateMessage = async () => {
        try {
            const response = await axios.post(`http://localhost:5172/api/message/open`, {
                senderID: localUserId,
                receiverID: userData._id,
            });
    
    
            const { senderChatIndex, receiverChatIndex, message } = response.data;
    
            // Ensure the message and groupChat exist before accessing them
            if (message && message.groupChat && typeof senderChatIndex !== 'undefined' && typeof receiverChatIndex !== 'undefined') {
                // Determine if the current user is the sender or the receiver
                const value = localUserId === message.groupChat[0] ? senderChatIndex : receiverChatIndex;
    
                // Dispatch the action to update lastChatIndex in Redux
                dispatch(setLastChatIndex({ value }));
            }
    
            // Navigate to the messages page
            navigate('/messages/@me');
        } 
        
        catch (error) {
            console.error('An error occurred while sending the message:', error);
        }
    }

    const followUser = async () => {
        try {
            const response = await axios.post(`http://localhost:5172/api/user/follow`, {
                userID: localUserId,
                userToFollowID: userData._id,
            });

            setIsFollowing(true);
        } 
        
        catch (error) {
            console.error('An error occurred while following the user:', error);
        }
    }

    const unfollowUser = async () => {
        try {
            const response = await axios.post(`http://localhost:5172/api/user/unfollow`, {
                userID: localUserId,
                userToUnfollowID: userData._id,
            });

            setIsFollowing(false);
            setIsMutualFollow(false);
        } 
        
        catch (error) {
            console.error('An error occurred while unfollowing the user:', error);
        }
    }

    const openFollowTab = (type) => {
        setFollowType(type);
        dispatch(setFollowShown(true));
    }

    const toggleDropdown = () => {
        if (dropdownRef.current.classList.contains(styles.hidden)) {
            dropdownRef.current.classList.replace(styles.hidden, styles.visible);
        } 
        
        else {
            dropdownRef.current.classList.replace(styles.visible, styles.hidden);
        }
    }

    return (
        <>
        <div className={`${styles.profileContainer} fadeIn`}>
            <div className={styles.profileDetails}>
                <div className={styles.profile}>
                    <div className={styles.profileHeader}>
                        <div className={styles.profileImage}>
                            <img src={userData?.profileColour !== undefined ? `/${userData.profileColour}.png` : '/error.png'}
                                alt={`${username}'s profile picture`}
                                className={styles.image} />
                        </div>
    
                        <div className={styles.profileInfo}>
                            <div>
                                <h1 className={styles.displayName}>
                                    {userData.displayName || username}{' '} 
                                    {userData.isVerified && (
                                        <i className={`fa-solid fa-circle-check ${styles.verifyIcon}`}></i>
                                    )}
                                    {localUserId === userData._id && ( 
                                        <Link to='/settings' className={`link ${styles.edit}`}>
                                            <i className={`fa-solid fa-pen ${styles.icon}`}></i>
                                        </Link>
                                    )}
                                </h1>
                                <p className={styles.username}>@{userData.username || username}</p>
                                <p className={styles.description}>
                                    {userData.description || 'This user does not exist.'}
                                </p>
                            </div>
                        </div>
    
                        {userData._id !== localUserId && localUserId && userData._id && ( // If the user is not viewing their own profile and is logged in
                            <div className={styles.profileActions}>
                                {isFollowing ? ( // If the user is already following the profile
                                    <button onClick={unfollowUser} className={`${styles.button} ${styles.unfollow}`}>Unfollow</button>
                                ) : ( // If the user is not following the profile
                                    <button onClick={followUser} className={`${styles.button} ${styles.follow}`}>Follow</button>
                                )}
                                {isMutualFollow && <button onClick={sendPrivateMessage} className={`${styles.button} ${styles.message}`}>Message</button>}
                                {userData._id !== localUserId && <button onClick={() => dispatch(setReportShown(true))} className={`${styles.button} ${styles.report}`}>Report</button>}
                                <i onClick={toggleDropdown} className={`fa-solid fa-ellipsis-vertical ${styles.icon}`}></i>
                                <div ref={dropdownRef} className={`${styles.dropdown} ${styles.hidden}`}>
                                    <p onClick={() => dispatch(setReportShown(true))} className={styles.option}>Report</p>
                                    {isMutualFollow && <p onClick={sendPrivateMessage} className={styles.option}>Message</p>}

                                    {isFollowing ? (
                                        <p onClick={unfollowUser} className={styles.option}>Unfollow</p>
                                    ) : (
                                        <p onClick={followUser} className={styles.option}>Follow</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
    
                    <div className={styles.profileStats}>
                        <p className={styles.stat}>
                            Projects: {userData.projectsCreated?.length || 0}
                        </p>

                        <p onClick={() => openFollowTab('followers')} className={styles.stat}>
                            Followers: {userData.followers?.length || 0}
                        </p>

                        <p onClick={() => openFollowTab('following')} className={styles.stat}>
                            Following: {userData.following?.length || 0}
                        </p>
                    </div>
                </div>
    
                {userData._id ? (
                    <div className={styles.projects}>
                        <div className={styles.projectsHeader}>
                            <h1 className={styles.projectsHeading}>Projects</h1>
                            {userData.projectsCreated.length > 7 && <button onClick={() => navigate(`/profile/${encodeURIComponent(userData.username)}/projects`)} className={`${styles.button} ${styles.more}`}>More Projects</button>}
                            {userData.projectsCreated.length > 7 && <i onClick={() => navigate(`/profile/${encodeURIComponent(userData.username)}/projects`)} className={`fa-solid fa-list ${styles.icon}`}></i>}
                        </div>
    
                        <div className={styles.projectList}>
                        {projectsList.length > 0 ? projectsList.map((project, index) => (
                            <div key={index} className={styles.project}>
                                <Link to={`/profile/${username}/${project.name}`} className='link'>
                                    <div className={styles.thumbnail}>
                                        <img
                                            src={thumbnailPlaceholder}
                                            alt='Project Thumbnail'
                                            className={styles.image}
                                        />
                                    </div>
                                    <h2 className={styles.title}>{project.name}</h2>
                                </Link>
                            </div>
                        )) : (localUserId === userData._id ? 
                            <p className={styles.error}>You haven't created any projects, <Link to='/publish' className={`link ${styles.interact}`}>make your first one today!</Link></p>
                            : 
                            <p className={styles.error}>This user has not created any projects yet.</p>
                        )}
                        </div>
                    </div>
                ) : (
                    <p className={styles.error}>This user does not exist.</p>
                )}
            </div>
        </div>
        {isFollowShown && <FollowType type={followType} userID={userData._id} />}
        {isReportShown && <Report type='user' username={username} id={userData._id} />}
        </>
    );
    
}

export default Profile;