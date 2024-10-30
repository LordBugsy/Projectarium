import styles from './AllProjects.module.scss';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import thumbnailPlaceholder from '../../../assets/thumbnailPlaceholder.png';
import Loading from '../../Loading/Loading';

const AllProjects = () => {
    const { username } = useParams();
    const [projectsList, updateProjectsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const loadProjects = async () => {
            setLoading(true);
            setError(false);

            try {
                const backendResponse = await axios.get(`http://localhost:5172/api/project/user/${username}`);
                updateProjectsList(backendResponse.data);
            }
            
            catch (error) {
                console.error(error);
                setError(true);
            }

            finally {
                setLoading(false);
            }
        };

        loadProjects();
    }, [username]);

    return (
        <div className={`${styles.allProjectsContainer} fadeIn`}>
            <h1 className='componentTitle'>All Projects made by {username}</h1>
    
            <div className={styles.projectsContainer}>
                {!loading ? (
                    projectsList.length >= 1 ? (
                        projectsList.map((project, index) => (
                            <Link to={`/profile/${project.owner.username}/${project.name}`} className='link' key={index}>
                                <div className={styles.projectCard} key={index}>
                                    <div className={styles.projectImage}>
                                        <img src={thumbnailPlaceholder} alt="Project Thumbnail" />
                                    </div>
    
                                    <div className={styles.projectDetails}>
                                        <p className={styles.projectTitle}>{project.name}</p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (error ? <p className={styles.error}>An error occurred while fetching projects.</p> : <p className={`${styles.error} ${styles.fadeIn}`}>It seems like {username} hasn't made any projects yet.</p>)
                ) : <Loading />}
            </div>
        </div>
    );
};

export default AllProjects;