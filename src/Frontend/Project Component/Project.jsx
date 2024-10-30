import styles from './Project.module.scss';
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectThumbnail from '../../assets/thumbnailPlaceholder.png';
import { Link } from 'react-router-dom';
import Commments from './Comment/Comments'
import { useDispatch, useSelector } from 'react-redux';
import { setCommentShown, loginUser, setReportShown, setSponsorShown } from '../Redux/store';
import axios from 'axios';
import Report from '../Report/Report';
import Sponsor from './Sponsor/Sponsor';

const Project = () => {
    // Redux
    const dispatch = useDispatch();
    const isCommentShown = useSelector((state) => state.comment.isCommentShown);
    const isReportShown = useSelector((state) => state.report.isReportShown);
    const isSponsorShown = useSelector((state) => state.sponsor.isSponsorShown);
    const { localUsername, localUserId, role } = useSelector((state) => state.user.user);

    // React
    const navigate = useNavigate();

    const heartButton = useRef(null);
    const heartIcon = useRef(null);

    const username = useParams().username; 
    const { project } = useParams(); 

    const [selectedProject, setSelectedProject] = useState(project);
    const [likeStatus, updateLikeStatus] = useState(false);
    const [recommendedProjects, updateRecommendedProjects] = useState([]);
    const [isSponsored, setIsSponsored] = useState(false);

    useEffect(() => {
        if (isCommentShown) dispatch(setCommentShown(false));
    }, []);

    useEffect(() => {
        const loadProjectDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5172/api/project/${username}/${project}`);
                setSelectedProject(response.data);
            } 
            
            catch (error) {
                if (error.response) {
                    console.error('Server responded with an error:', error.response.data);
                } 
                
                else if (error.request) {
                    console.error('No response received:', error.request);
                } 
                
                else {
                    console.error('An error occurred while setting up the request:', error.message);
                }
            }
        };

        const loadRecommendedProjects = async () => {
            try {
                const response = await axios.get(`http://localhost:5172/api/project/random`);
                updateRecommendedProjects(response.data);
            }

            catch (error) {
                if (error.response) {
                    console.error('Server responded with an error:', error.response.data);
                }

                else if (error.request) {
                    console.error('No response received:', error.request);
                }

                else {
                    console.error('An error occurred while setting up the request:', error.message);
                }
            }
        }
    
        loadProjectDetails();
        loadRecommendedProjects();
    }, [username, project]); // added username and project as dependencies to avoid stale values

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [selectedProject]);

    useEffect(() => {
        const checkIfLiked = () => {
            if (localUserId === "" || !selectedProject._id) return;

            if (selectedProject.likes.includes(localUserId)) {
                toggleHeart(true);
            }

            else toggleHeart(false);
        }

        checkIfLiked();
    }, [username, project, selectedProject]);

    const openComments = () => {
        dispatch(setCommentShown(true));
    }

    const deleteProject = async () => {
        try {
            const response = await axios.post(`http://localhost:5172/api/project/delete`, {
                projectID: selectedProject._id,
                userID: localUserId
            });

            navigate(`/profile/${encodeURIComponent(localUsername)}`);
        }

        catch (error) {
            if (error.response) {
                console.error('Server responded with an error:', error.response.data);
            }

            else if (error.request) {
                console.error('No response received:', error.request);
            }

            else {
                console.error('An error occurred while setting up the request:', error.message);
            }
        }
    }

    const handleSponsorDecision = (decision) => {
        if (decision) {
            
            setTimeout(() => {
                setIsSponsored(true); 
                dispatch(setSponsorShown(false));
            }, 500); 
        } 
        
        else dispatch(setSponsorShown(false));
    };

    const likeProject = async () => {
        try {
            const response = await axios.post(`http://localhost:5172/api/project/like`, {
                projectID: selectedProject._id,
                userID: localUserId
            });

            setSelectedProject(prev => ({ ...prev, likes: [...prev.likes, localUserId] })); // Ensures state update
            toggleHeart(true);
        } 
        
        catch (error) {
            handleRequestError(error);
        }
    };
    
    const dislikeProject = async () => {
        try {
            const response = await axios.post(`http://localhost:5172/api/project/unlike`, {
                projectID: selectedProject._id,
                userID: localUserId
            });
            
            setSelectedProject(prev => ({ ...prev, likes: prev.likes.filter(id => id !== localUserId) })); // Ensures state update
            toggleHeart(false);
        } 
        
        catch (error) {
            handleRequestError(error);
        }
    };

    const handleRequestError = (error) => {
        if (error.response) {
            console.error('Server responded with an error:', error.response.data);
        } 
        
        else if (error.request) {
            console.error('No response received:', error.request);
        } 
        
        else {
            console.error('An error occurred while setting up the request:', error.message);
        }
    };
    

    const toggleHeart = (isLiked) => {
        updateLikeStatus(isLiked);
    };

    return (
        <div className={`${styles.projectContainer} fadeIn`}>
            <div className={styles.projectContent}>

                <div className={styles.selectedProject}>
                    <div className={styles.projectThumbnail}>
                        <Link className='link' to={selectedProject.link} target='_blank'>
                            <img src={projectThumbnail} alt="Project Thumbnail" />
                        </Link>
                    </div>

                    <div className={styles.projectDetails}>
                        <h1 className={styles.projectTitle}>{selectedProject.name || 'Unknown Project'}</h1>
                        <p className={styles.projectDescription}>
                            {selectedProject.description || `Unless you have a time machine, @${username} has never made a project called ${project}.`}
                        </p>

                        <div className={styles.projectAuthor}>
                            <p className={styles.author}>Made by <Link className={`link ${styles.bold}`} to={`/profile/${username}`}>@{username}</Link>
                                {selectedProject.owner === localUserId && <span className={styles.owner}> (You)</span>}
                                {selectedProject.owner && selectedProject.owner.isVerified && <i className={`fa-solid fa-check-circle ${styles.icon}`}></i>}
                                </p>
                            <p className={styles.date}>Created on {new Date(selectedProject.createdAt).toLocaleDateString() || 'Never created'}</p>
                        </div>

                        {selectedProject.description && <div className={styles.projectActions}>
                            <Link to={selectedProject.link} target='_blank' className='link'>
                                <button className={styles.button}><i className={`fa-solid fa-code ${styles.icon}`}></i></button>
                            </Link>
                            {localUsername && <button onClick={openComments} className={styles.button}><i className={`fa-regular fa-comment ${styles.icon}`}></i></button>}

                            {localUserId !== selectedProject.owner._id && localUserId &&
                            (<button onClick={likeStatus ? dislikeProject : likeProject} ref={heartButton} className={styles.button}>
                                <i ref={heartIcon} className={`${likeStatus ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} ${styles.icon}`}></i>
                            </button>)}
                            {!isSponsored && (localUserId === selectedProject.owner._id && selectedProject.status === "public") && <button onClick={() => dispatch(setSponsorShown(true))} className={styles.button}><i className={`fa-solid fa-money-bill-wave ${styles.icon}`}></i></button>}
                            {(localUserId === selectedProject.owner._id || role === "admin")  && <button onClick={deleteProject} className={styles.button}><i className={`fa-solid fa-trash ${styles.icon}`}></i></button>}
                            {localUserId !== selectedProject.owner._id && <button onClick={() => dispatch(setReportShown(true))} className={styles.button}><i className={`fa-solid fa-exclamation-triangle ${styles.icon}`}></i></button>}
                        </div>}
                        
                    </div>
                </div>

                <div className={styles.recommendedProjects}>
                    <h1 className={styles.containerTitle}>More Projects by the community!</h1>
                    <div className={styles.projectsContainer}>
                        {recommendedProjects.map((project, index) => (
                            <div className={styles.project} key={index}>
                                <Link to={`/profile/${project.owner.username}/${project.name}`} className='link'>
                                    <div className={styles.projectThumbnail}>
                                        <img src={projectThumbnail} alt="Project Thumbnail" />
                                    </div>

                                    <p className={styles.projectName}>{project.name}</p>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {isCommentShown && <Commments project={selectedProject} />}
            {isReportShown && <Report type='project' id={selectedProject._id} projectName={selectedProject.name} />}
            {isSponsorShown && <Sponsor projectID={selectedProject._id} onDecision={handleSponsorDecision} projectName={selectedProject.name} />}
        </div>
    )
}

export default Project;