import styles from './SearchPopup.module.scss';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchShown } from '../../Redux/store'
import { useNavigate } from 'react-router-dom';

const SearchPopup = () => {
    // Redux
    const dispatch = useDispatch();
    const isSearchShown = useSelector((state) => state.search.isSearchShown);

    // React
    const navigate = useNavigate();

    const searchQuery = useRef(null);
    const containerRef = useRef(null);

    // State to manage input value
    const [query, setQuery] = useState('');

    const placeholders = [
        "ReactJS Apps",
        "NodeJS Projects",
        "To-do List",
        "C# Projects",
        "Minecraft mods",
        "LordBugsy's Projects"
    ];

    const closeSearch = () => {
        // close the search popup
        if (containerRef.current) containerRef.current.classList.replace("fadeIn", "fadeOut");

        setTimeout(() => dispatch(setSearchShown(false)), 300);
    }

    useEffect(() => {
        const clickOutside = event => {
            if (containerRef.current && event.target === containerRef.current) closeSearch();
        }

        document.addEventListener('mousedown', clickOutside);

        return () => document.removeEventListener('mousedown', clickOutside);
    }, []);

    const search = () => {
        if (query.length > 0) {
            navigate(`/search/${encodeURIComponent(query)}`);
            closeSearch();
        }
    }

    useEffect(() => {
        const enterKeyPress = event => {
            if (query.length > 0 && event.key === 'Enter') search();
        }

        document.addEventListener('keydown', enterKeyPress);

        return () => document.removeEventListener('keydown', enterKeyPress);
    }, [query]);

    const handleInputChange = (event) => {
        setQuery(event.target.value);
    }

    return (
        <>
            {isSearchShown && <div ref={containerRef} className={`${styles.searchPopupContainer} fadeIn`}>
                <div className={styles.searchPopup}>
                    <i className={`ri-close-line ${styles.icon}`} onClick={closeSearch}></i>
                    <h1 className='componentTitle'>Enter your query</h1>
                    <input ref={searchQuery} id='query' name='query' spellCheck='false' className={styles.searchInput} type='text' placeholder={placeholders[Math.floor(Math.random() * placeholders.length)]} value={query} onChange={handleInputChange} />
                    <button onClick={search} type='submit' disabled={query.length === 0} className={`${styles.button} ${query.length === 0 ? styles.disabled : styles.search}`}>Search</button>
                </div>
            </div>}
        </>
    )
}

export default SearchPopup;
