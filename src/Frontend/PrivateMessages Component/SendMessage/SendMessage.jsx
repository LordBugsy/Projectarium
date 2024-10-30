import styles from './SendMessage.module.scss';
import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const SendMessage = (props) => {
    // Redux
    const localUserId = useSelector((state) => state.user.user.localUserId);

    // React
    const messageAreaRef = useRef(null);

    useEffect(() => {
        const handleInput = () => {
            if (messageAreaRef.current) {
                messageAreaRef.current.style.height = 'auto';
                messageAreaRef.current.style.height = `${Math.min(messageAreaRef.current.scrollHeight, 335)}px`;
            }
        };

        const textArea = messageAreaRef.current;
        if (textArea) {
            textArea.addEventListener('input', handleInput);
        }

        return () => {
            if (textArea) {
                textArea.removeEventListener('input', handleInput);
            }
        };
    }, []);

    useEffect(() => {
        if (messageAreaRef.current) messageAreaRef.current.focus();
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        };
        
        if (messageAreaRef.current) {
            messageAreaRef.current.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            if (messageAreaRef.current) {
                messageAreaRef.current.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, [props.id]);    

    const sendMessage = async () => {
        if (!props.id) return;
    
        try {
            const response = await axios.post(`http://localhost:5172/api/chatlogs/send/${props.id}`, {
                message: messageAreaRef.current.value,
                sender: localUserId,
            });
    
            setTimeout(() => {
                if (props.onMessageSent) {
                    props.onMessageSent();
                }
            }, 200);
        }
    
        catch (error) {
            console.error('An error occurred while sending the message:', error);
        }
    
        finally {
            messageAreaRef.current.style.height = 'auto';
            messageAreaRef.current.value = '';
        }
    };

    return (
        <div className={styles.textAreaContainer}>
            <textarea maxLength='320' name='textarea' ref={messageAreaRef} className={styles.textArea} placeholder={`Message ${props.username}`}></textarea>
            
            <div onClick={sendMessage} className={styles.iconBackground}>
                <i className={`fas fa-paper-plane ${styles.icon} ${styles.send}`}></i>
            </div>
        </div>    
    )
};

export default SendMessage;