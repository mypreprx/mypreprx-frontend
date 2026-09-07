import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import useMichelleStore from "../../store/michelleStore";
import useAuthStore from "../../store/authStore";
import { getAvatarUrl } from "../../config/avatarUrl";
import styles from "./ChatInterface.module.css";
import userImg from "../../assets/user.png";
import aiImg from "../../assets/ai-avatar.png";

export const ChatInterface = ({ chatHistory, initialMessage = "" }) => {
    const [showHistory, setShowHistory] = useState(false);
    const [localMessage, setLocalMessage] = useState("");
    const dropdownRef = useRef(null);
    const messagesEndRef = useRef(null);

    const user = useAuthStore((state) => state.user);
    const { messages, isLoading, sendMessage, loadSession, startNewChat } = useMichelleStore();
    const userAvatar = getAvatarUrl(user, userImg);

    // Pre-fill the input if an initialMessage is provided (e.g. from Quiz "Ask Michelle")
    useEffect(() => {
        if (initialMessage) {
            setLocalMessage(initialMessage);
        }
    }, [initialMessage]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowHistory(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Auto-scroll when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // Dynamic greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        if (hour < 21) return "Good evening";
        return "Good night";
    };

    const handleSend = async () => {
        if (!localMessage.trim() || isLoading) return;

        await sendMessage(localMessage);
        setLocalMessage("");
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleNewChat = () => {
        startNewChat();
        setShowHistory(false);
    };

    const handleHistoryClick = (sessionId) => {
        loadSession(sessionId);
        setShowHistory(false);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    return (
        <div className={styles["chat-container"]}>
            {/* HEADER SECTION */}
            <div className={styles["chat-header-row"]}>
                <button
                    className={styles["history-toggle"]}
                    onClick={() => setShowHistory(!showHistory)}
                >
                    <div className={styles["burger-line"]}></div>
                    <div className={styles["burger-line"]}></div>
                    <div className={styles["burger-line"]}></div>
                </button>

                <div className={styles["chat-title-card"]}>
                    <h2>Michelle</h2>
                </div>
            </div>

            {/* HISTORY DROPDOWN */}
            {showHistory && (
                <div className={styles["history-dropdown"]} ref={dropdownRef}>
                    <div className={styles["history-header"]} onClick={handleNewChat} style={{ cursor: 'pointer' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="24" height="24" rx="6" fill="#00A5B7" />
                            <path d="M12 4.5C16.5833 4.5 20.3333 7.48333 20.3333 11.1667C20.3333 14.85 16.5833 17.8333 12 17.8333C10.9666 17.8333 9.97496 17.6833 9.05829 17.4167C6.62496 19.5 3.66663 19.5 3.66663 19.5C5.60829 17.5583 5.91663 16.25 5.95829 15.75C4.54163 14.5583 3.66663 12.9417 3.66663 11.1667C3.66663 7.48333 7.41663 4.5 12 4.5Z" fill="white" />
                        </svg>
                        <span>New Chat</span>
                    </div>
                    <div className={styles["history-subtitle"]}>My Stuff ▾</div>
                    {chatHistory && chatHistory.length > 0 ? (
                        chatHistory.map((item) => (
                            <div
                                key={item._id}
                                className={styles["history-item"]}
                                onClick={() => handleHistoryClick(item._id)}
                            >
                                <div className={styles["history-content"]}>
                                    <span className={styles["history-title"]} title={item.title}>{item.title}</span>
                                    <span className={styles["history-date"]}>
                                        {new Date(item.updatedAt || item.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short', hour12: true })}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles["history-item"]}>No history yet</div>
                    )}
                </div>
            )}

            {/* MESSAGES AREA */}
            <div className={styles["chat-messages-area"]}>
                <span className={styles["chat-timestamp"]}>Today</span>

                {messages.length === 0 && (
                    <div className={styles["msg-ai-wrapper"]}>
                        <img src={aiImg} alt="AI" className={styles["ai-mini-avatar"]} />
                        <div className={styles["msg-ai"]}>
                            <p>{getGreeting()}! How can I help you today?</p>
                        </div>
                    </div>
                )}

                {messages.map((msg, index) => (
                    msg.role === 'user' ? (
                        <div key={index} className={styles["msg-user-wrapper"]}>
                            <img src={userAvatar} alt="User" className={styles["user-mini-avatar"]} />
                            <div className={styles["msg-user-container"]}>
                                <div className={styles["msg-user"]}>
                                    <p>{msg.content}</p>
                                </div>
                                <button
                                    className={styles["copy-btn"]}
                                    onClick={() => copyToClipboard(msg.content)}
                                    title="Copy message"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div key={index} className={styles["msg-ai-wrapper"]}>
                            <img src={aiImg} alt="AI" className={styles["ai-mini-avatar"]} />
                            <div className={styles["msg-ai-container"]}>
                                <div className={styles["msg-ai"]}>
                                    <p>{msg.content}</p>
                                </div>
                                <button
                                    className={styles["copy-btn"]}
                                    onClick={() => copyToClipboard(msg.content)}
                                    title="Copy message"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                </button>
                            </div>
                        </div>
                    )
                ))}

                {isLoading && (
                    <div className={styles["msg-ai-wrapper"]}>
                        <img src={aiImg} alt="AI" className={styles["ai-mini-avatar"]} />
                        <div className={styles["msg-ai"]}>
                            <div className={styles["typing-indicator"]}>
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Anchor for auto-scroll */}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className={styles["input-wrapper"]}>
                <div className={styles["input-field-container"]}>
                    <input
                        type="text"
                        placeholder="Type something..."
                        value={localMessage}
                        onChange={(e) => setLocalMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                    />
                    {/* <button className={styles["attach-btn"]}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.643 5.83333L7.1548 11.3215C6.50393 11.9724 6.50393 13.0276 7.1548 13.6785C7.80568 14.3294 8.86095 14.3294 9.51183 13.6785L14.857 8.19036C16.1588 6.88861 16.1588 4.77806 14.857 3.47631C13.5553 2.17456 11.4447 2.17456 10.143 3.47631L4.79778 8.96447C2.84516 10.9171 2.84516 14.0829 4.79778 16.0355C6.7504 17.9882 9.91623 17.9882 11.8688 16.0355L17.0833 10.8333" stroke="#083862" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button> */}
                </div>
                <button
                    className={styles["send-btn"]}
                    onClick={handleSend}
                    disabled={isLoading || !localMessage.trim()}
                    style={{ opacity: isLoading || !localMessage.trim() ? 0.5 : 1 }}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.4472 10.8944C17.786 10.725 18 10.3788 18 10C18 9.62124 17.786 9.27498 17.4472 9.10558L3.44721 2.10558C3.09251 1.92823 2.66653 1.97724 2.36136 2.2305C2.0562 2.48376 1.92953 2.89342 2.03848 3.27473L3.46704 8.27472C3.5897 8.70402 3.98209 9 4.42857 9H9C9.55229 9 10 9.44772 10 10C10 10.5523 9.55229 11 9 11L4.42857 11C3.98209 11 3.58971 11.296 3.46705 11.7253L2.03848 16.7253C1.92953 17.1066 2.0562 17.5163 2.36136 17.7695C2.66653 18.0228 3.09251 18.0718 3.44721 17.8944L17.4472 10.8944Z" fill="#00A5B7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};