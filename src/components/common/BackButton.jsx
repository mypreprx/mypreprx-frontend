import { useNavigate } from "react-router-dom";
import styles from "./BackButton.module.css";

export const BackButton = ({ to }) => {
    const navigate = useNavigate();

    return (
        <button className={styles["back-btn"]} onClick={() => navigate(to)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
        </button>
    );
};
