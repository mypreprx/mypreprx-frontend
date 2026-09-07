import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import styles from "./LoginPage.module.css";
import useAuthStore from "../../store/authStore";
import { Button } from "../../components/common/Button";
import SvgImage from "../../assets/SVG.png";
import toast from "react-hot-toast";

export const ResetPasswordPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { token } = useParams();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const password = watch("password");
    const { resetPassword } = useAuthStore();

    const onSubmit = async (data, e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await resetPassword(token, data.password);
            toast.success(response.message || "Password reset successful!");
            setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password. The link might be expired.");
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
                    <h2>Reset Password</h2>
                    <p>Please enter your new password.</p>

                    <form className={styles["login-form"]} onSubmit={handleSubmit(onSubmit)}>
                        <div className={`${styles["input-group"]} ${errors.password ? styles.error : ""}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g strokeWidth="0"></g><g strokeLinecap="round" strokeLinejoin="round"></g><g> <path d="M12 14.5V16.5M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288" stroke="#083862" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="New Password"
                                {...register("password", { 
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters"
                                    }
                                })}
                            />
                            <div className={styles["eye-icon"]} onClick={() => setShowPassword(!showPassword)}>
                                {showPassword
                                    ? (<svg width="23" height="24" viewBox="0 0 23 24" fill="none" stroke="#787B80" strokeWidth="0.48"><path d="M5.567 15.562C5.774 15.746 5.793 16.062 5.609 16.268C5.426 16.475 5.11 16.493 4.904 16.31C3.635 15.184 2.65 13.77 2.034 12.181C1.989 12.064 1.989 11.936 2.034 11.819C4.091 6.513 9.943 3.757 15.327 5.525C15.59 5.611 15.732 5.894 15.646 6.156C15.56 6.419 15.278 6.562 15.015 6.475C10.197 4.893 4.965 7.309 3.038 12C3.6 13.367 4.466 14.584 5.567 15.562ZM12.62 8.048C12.893 8.09 13.079 8.346 13.037 8.619C12.994 8.892 12.739 9.078 12.466 9.036C12.313 9.012 12.157 9 12 9C10.343 9 9 10.343 9 12C9 12.156 9.012 12.31 9.035 12.461C9.077 12.734 8.89 12.989 8.617 13.031C8.344 13.073 8.089 12.886 8.047 12.613C8.016 12.411 8 12.207 8 12C8 9.791 9.791 8 12 8C12.209 8 12.416 8.016 12.62 8.048ZM11.456 15.963C11.182 15.926 10.991 15.674 11.028 15.4C11.065 15.127 11.317 14.935 11.591 14.972C11.726 14.991 11.862 15 12 15C13.657 15 15 13.657 15 12C15 11.878 14.993 11.758 14.979 11.639C14.946 11.365 15.141 11.116 15.415 11.083C15.69 11.05 15.939 11.246 15.971 11.52C15.99 11.678 16 11.839 16 12C16 14.209 14.209 16 12 16C11.817 16 11.635 15.988 11.456 15.963ZM3.854 20.854C3.658 21.049 3.342 21.049 3.146 20.854C2.951 20.658 2.951 20.342 3.146 20.146L20.146 3.146C20.342 2.951 20.658 2.951 20.854 3.146C21.049 3.342 21.049 3.658 20.854 3.854L3.854 20.854ZM18.433 8.438C18.226 8.254 18.207 7.938 18.391 7.732C18.574 7.525 18.89 7.507 19.096 7.69C20.365 8.816 21.35 10.23 21.966 11.819C22.011 11.936 22.011 12.064 21.966 12.181C19.909 17.487 14.057 20.243 8.673 18.475C8.41 18.389 8.268 18.106 8.354 17.844C8.44 17.581 8.722 17.438 8.985 17.525C13.803 19.107 19.035 16.691 20.962 12C20.4 10.633 19.534 9.416 18.433 8.438Z" fill="#787B80"></path></svg>)
                                    : (<svg width="23" height="24" viewBox="0 0 23 24" fill="none">
                                        <g opacity="0.7">
                                            <path d="M11.0355 6.5C14.521 6.5 17.6293 8.63 19.1468 12C17.6293 15.37 14.5301 17.5 11.0355 17.5C7.54086 17.5 4.44167 15.37 2.92426 12C4.44167 8.63 7.55006 6.5 11.0355 6.5ZM11.0355 4.5C6.43729 4.5 2.51042 7.61 0.919434 12C2.51042 16.39 6.43729 19.5 11.0355 19.5C15.6337 19.5 19.5606 16.39 21.1516 12C19.5606 7.61 15.6337 4.5 11.0355 4.5ZM11.0355 9.5C12.3046 9.5 13.3346 10.62 13.3346 12C13.3346 13.38 12.3046 14.5 11.0355 14.5C9.7664 14.5 8.7364 13.38 8.7364 12C8.7364 10.62 9.7664 9.5 11.0355 9.5ZM11.0355 7.5C8.75479 7.5 6.89711 9.52 6.89711 12C6.89711 14.48 8.75479 16.5 11.0355 16.5C13.3162 16.5 15.1739 14.48 15.1739 12C15.1739 9.52 13.3162 7.5 11.0355 7.5Z" fill="#787B80" />
                                        </g>
                                    </svg>
                                    )}
                            </div>
                        </div>
                        {errors.password && <span className={styles["error-message"]}>{errors.password.message}</span>}

                        <div className={`${styles["input-group"]} ${errors.confirmPassword ? styles.error : ""}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g strokeWidth="0"></g><g strokeLinecap="round" strokeLinejoin="round"></g><g> <path d="M12 14.5V16.5M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288" stroke="#083862" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                {...register("confirmPassword", { 
                                    required: "Please confirm your password",
                                    validate: value => value === password || "Passwords do not match"
                                })}
                            />
                        </div>
                        {errors.confirmPassword && <span className={styles["error-message"]}>{errors.confirmPassword.message}</span>}

                        <Button type="submit" className={styles["login-btn"]} disabled={isSubmitting}>
                            {isSubmitting ? "Resetting..." : "Reset Password"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};
