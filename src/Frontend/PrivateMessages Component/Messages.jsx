import styles from './Messages.module.scss';
import React, { useEffect, useState } from 'react';
import placeholder from '../../assets/placeholder.png';
import ChatLogs from './Chat/ChatLogs';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setLastChatIndex } from '../Redux/store';

const Messages = () => {
    // Redux
    const { localUserId, localUsername } = useSelector((state) => state.user.user);
    const lastChatIndex = useSelector((state) => state.lastChatIndex.value);
    const redirect = useSelector((state) => state.lastChatIndex.redirect);

    const dispatch = useDispatch();

    // React
    const [privateChats, updatePrivateChats] = useState([]);
    const [isRecipientVisible, setIsRecipientVisible] = useState(false); // Show the recipient list (mobile only)

    useEffect(() => {
        const loadAllPrivateChats = async () => {
            try {
                const response = await axios.get(`http://localhost:5172/api/messages/${localUserId}`);
                updatePrivateChats(response.data);
            } 
            
            catch (error) {
                console.error('An error occurred while loading the messages:', error);
            }
        }
        loadAllPrivateChats();
    }, []);

    const selectPrivateChat = (index) => {
        dispatch(setLastChatIndex({ value: index }));
        toggleList(); // Hide the recipient list
    };

    const toggleList = () => {
        setIsRecipientVisible(!isRecipientVisible);
    };

    return (
        <div className={`${styles.messagesContainer} fadeIn`}>
            <div className={`${styles.messageRecipient} ${isRecipientVisible ? styles.shown : styles.hidden}`}>
                <div className={styles.messageHeader}>
                    <div className={styles.section}>
                        <div className={`${styles.messageRequest} ${styles.messageSection}`}>
                            <p className={styles.text}>These are your private messages</p>
                        </div>
                    </div>
                </div>

                <div className={styles.messageList}>
                    {privateChats.map((chat, index) => (
                        <div key={index} onClick={() => selectPrivateChat(index)} className={`${styles.message} ${lastChatIndex === index ? styles.selected : ''}`}>
                            <img src={chat.groupChat ? `/${chat.groupChat[0].username === localUsername ? chat.groupChat[1].profileColour : chat.groupChat[0].profileColour}.png` : placeholder} alt="Avatar" className={styles.avatar} />

                            <div className={styles.messagePreview}>
                                <p className={`${styles.username} ${chat.state === "unread" ? styles.unread : styles.read}`}>
                                    {chat.groupChat && chat.groupChat[0].username === localUsername ? chat.groupChat[1].username : chat.groupChat[0].username}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.rightSide}>
                <i onClick={toggleList} className={`fa-solid fa-arrow-left ${styles.icon}`}></i>
                <ChatLogs id={privateChats[lastChatIndex]?._id} username={privateChats[lastChatIndex]?.groupChat[0].username === localUsername ? privateChats[lastChatIndex]?.groupChat[1].username : privateChats[lastChatIndex]?.groupChat[0].username } /> 
            </div>
        </div>
    );
};

export default Messages;
