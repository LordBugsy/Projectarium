import SendMessage from '../SendMessage/SendMessage';
import styles from './ChatLogs.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Loading from '../../Loading/Loading';

const ChatLogs = (props) => {
    const [chatLogs, updateChatLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadMessages = async () => {
        if (!props.id) return;


        try {
            const response = await axios.get(`http://localhost:5172/api/chatlogs/groupChat/${props.id}`);
            updateChatLogs(response.data.messages);
        } 
        
        catch (error) {
            console.error('An error occurred while loading the messages:', error);
        } 

        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMessages();
    }, [props.id]);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [chatLogs]);

    return (
        <div className={styles.chatLogsContainer}>
            <div className={styles.chatLogs}>

                {loading ? <Loading /> : chatLogs.map((chat, index) => {
                    const showProfilePicture = index === 0 || chat.sender._id !== chatLogs[index - 1].sender._id;

                    return (
                        <div key={index} className={styles.chatMessageLogs}>
                            {showProfilePicture && (
                                <div className={styles.chatHeader}>
                                    <img src={chat.sender.profileColour !== undefined ? `/${chat.sender.profileColour}.png` : '/error.png'} alt={`${chat.sender.username}'s profile picture`} />
                                    <h2 className={styles.username}>{chat.sender.username}</h2>
                                </div>
                            )}
                            <p className={styles.chat}>{chat.text}</p>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            
            <div className={styles.chatMessage}>
                <SendMessage id={props.id} username={props.username} onMessageSent={loadMessages} />
            </div>
        </div>
    );
};

export default ChatLogs;