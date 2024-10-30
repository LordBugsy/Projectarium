import { useRef, useState } from 'react';
import FileUpload from './FileUpload';
import styles from './Publish.module.scss';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Publish = () => {
    // Redux
    const { localUserId, localUsername } = useSelector((state) => state.user.user);

    // React
    const navigate = useNavigate();

    const [isURLValid, setIsURLValid] = useState(true);
    const [alreadyExists, setAlreadyExists] = useState(false);
    const [titleCharCount, setTitleCharCount] = useState(25);
    const [descriptionCharCount, setDescriptionCharCount] = useState(110);

    const projectURL = useRef(null);
    const projectTitle = useRef(null);
    const projectDescription = useRef(null);

    const checkURL = gitURL => {
        const gitRegex = /https?:\/\/[^ ]*git[^ ]*/i; 
        return gitRegex.test(gitURL);
    }

    const createProjectarium = async (event) => {
        event.preventDefault();

        if (!checkURL(projectURL.current.value)) {
            setIsURLValid(false);
            return;
        }

        setIsURLValid(true);
        try {
            const response = await axios.post('http://localhost:5172/api/project/create', {
                link: projectURL.current.value,
                name: projectTitle.current.value,
                description: projectDescription.current.value,
                ownerID: localUserId,
            });

            navigate(`/profile/${encodeURIComponent(localUsername)}/${encodeURIComponent(response.data.name)}`);
        }

        catch (error) {
            console.error('An error occurred while creating the project:', error);
            setAlreadyExists(true);
        }
    }

    const handleTitleChange = () => {
        if (alreadyExists) setAlreadyExists(false);
        setTitleCharCount(25 - projectTitle.current.value.length);
        setIsURLValid(true);
    }

    const handleDescriptionChange = () => {
        setDescriptionCharCount(110 - projectDescription.current.value.length);
        setIsURLValid(true);
    }

    return (
        <>
            <div className={`${styles.publishContainer} fadeIn`}>
                <div className={styles.publish}>
                    <h1 className='componentTitle'>Publish Projectarium</h1>

                    <form method='post' className={styles.publishForm} onSubmit={createProjectarium}>
                        <div className={styles.publishContent}>
                            <label htmlFor='projectURL'>Project URL<span className={styles.required}>*</span></label>
                            <input ref={projectURL} spellCheck='false' required id='projectURL' className={styles.input} name='projectURL' type="text" placeholder="Project URL.." />
                            {!isURLValid && <p className={styles.error}>Please enter a valid Git URL</p>}
                        </div>

                        <div className={styles.publishContent}>
                            <label htmlFor='projectTitle'>Project Title<span className={styles.required}>*</span></label>
                            <input ref={projectTitle} spellCheck='false' maxLength='25' required id='projectTitle' className={styles.input} name='projectTitle' type="text" placeholder="Project Title.." onChange={handleTitleChange} />
                            {alreadyExists && <p className={styles.error}>You already made a project with this name.</p>}
                            <p className={styles.characterCount}>{titleCharCount} characters left</p>
                        </div>

                        <div className={styles.publishContent}>
                            <label htmlFor='projectDescription'>Project Description<span className={styles.required}>*</span></label>
                            <textarea ref={projectDescription} maxLength='110' required id='projectDescription' className={styles.textarea} name='projectDescription' type="text" placeholder="Project Description.." onChange={handleDescriptionChange} />
                            <p className={styles.characterCount}>{descriptionCharCount} characters left</p>
                        </div>

                            {/* <FileUpload /> */}

                        <div>
                            <button type='submit' className={`${styles.button} ${styles.publish}`}>Publish</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Publish;
