import styles from './Comments.module.scss';
import Loading from '../../Loading/Loading';
import { useState, useEffect, useRef } from 'react';
import SendComment from './SendComment/SendComment';
import { useSelector, useDispatch } from 'react-redux';
import { setCommentShown } from '../../Redux/store';
import axios from 'axios';

const Comments = (props) => {
    // Redux
    const dispatch = useDispatch();
    const isCommentShown = useSelector((state) => state.comment.isCommentShown);
    const { localUserId, role } = useSelector((state) => state.user.user);

    // React
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const containerRef = useRef(null);

    // Function to load comments
    const loadComments = async () => {
        if (!props.project._id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5172/api/comments/${props.project._id}`);
            setComments(response.data);
        } 
        
        catch (error) {
            console.error(error);
        } 
        
        finally {
            setLoading(false);
        }
    };

    // Load comments initially when the component mounts
    useEffect(() => {
        loadComments();
    }, [props.project._id]);

    // Close comments handler
    const closeComments = () => {
        if (containerRef.current) {
            containerRef.current.classList.replace('fadeIn', 'fadeOut');
            setTimeout(() => {
                dispatch(setCommentShown(false));
            }, 500);
        }
    };

    const likeComment = async (commentID) => {
        try {
            const response = await axios.post('http://localhost:5172/api/comment/like', { 
                commentID, 
                userID: localUserId  
            });
    
            // Optimistically update the local comment
            setComments(prevComments => prevComments.map(comment =>
                comment._id === commentID ? { ...comment, likes: [...comment.likes, localUserId] } : comment
            ));
        } 
        
        catch (error) {
            console.error(error);
        }
    }

    const unlikeComment = async (commentID) => {
        try {
            const response = await axios.post('http://localhost:5172/api/comment/unlike', { 
                commentID, 
                userID: localUserId  
            });
    
            // Optimistically update the local comment
            setComments(prevComments => prevComments.map(comment =>
                comment._id === commentID ? { ...comment, likes: comment.likes.filter(id => id !== localUserId) } : comment
            ));
        } 
        
        catch (error) {
            console.error(error);
        }
    }

    const deleteComment = async (commentID) => {
        try {
            const response = await axios.post('http://localhost:5172/api/comment/delete', {
                commentID,
                userID: localUserId
            });

            // Optimistically update the local comment
            setComments(prevComments => prevComments.filter(comment => comment._id !== commentID));
        }

        catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && event.target === containerRef.current) closeComments();
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
        {isCommentShown && <div ref={containerRef} className={`${styles.commentsContainer} fadeIn`}>
            <div className={styles.commentsContent}>
                {loading ? <Loading /> : 
                (
                <>
                    <div className={styles.commentsLogs}>
                        <i className={`fas fa-times ${styles.icon}`} onClick={closeComments}></i>
                        {comments.map((comment, index) => (
                            <div key={index} className={styles.comment}>
                                <div className={styles.commentUser}>
                                    <img src={comment.user.profileColour !== undefined ? `/${comment.user.profileColour}.png` : '/error.png'} />
                                    <h2 className={styles.username}>{comment.user.username} <span className={styles.commentDate}>({new Date(comment.date).toLocaleDateString()})</span></h2>
                                </div>
                                <div className={styles.commentText}>
                                    <p className={styles.text}>{comment.text}</p>
                                </div>
                                <div className={styles.commentActions}>
                                    <i onClick={comment.likes.includes(localUserId) ? () => unlikeComment(comment._id) : () => likeComment(comment._id)} className={`fas fa-heart ${styles.action} ${comment.likes.includes(localUserId) ? styles.heart : styles.unheart}`}> <span className={styles.likesCount}>{comment.likes.length}</span></i>
                                    {(comment.user._id === localUserId || role === "admin") && <i onClick={() => deleteComment(comment._id)} className={`fas fa-trash-alt ${styles.action} ${styles.delete}`}></i>}
                                </div>
                            </div>
                        ))}
                        {comments.length === 0 && <h2 className={`${styles.noComments} ${styles.fadeIn}`}>No one has commented anything on this project, be the first one to do so!</h2>}
                    </div>
                    <div className={styles.commentForm}>
                        <SendComment projectName={props.project.name} projectID={props.project._id} onCommentSent={loadComments} />    
                    </div>
                </>
                )}
            </div>
        </div>}
        </>
    );
};

export default Comments;
