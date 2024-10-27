import React from 'react';
import styles from './Loading.module.scss'; 

// I didn't make this Loading component, I got it from the internet. I don't remember where I got it but thanks to the person who made it (same goes for the CSS)
const Loading = () => {
    return (
        <div className={styles.Loading}>
            <div className={styles.spinner}></div>
        </div>
    );
};

export default Loading;