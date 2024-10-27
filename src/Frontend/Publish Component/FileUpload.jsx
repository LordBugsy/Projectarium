import React, { useRef, useState } from 'react';
import styles from './FileUpload.module.scss';

const FileUpload = ({ onFileChange, buttonLabel = "Add Thumbnail.." }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            if (onFileChange) {
                onFileChange(file);
            }
        }
    };

    return (
        <div className={styles.fileUploadContainer}>
            <input
                id='projectThumbnail'
                ref={fileInputRef}
                className={styles.hiddenFileInput}
                name='projectThumbnail'
                type="file"
                onChange={handleFileChange}
            />
            <button type="button" className={styles.customFileButton} onClick={handleButtonClick}>
                {buttonLabel}
            </button>

            {selectedFile && <p className={styles.selectedFile}>{selectedFile.name}</p>}
        </div>
    );
};

export default FileUpload;
