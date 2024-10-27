import styles from './Report.module.scss';

import { useDispatch, useSelector } from 'react-redux';
import { setReportShown } from '../Redux/store';
import { useEffect, useRef } from 'react';
import axios from 'axios';

const Report = props => {
    // Redux
    const dispatch = useDispatch();
    const isReportShown = useSelector(state => state.report.isReportShown);

    // React
    const containerRef = useRef(null);
    const reasonRef = useRef(null);
    const descriptionRef = useRef(null);

    const closeReport = () => {
        if (containerRef.current) {
            containerRef.current.classList.replace('fadeIn', 'fadeOut');
        }
        setTimeout(() => dispatch(setReportShown(false)), 300);
    };

    const submitReport = async () => {
        if (reasonRef.current.value === '' || descriptionRef.current.value === '') {
            return;
        }
    
        try {
            const backendResponse = await axios.post(`http://localhost:5172/api/report/${props.type}`, {
                [props.type === 'user' ? 'userID' : 'projectID']: props.id,
                reason: reasonRef.current.value,
                description: descriptionRef.current.value
            });
            
            closeReport();
        }
    
        catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        const handleClickOutside = event => {
            if (isReportShown && containerRef.current && event.target === containerRef.current) closeReport();
        }

        document.addEventListener('click', handleClickOutside);

        return () => document.removeEventListener('click', handleClickOutside);
    }, []);
    

    return (
        <>
        {isReportShown && (
            <div ref={containerRef} className={`${styles.reportContainer} fadeIn`}>
                <div className={styles.report}>
                    <i className={`fas fa-times ${styles.close}`} onClick={closeReport}></i>
                    <h1 className={styles.title}>Tell us how {props.type === 'user' ? props.username : props.projectName} is breaking the rules</h1>

                    <div className={styles.reportForm}>
                        <p className={styles.label}>Reason</p>
                        <input ref={reasonRef} type="text" name='reportReason' className={styles.input} placeholder={`The reason why you are reporting ${props.type === 'user' ? props.username : props.projectName}..`} />

                        <p className={styles.label}>Description</p>
                        <textarea ref={descriptionRef} className={styles.textArea} name='reportDescription' placeholder={`Describe the situation in detail..`} />

                        <div className={styles.actions}>
                            <button onClick={closeReport} className={`${styles.button} ${styles.cancel}`}>Cancel</button>
                            <button onClick={submitReport} className={`${styles.button} ${styles.send}`}>Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    )
}

export default Report;