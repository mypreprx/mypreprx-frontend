import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { GoogleLogin } from '@react-oauth/google';
import styles from "./LoginPage.module.css";
import useAuthStore from "../../store/authStore";
import { Button } from "../../components/common/Button";

import SvgImage from "../../assets/SVG.png";
import toast from "react-hot-toast";


export const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const { login, googleSignIn } = useAuthStore();

    const onSubmit = async (data, e) => {
        e.preventDefault();
        try {
            await login(data.email, data.password);
            // RedirectAuthenticatedUser wrapper on /login handles navigation:
            // → /home if interestTopics are set, else → /growth-zones
        } catch (error) {
            toast.error(error.response?.data?.message || "Login Failed");
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const result = await googleSignIn(credentialResponse);
            if (result?.isNewUser) {
                navigate('/pricing', { replace: true });
            }
        } catch (error) {
            console.error("Google sign in error:", error);
        }
    };

    const handleGoogleError = () => {
        toast.error("Google Sign-in failed. Please try again.");
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
                    <h2>Welcome Back</h2>
                    <p>Start your journey to becoming a confident RN.</p>

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

                        <div className={`${styles["input-group"]} ${errors.password ? styles.error : ""}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 14.5V16.5M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288" stroke="#083862" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="password"
                                {...register("password", { required: "Password is required" })}
                            />
                            <div className={styles["eye-icon"]} onClick={() => setShowPassword(!showPassword)}>
                                {showPassword
                                    ? (<svg width="23" height="24" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#787B80" strokeWidth="0.4800000000000001"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5.56743386,15.562189 C5.77393626,15.745523 5.79271792,16.0615479 5.60938388,16.2680503 C5.42604984,16.4745527 5.11002497,16.4933344 4.90352257,16.3100003 C3.6353371,15.1840978 2.65019079,13.7703534 2.03381935,12.1807639 C1.98872688,12.0644728 1.98872688,11.9355272 2.03381935,11.8192361 C4.09127496,6.51316634 9.94270809,3.75672367 15.3272962,5.52526555 C15.58965,5.6114344 15.7324762,5.89396787 15.6463073,6.15632172 C15.5601385,6.41867556 15.277605,6.56150172 15.0152512,6.47533287 C10.1968585,4.89275514 4.96478728,7.30886456 3.03835009,11.999958 C3.6003685,13.3673355 4.46613921,14.5844532 5.56743386,15.562189 Z M12.6197345,8.04779147 C12.8925892,8.0902754 13.0793417,8.34590792 13.0368578,8.61876269 C12.9943739,8.89161747 12.7387413,9.07836994 12.4658866,9.03588601 C12.3128698,9.01206106 12.1572886,9 12,9 C10.3431458,9 9,10.3431458 9,12 C9,12.1556182 9.01180624,12.3095659 9.03513143,12.4610138 C9.07716577,12.7339382 8.88999239,12.9892627 8.617068,13.031297 C8.3441436,13.0733314 8.0888191,12.886158 8.04678476,12.6132336 C8.0157088,12.4114607 8,12.2066255 8,12 C8,9.790861 9.790861,8 12,8 C12.2088473,8 12.4158635,8.01604843 12.6197345,8.04779147 Z M11.4558981,15.9632446 C11.1822806,15.9259875 10.9906726,15.6739739 11.0279297,15.4003565 C11.0651868,15.126739 11.3172004,14.935131 11.5908178,14.9723881 C11.7255265,14.9907307 11.8621112,15 12,15 C13.6568542,15 15,13.6568542 15,12 C15,11.8784426 14.9927963,11.7578934 14.978521,11.6387409 C14.9456721,11.3645592 15.141311,11.1156619 15.4154926,11.082813 C15.6896742,11.0499641 15.9385716,11.245603 15.9714205,11.5197846 C15.9904226,11.6783906 16,11.8386622 16,12 C16,14.209139 14.209139,16 12,16 C11.8169513,16 11.6352908,15.9876716 11.4558981,15.9632446 Z M3.85355339,20.8535534 C3.65829124,21.0488155 3.34170876,21.0488155 3.14644661,20.8535534 C2.95118446,20.6582912 2.95118446,20.3417088 3.14644661,20.1464466 L20.1464466,3.14644661 C20.3417088,2.95118446 20.6582912,2.95118446 20.8535534,3.14644661 C21.0488155,3.34170876 21.0488155,3.65829124 20.8535534,3.85355339 L3.85355339,20.8535534 Z M18.432566,8.43781125 C18.2260636,8.25447724 18.2072819,7.93845237 18.3906159,7.73194994 C18.5739499,7.52544751 18.8899748,7.50666579 19.0964772,7.6899998 C20.3646628,8.81590202 21.3498091,10.2296464 21.9661807,11.8192361 C22.0112731,11.9355272 22.0112731,12.0644728 21.9661807,12.1807639 C19.908725,17.4868337 14.0572919,20.2432763 8.67270383,18.4747344 C8.41034999,18.3885656 8.26752383,18.1060321 8.35369268,17.8436783 C8.43986153,17.5813244 8.722395,17.4384983 8.98474884,17.5246671 C13.8031415,19.1072449 19.0352127,16.6911354 20.9616499,12.000042 C20.3996315,10.6326644 19.5338607,9.41554681 18.432566,8.43781125 Z" fill="#787B80"></path> </g></svg>)
                                    : (<svg width="23" height="24" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g opacity="0.7">
                                            <path d="M11.0355 6.5C14.521 6.5 17.6293 8.63 19.1468 12C17.6293 15.37 14.5301 17.5 11.0355 17.5C7.54086 17.5 4.44167 15.37 2.92426 12C4.44167 8.63 7.55006 6.5 11.0355 6.5ZM11.0355 4.5C6.43729 4.5 2.51042 7.61 0.919434 12C2.51042 16.39 6.43729 19.5 11.0355 19.5C15.6337 19.5 19.5606 16.39 21.1516 12C19.5606 7.61 15.6337 4.5 11.0355 4.5ZM11.0355 9.5C12.3046 9.5 13.3346 10.62 13.3346 12C13.3346 13.38 12.3046 14.5 11.0355 14.5C9.7664 14.5 8.7364 13.38 8.7364 12C8.7364 10.62 9.7664 9.5 11.0355 9.5ZM11.0355 7.5C8.75479 7.5 6.89711 9.52 6.89711 12C6.89711 14.48 8.75479 16.5 11.0355 16.5C13.3162 16.5 15.1739 14.48 15.1739 12C15.1739 9.52 13.3162 7.5 11.0355 7.5Z" fill="#787B80" />
                                        </g>
                                    </svg>
                                    )}
                            </div>
                        </div>
                        {errors.password && <span className={styles["error-message"]}>{errors.password.message}</span>}

                        <div className={styles["options-row"]}>
                            <label className={styles["remember-me"]}>
                                <div className={styles["checkbox-container"]}>
                                    <input type="checkbox" id="remember" {...register("remember")} />
                                    <div className={styles.checkmark}>
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                                <span>Remember Me</span>
                            </label>

                            <span className={styles["forgot-password-text"]} onClick={() => navigate("/forgot-password")}>
                                Forgot Password?
                            </span>
                        </div>

                        <Button type="submit" className={styles["login-btn"]}>Log In</Button>

                        <div className={styles["google-signin-container"]}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="outline"
                                size="large"
                                width="100%"
                            />
                        </div>

                        <p className={styles["signup-text"]}>
                            Don't Have an account? <span onClick={() => navigate("/signup")}>Sign Up</span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};




// const response = await login(data.email, data.password);
// const user = response?.user || useAuthStore.getState().user;

// if (user?.interestTopic && user.interestTopic.length > 0) {
//     navigate("/home");
// } else {
//     navigate("/growth-zones");
// }