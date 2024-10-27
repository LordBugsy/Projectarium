import { useEffect, useRef } from 'react';
import styles from './Contact.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { setContactShown } from '../Redux/store';

const Contact = () => {
    // Redux
    const dispatch = useDispatch();
    const isContactShown = useSelector((state) => state.contact.isContactShown);

    const userData = useSelector((state) => state.user.user);
    const { localUsername } = userData;

    // React
    const containerRef = useRef(null);

    const submitForm = (event) => {
        console.log('Form submitted!');
        // wip - send the form data to the server
        event.preventDefault();
        closeContact();
    }

    const closeContact = () => {
        // close the contact form
        if (containerRef.current) containerRef.current.classList.replace("fadeIn", "fadeOut");
        setTimeout(() => dispatch(setContactShown(false)), 300);
    }

    useEffect(() => {
        const clickOutside = event => {
            if (containerRef.current && event.target === containerRef.current) closeContact();
        }

        document.addEventListener('mousedown', clickOutside);

        return () => document.removeEventListener('mousedown', clickOutside);
    }, []);

    return (
        <>
            {isContactShown && (<div ref={containerRef} className={`${styles.contactContainer} fadeIn`}>
                <div className={styles.contact}>
                    <h2 className={styles.username}>{localUsername}</h2>
                    <i className={`ri-close-line ${styles.close}`} onClick={closeContact}></i>
                    <h1 className={styles.contactHeading}>Contact Us</h1>
                    <p className={styles.contactText}>We are here to help you with any queries you may have. Feel free to contact us and we will get back to you as soon as possible.</p>

                    <form className={styles.contactForm} onSubmit={submitForm}>
                        <input spellCheck='false' className={styles.input} type='text' name='subject' placeholder='Subject..' required />
                        <textarea className={styles.textArea} name='message' placeholder='Message..' required></textarea>
                        <button type='submit' className={`${styles.button} ${styles.send}`}>Send</button>
                    </form>

                    <p className={styles.legalCompliance}>
                        By submitting this form, you agree to our <span className={styles.interact}>Terms of Service</span> and <span className={styles.interact}>Privacy Policy</span>.
                    </p>

                </div>
            </div>)}
        </>
    )
}

export default Contact;