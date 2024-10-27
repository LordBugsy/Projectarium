import styles from './Search.module.scss'; 
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Loading from '../Loading/Loading';
import projectThumbnail from '../../assets/thumbnailPlaceholder.png';
import axios from 'axios';

const Search = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [loadedProjects, setLoadedProjects] = useState([]);
    const { query } = useParams();

    useEffect(() => {
        const loadProjectsByQuery = async () => {
            try {
                const response = await axios.get(`http://localhost:5172/api/projects/search/${query}`);
                setLoadedProjects(response.data);
            }

            catch (error) {
                console.error('An error occurred while fetching search results:', error);
            }

            finally {
                setLoading(false);
            }
        }
        loadProjectsByQuery();
    }, [query]);

    return (
        <div className={`${styles.searchContainer} fadeIn`}>
            <h1 className='componentTitle'>Search results for "{query}"</h1>
            <div className={styles.searchResults}>
                {loading ? <Loading /> : (
                    <>
                        {loadedProjects.length === 0 ? <p className={`${styles.noResults} ${styles.fadeIn}`}>No results found for "{query}", why don't you <span onClick={() => navigate('/publish')} className={styles.interact}>create </span>a project about it?</p> : (
                            <div className={`${styles.projects} fadeIn`}>
                                {loadedProjects.map((project, index) => (
                                    
                                    <div key={index} className={styles.project}>
                                        <Link to={`/profile/${project.owner.username}/${project.name}`} className='link'>
                                            <div className={styles.thumbnailContainer}>
                                                <img src={projectThumbnail} alt="Project" />
                                            </div>

                                            <div className={styles.projectInfo}>
                                                <p>{project.name}</p>
                                                <p> Made by <span className={styles.interact}>@{project.owner.username} {project.owner.isVerified && <i className={`fa-solid fa-circle-check ${styles.verifyIcon}`}></i>}</span></p>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
                
            </div>
        </div>
    )
}

export default Search;