import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { HeaderCard } from "../../../components/common/HeaderCard";
import { Button } from "../../../components/common/Button";
import { BackButton } from "../../../components/common/BackButton";

import useStudyBuddyStore from "../../../store/studyBuddyStore";

import styles from "./CreateStudyRequest.module.css";



export const CreateStudyRequest = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    // Refs for auto-jump
    const hrRef = useRef(null);
    const minRef = useRef(null);

    // Form state
    const [topicId, setTopicId] = useState("");
    const [goal, setGoal] = useState("");
    // const [availability, setAvailability] = useState("");
    const [time, setTime] = useState({ hrs: "", mins: "" });
    const [period, setPeriod] = useState("PM"); // Default to PM

    // Get state and actions from the store
    const {
        topics,
        isCreating,
        fetchTopics,
        createRequest
    } = useStudyBuddyStore();

    // Fetch topics on mount
    useEffect(() => {
        fetchTopics();
    }, [fetchTopics]);

    const handleTimeChange = (field, value) => {
        if (/^\d{0,2}$/.test(value)) {
            const numValue = parseInt(value, 10);
            // Strict Validation
            if (field === "hrs" && numValue > 12) return;
            if (field === "mins" && numValue > 59) return;

            setTime(prev => ({ ...prev, [field]: value }));

            // Auto-jump to minutes
            if (field === "hrs" && value.length === 2) {
                minRef.current?.focus();
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Backspace" && time.mins === "") {
            hrRef.current?.focus();
        }
    };

    const handleBlur = (field) => {
        setTime(prev => {
            const value = prev[field];
            if (value && value.length === 1) {
                return { ...prev, [field]: value.padStart(2, '0') };
            }
            return prev;
        });
    };

    // Handle form submission
    // const handleSubmit = async () => {
    //     // Validation
    //     if (!topicId || !goal.trim() || !availability.trim()) {
    //         return;
    //     }

    //     try {
    //         await createRequest({
    //             topicId,
    //             goal: goal.trim(),
    //             availability: `${availability.trim()} ${period}`
    //         });
    //         // Navigate back to requests list on success
    //         navigate("/community/study-buddy-requests");
    //     } catch (error) {
    //         // Error is handled by the store with toast
    //     }
    // };

    const handleSubmit = async () => {
        const { hrs, mins } = time;
        if (!topicId || !goal.trim() || !hrs || !mins) return;

        // Ensure 08:05 format even if user didn't trigger blur
        const formattedHrs = hrs.padStart(2, '0');
        const formattedMins = mins.padStart(2, '0');

        try {
            await createRequest({
                topicId,
                goal: goal.trim(),
                availability: `${formattedHrs}:${formattedMins} ${period}`
            });
            navigate("/community/study-buddy-requests");
        } catch (error) {
            // Error handled by store
        }
    };


    return (
        <div className={styles["csr-container"]}>
            {/* SIDEBAR */}
            <Sidebar sidebarOpen={sidebarOpen} />

            {/* MAIN CONTENT */}
            <main className={styles["csr-content-area"]}>
                {/* TOPBAR */}
                <Topbar pageTitle="Community" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                {/* BACK BUTTON */}
                <div className={styles["csr-back-btn-container"]}>
                    <BackButton to="/community/study-buddy-requests" />
                </div>

                {/* HEADER */}
                <HeaderCard
                    title="Create Study Request"
                    subtitle="Find  your perfect study partner."
                    className={styles["csr-topics-header"]}
                />

                {/* STUDY REQUEST CARD */}
                <div className={styles["csr-request-card"]}>
                    {/* Looking for help with */}
                    <div className={styles["csr-input-card"]}>
                        <label>Looking for help with</label>
                        <select
                            value={topicId}
                            onChange={(e) => setTopicId(e.target.value)}
                            disabled={isCreating}
                        >
                            <option value="">Select a topic</option>
                            {topics.map((topic) => (
                                <option key={topic._id} value={topic._id}>
                                    {topic.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Your Goal */}
                    <div className={styles["csr-input-card"]}>
                        <label>Your Goal</label>
                        <input
                            type="text"
                            placeholder="e.g., Need a partner to practice with"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            disabled={isCreating}
                        />
                    </div>

                    {/* Your Availability */}
                    {/* <div className={styles["csr-input-card"]}>
                        <label>Your Availability</label>
                        <div className={styles["csr-time-input-group"]}>
                            <input
                                type="text"
                                placeholder="e.g., 8:00"
                                value={availability}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Allow only digits and colon
                                    if (/^[\d:]*$/.test(value)) {
                                        setAvailability(value);
                                    }
                                }}
                                disabled={isCreating}
                                className={styles["csr-time-input"]}
                            />
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                disabled={isCreating}
                                className={styles["csr-period-select"]}
                            >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                            </select>
                        </div>
                    </div> */}

                    {/* Your Availability */}
                    <div className={styles["csr-input-card"]}>
                        <label>Your Availability</label>
                        <div className={styles["csr-time-input-group"]}>
                            <div className={styles["csr-time-box"]}>
                                <input
                                    ref={hrRef}
                                    type="text"
                                    placeholder="00"
                                    value={time.hrs}
                                    onChange={(e) => handleTimeChange("hrs", e.target.value)}
                                    onBlur={() => handleBlur("hrs")}
                                    disabled={isCreating}
                                    className={styles["csr-time-unit-input"]}
                                />
                                <span className={styles["csr-separator"]}>:</span>
                                <input
                                    ref={minRef}
                                    type="text"
                                    placeholder="00"
                                    value={time.mins}
                                    onChange={(e) => handleTimeChange("mins", e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onBlur={() => handleBlur("mins")}
                                    disabled={isCreating}
                                    className={styles["csr-time-unit-input"]}
                                />
                            </div>
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                disabled={isCreating}
                                className={styles["csr-period-select"]}
                            >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles["csr-post-btn-container"]}>
                        {/* <Button
                            className={styles["csr-post-btn"]}
                            onClick={handleSubmit}
                            disabled={isCreating || !topicId || !goal.trim() || !availability.trim()}
                        >
                            {isCreating ? "Posting..." : "Post Request"}
                        </Button> */}
                        <Button
                            className={styles["csr-post-btn"]}
                            onClick={handleSubmit}
                            disabled={isCreating || !topicId || !goal.trim() || !time.hrs || !time.mins}
                        >
                            {isCreating ? "Posting..." : "Post Request"}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
};