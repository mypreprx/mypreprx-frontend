import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import styles from "./LoginPage.module.css";
import useAuthStore from "../../store/authStore";
import { Button } from "../../components/common/Button";
import SvgImage from "../../assets/SVG.png";
import toast from "react-hot-toast";

export const ForgotPasswordPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const { forgotPassword } = useAuthStore();

    const onSubmit = async (data, e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await forgotPassword(data.email);
            toast.success(response.message || "Reset link sent to your email!");
            setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send reset link");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles["login-container"]}>
            <div className={styles["login-left"]}>
                <div className={styles["logo-section"]}>
                    <img src={SvgImage} alt="PrepRX Logo" className={styles["brand-logo"]} />
                </div>
                <div className={styles["banners-container"]}>
                    <div className={`${styles.banner} ${styles.yellow}`}>Custom Quizzes</div>
                    <div className={`${styles.banner} ${styles.teal}`}>All topics</div>
                    <div className={`${styles.banner} ${styles.darkBlue}`}>Behavioral Health RX</div>
                    <div className={`${styles.banner} ${styles.pink}`}>Priority Practice</div>
                </div>
                <div className={styles["slogan-box"]}>
                    Prep Smarter. Manifest Stronger. Pass with Confidence.
                </div>
            </div>

            <div className={styles["login-right"]}>
                <div className={styles["form-wrapper"]}>
                    <h2>Forgot Password</h2>
                    <p>Enter your email and we'll send you a link to reset your password.</p>

                    <form className={styles["login-form"]} onSubmit={handleSubmit(onSubmit)}>
                        <div className={`${styles["input-group"]} ${errors.email ? styles.error : ""}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V8L12 13L20 8V18ZM12 11L4 6H20L12 11Z" fill="#083862" />
                            </svg>
                            <input
                                type="email"
                                placeholder="Email"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                            />
                        </div>
                        {errors.email && <span className={styles["error-message"]}>{errors.email.message}</span>}

                        <Button type="submit" className={styles["login-btn"]} disabled={isSubmitting}>
                            {isSubmitting ? "Sending..." : "Send Reset Link"}
                        </Button>

                        <p className={styles["signup-text"]} style={{ marginTop: '20px' }}>
                            Remember your password? <span onClick={() => navigate("/login")}>Log In</span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};
