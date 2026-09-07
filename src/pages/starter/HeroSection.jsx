import { useNavigate } from "react-router-dom";

import { Button } from "../../components/common/Button";

import styles from "./HeroSection.module.css";

import logo from "../../assets/logo.png";
import background from "../../assets/background.jpg";



export const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <div
            className={styles["hero-wrapper"]}
            style={{ backgroundImage: `url(${background})`, backgroundSize: "cover" }}
        >
            {/* Top text */}
            <p className={styles["top-text"]}>Your Prescription for Success</p>

            {/* Logo */}
            <img src={logo} alt="PrepRx Logo" className={styles["main-logo"]} />

            {/* Main Title */}
            <h1 className={styles["main-title"]}>Where Nursing Dreams Get Filled</h1>

            {/* Subtitle */}
            <p className={styles["sub-title"]}>
                Daily doses of NCLEX mastery. Personalized study prescriptions,
                <br />
                Real Results
            </p>

            {/* Buttons */}
            <div className={styles["hero-btn-group"]}>
                <Button
                    className={styles["hero-btn-yellow"]}
                    onClick={() => navigate("/login")}
                >
                    Start Daily Dose
                </Button>
                <Button
                    className={styles["hero-btn-white"]}
                    onClick={() => navigate("/login")}
                >
                    View Treatment Plan
                </Button>
            </div>

            {/* Stats Section */}
            <div className={styles["stats"]}>
                <div className={styles["stat"]}>
                    <h2>10k+</h2>
                    <p>Questions</p>
                </div>

                <div className={styles["stat"]}>
                    <h2>95%</h2>
                    <p>Pass Rate</p>
                </div>

                <div className={styles["stat"]}>
                    <h2>50k+</h2>
                    <p>Students</p>
                </div>
            </div>
        </div>
    );
};
