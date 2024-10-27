import styles from './SendComment.module.scss';
import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const SendComment = (props) => {
    // Redux
    const { localUserId } = useSelector((state) => state.user.user);

    // React
    const textAreaRef = useRef(null);
    const selectedProject = props.projectID;

    // Set a max height for the text area
    useEffect(() => {
        const handleInput = () => {
            if (textAreaRef.current) {
                textAreaRef.current.style.height = 'auto';
                textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 220)}px`;
            }
        };

        const textArea = textAreaRef.current;
        if (textArea) {
            textArea.addEventListener('input', handleInput);
        }

        // Cleanup the event listener on component unmount
        return () => {
            if (textArea) {
                textArea.removeEventListener('input', handleInput);
            }
        };
    }, []);

    useEffect(() => {
        if (textAreaRef.current) textAreaRef.current.focus();
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendComment();
            }
        };

        if (textAreaRef.current) {
            textAreaRef.current.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            if (textAreaRef.current) {
                textAreaRef.current.removeEventListener('keydown', handleKeyDown);
            }
        }
    }, []);

    const sendComment = async () => {
        if (!textAreaRef.current.value.trim()) return;

        try {
            const response = await axios.post(`http://localhost:5172/api/comment/create`, {
                projectID: selectedProject,
                userID: localUserId,
                text: textAreaRef.current.value,
                parentCommentID: null
            });

            if (props.onCommentSent) {
                props.onCommentSent();
            }
        } 
        
        catch (error) {
            console.error(error);
        } 
        
        finally {
            textAreaRef.current.value = '';
            textAreaRef.current.style.height = 'auto';
        }
    };

    return (
        <div className={styles.textAreaContainer}>
            <textarea maxLength='320' name='textarea' ref={textAreaRef} className={styles.textArea} placeholder={`Comment ${props.projectName}`} />
            <div className={styles.iconBackground}>
                <i onClick={sendComment} className={`fas fa-paper-plane ${styles.icon} ${styles.send}`}></i>
            </div>
        </div>    
    );
};

export default SendComment;
