import styles from './Projectarium.module.scss';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setPromptShown } from '../Redux/store';
import PromptType from '../Login Signup Component/PromptType';
import { Link } from 'react-router-dom';
import thumbnailPlaceholder from '../../assets/thumbnailPlaceholder.png';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Projectarium = () => {
    // Redux
    const dispatch = useDispatch();

    const user = useSelector((state) => state.user);
    const { localUserId, localUsername } = user.user;

    const signPrompt = useSelector((state) => state.prompt);
    const { isPromptShown } = signPrompt;

    useEffect(() => {
        if (localUsername === "" || localUserId === "") {
            // Redirect to login
            dispatch(setPromptShown(true));
        }

        else {
            setIsLoading(false);
        }
    }, []);

    // React
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [yourProjects, setYourProjects] = useState([]);
    const [sponsoredProjects, setSponsoredProjects] = useState([]);
    const [popularProjects, setPopularProjects] = useState([]);

    useEffect(() => {
        if (localUsername === "" || localUserId === "") {
            return; // we could've used isLoading's variable but this is more readable, explicit and understandable
        }

        const loadProjectsMadeByUser = async () => {
            try {
                const response = await axios.get(`http://localhost:5172/api/projects/${localUserId}`);
                setYourProjects(response.data);
            }

            catch (error) {
                console.error('An error occurred while loading the projects made by the user:', error);
            }
        }

        const loadSponsoredProjects = async () => {
            try {
                const response = await axios.get(`http://localhost:5172/api/projects/sponsored`);
                setSponsoredProjects(response.data);
            }

            catch (error) {
                console.error('An error occurred while loading the sponsored projects:', error);
            }
        }

        const loadPopularProjects = async () => {
            try {
                const response = await axios.get(`http://localhost:5172/api/projects/popular`);
                setPopularProjects(response.data);
            }

            catch (error) {
                console.error('An error occurred while loading the popular projects:', error);
            }

            finally { // Since this is the last function to be called, we can set isLoading to false here
                setIsLoading(false);
            }
        }

        loadProjectsMadeByUser();
        loadSponsoredProjects();
        loadPopularProjects();
    }, [localUsername, localUserId]);

    const defaultProject = [ // this is a placeholder for the loading state
        {name: "Loading Title", image: ""}, 
        {name: "Loading Title", image: ""}, 
        {name: "Loading Title", image: ""}, 
        {name: "Loading Title", image: ""}, 
        {name: "Loading Title", image: ""}
    ];

    return (
        <>
            <div className={`${styles.projectariumContainer} fadeIn`}>
                <h1 className='componentTitle'></h1>

                <div className={styles.projectarium}>
                    <Link to='/publish' className='link'>
                        <button className={`${styles.button} ${styles.create}`}>Create Project</button>
                    </Link>
                    
                    <div className={styles.projectContainer}>
                        <h1 className={styles.containerTitle}>Your Projects</h1>

                        <div className={styles.projects}>
                            { isLoading && defaultProject.map((project, index) => (
                                <div className={styles.projectCard} key={index}>
                                    <div className={`${styles.projectImage} ${styles.loading}`}>
                                        <img src={thumbnailPlaceholder} alt="Project Thumbnail" />
                                    </div>

                                    <div className={styles.projectDetails}>
                                        <p className={styles.projectTitle}>{project.name}</p>
                                    </div>
                                </div> 
                            ))}

                            { yourProjects.length > 0 && yourProjects.map((project, index) => (
                                <Link to={`/profile/${project.owner.username}/${project.name}`} className='link' key={index}>
                                <div className={styles.projectCard} key={index}>
                                    <div className={`${styles.projectImage} ${isLoading ? styles.loading : ''}`}>
                                        {!isLoading && <img src={thumbnailPlaceholder} alt="Project Thumbnail" />}
                                    </div>

                                    <div className={styles.projectDetails}>
                                        <p className={styles.projectTitle}>{project.name}</p>
                                    </div>
                                </div>
                                </Link>
                            ))}


                            <div onClick={() => navigate(`/profile/${encodeURIComponent(localUsername)}/projects`)} className={`${styles.projectCard} ${styles.moreProjects}`}>
                                <i className={`ri-more-line ${styles.icon}`}></i>
                                <p className={styles.projectTitle}>More Projects</p>
                            </div>

                            <Link to='/publish' className='link'>
                            <div className={`${styles.projectCard} ${styles.addProject}`}>
                                
                                <i className={`ri-add-circle-line ${styles.icon}`}></i>
                                <p className={styles.projectTitle}>Create Projects</p>
                                
                            </div>
                            </Link>
                        </div>
                    </div>

                    {sponsoredProjects.length > 0 && <div className={styles.projectContainer}>
                        <h1 className={styles.containerTitle}>Sponsored Projects</h1>

                        <div className={styles.projects}>
                            { isLoading && defaultProject.map((project, index) => (
                                <div className={styles.projectCard} key={index}>
                                    <div className={`${styles.projectImage} ${styles.loading}`}>
                                        <img src={thumbnailPlaceholder} alt="Project Thumbnail" />
                                    </div>

                                    <div className={styles.projectDetails}>
                                        <p className={styles.projectTitle}>{project.name}</p>
                                    </div>
                                </div> 
                            ))}

                            { sponsoredProjects.map((project, index) => (
                                <Link to={`/profile/${project.owner.username}/${project.name}`} className='link' key={index}>
                                    <div className={styles.projectCard} key={index}>
                                        <div className={`${styles.projectImage} ${isLoading ? styles.loading : ''}`}>
                                            {!isLoading && <img src={thumbnailPlaceholder} alt="Project Thumbnail" />}
                                        </div>

                                        <div className={styles.projectDetails}>
                                            <p className={styles.projectTitle}>{project.name}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>}

                    <div className={styles.projectContainer}>
                        <h1 className={styles.containerTitle}>Most Popular Projects</h1>

                        <div className={styles.projects}>
                            { isLoading && defaultProject.map((project, index) => (
                                <div className={styles.projectCard} key={index}>
                                    <div className={`${styles.projectImage} ${styles.loading}`}>
                                        <img src={thumbnailPlaceholder} alt="Project Thumbnail" />
                                    </div>

                                    <div className={styles.projectDetails}>
                                        <p className={styles.projectTitle}>{project.name}</p>
                                    </div>
                                </div> 
                            ))}

                            { popularProjects.length > 0 && popularProjects.map((project, index) => (
                                <Link key={index} to={`/profile/${project.owner.username}/${project.name}`} className='link'>
                                <div className={styles.projectCard} key={index}>
                                    <div className={`${styles.projectImage} ${isLoading ? styles.loading : ''}`}>
                                        {!isLoading && <img src={thumbnailPlaceholder} alt="Project Thumbnail" />}
                                    </div>

                                    <div className={styles.projectDetails}>
                                        <p className={styles.projectTitle}>{project.name}</p>

                                    </div>
                                </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {isPromptShown && <PromptType />}
            
        </>
    )
}

export default Projectarium;