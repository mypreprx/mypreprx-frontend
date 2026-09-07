import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MichelAIButton.module.css';
import SvgImage from '../assets/SVG.png';

const MichelAIButton = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/michelle-ai');
    };

    return (
        <button className={styles.michelButton} onClick={handleClick} title="Chat with Michel AI">
            <img src={SvgImage} alt="Michel AI Logo" className={styles.icon} />
            <span className={styles.text}>Michel AI</span>
        </button>
    );
};

export default MichelAIButton;