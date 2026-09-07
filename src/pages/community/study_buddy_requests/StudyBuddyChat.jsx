import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { HeaderCard } from "../../../components/common/HeaderCard";

import useStudyBuddyStore from "../../../store/studyBuddyStore";
import useAuthStore from "../../../store/authStore";
import api from "../../../config/axiosInstance";
import socket from "../../../config/socket";

import styles from "./StudyBuddyChat.module.css";


export const StudyBuddyChat = () => {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Chat state
    const [message, setMessage] = useState("");
    const [requestDetails, setRequestDetails] = useState(null);
    const [replies, setReplies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Get current user
    const currentUser = useAuthStore((state) => state.user);

    // Get store actions
    const { isSending, sendMessage } = useStudyBuddyStore();

    // Ref for auto-scrolling
    const messagesEndRef = useRef(null);

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [replies]);

    const [searchParams] = useSearchParams();
    const targetUserId = searchParams.get("userId");

    // Fetch request details and replies
    useEffect(() => {
        // Inside StudyBuddyChat.js
        const fetchRequestDetails = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/user/getAllStudyRequests');
                const allRequests = response.data.data || [];
                const currentRequest = allRequests.find(r => r._id === requestId);

                if (currentRequest) {
                    setRequestDetails(currentRequest);
                    // const currentUserId = currentUser?._id || currentUser?.id;
                    // const creatorId = currentRequest.creator?._id || currentRequest.creator;

                    const filteredReplies = currentRequest.replies.filter(reply => {
                        // 1. Normalize all IDs to Strings to prevent comparison errors
                        const replyUserId = String(reply.user?._id || reply.user);
                        const creatorId = String(currentRequest.creator?._id || currentRequest.creator);
                        const currentUserId = String(currentUser?._id || currentUser?.id);
                        const targetId = targetUserId ? String(targetUserId) : null;

                        // 2. Logic for the Creator (A)
                        if (currentUserId === creatorId) {
                            // Only show messages with the person they selected from the inbox
                            return replyUserId === targetId || replyUserId === creatorId;
                        }

                        // 3. Logic for the Responder (B)
                        // Show messages if sent by me OR sent by the creator
                        // We add a check to ensure the creator's message was actually intended for THIS responder
                        return replyUserId === currentUserId || replyUserId === creatorId;
                    });

                    setReplies(filteredReplies);
                }
            } catch (error) {
                console.error('Fetch error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (requestId) {
            fetchRequestDetails();

            // Socket Listener
            socket.on('request_updated', (data) => {
                if (data.requestId === requestId) {
                    fetchRequestDetails();
                }
            });
        }

        return () => {
            socket.off('request_updated');
        };
    }, [requestId]);

    // Handle sending a message
    // const handleSendMessage = async () => {
    //     if (!message.trim() || isSending) return;

    //     try {
    //         const newReply = await sendMessage(requestId, message.trim());
    //         // Add the new reply to local state
    //         setReplies(prev => [...prev, {
    //             ...newReply,
    //             user: { username: currentUser?.name || 'You' }
    //         }]);
    //         setMessage("");
    //     } catch (error) {
    //         // Error handled by store
    //     }
    // };

    // Handle sending a message
    const handleSendMessage = async () => {
        if (!message.trim() || isSending) return;

        try {
            const newReply = await sendMessage(requestId, message.trim());
            const currentUserId = currentUser?._id || currentUser?.id;

            setReplies(prev => [...prev, {
                ...newReply,
                createdAt: new Date().toISOString(), // <--- ADD THIS LINE
                user: {
                    _id: currentUserId,
                    username: currentUser?.name || 'You'
                }
            }]);
            setMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    // Handle Enter key to send
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={styles["chat-container"]}>
            {/* SIDEBAR */}
            <Sidebar sidebarOpen={sidebarOpen} />

            {/* MAIN CONTENT */}
            <main className={styles["chat-main-area"]}>
                {/* TOPBAR */}
                <Topbar pageTitle="Community" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                {/* HEADER */}
                <HeaderCard
                    title="Study Buddy Chat"
                    subtitle={requestDetails ? `Chatting about: ${requestDetails.topicName}` : "Connect with your study buddy"}
                    className={styles["chat-header-card"]}
                />

                {/* Chat Container */}
                <div className={styles["chat-wrapper"]}>
                    {/* Back Button */}
                    <button
                        className={styles['back-btn']}
                        onClick={() => {
                            // If creator, back to inbox. If responder, back to requests list.
                            if (requestDetails?.isCreator) {
                                navigate(`/community/study-buddy-requests/inbox/${requestId}`);
                            } else {
                                navigate("/community/study-buddy-requests");
                            }
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#072445"><path d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"></path><path d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"></path></svg>
                        {requestDetails?.isCreator ? "Back to Inbox" : "Back to Requests"}
                    </button>

                    {/* Request Info Card */}
                    {requestDetails && (
                        <div className={styles["request-info-card"]}>
                            <div className={styles["request-info-header"]}>
                                <h4>{requestDetails.topicName}</h4>
                                <span className={styles["request-time"]}>Available at {requestDetails.time}</span>
                            </div>
                            <p className={styles["request-goal"]}>{requestDetails.goal}</p>
                            <p className={styles["request-creator"]}>
                                Posted by: <strong>{requestDetails.creatorName}</strong>
                            </p>
                        </div>
                    )}

                    {/* Messages Container */}
                    <div className={styles["messages-container"]}>
                        {isLoading ? (
                            <div className={styles["loading-state"]}>
                                <div className={styles["loading-spinner"]}></div>
                                <p>Loading chat...</p>
                            </div>
                        ) : replies.length > 0 ? (
                            <>
                                {replies.map((reply, index) => (
                                    <div
                                        key={reply._id || index}
                                        className={`${styles["message-bubble"]} ${(reply.user?._id || reply.user) === (currentUser?._id || currentUser?.id)
                                            ? styles["message-sent"]
                                            : styles["message-received"]
                                            }`}
                                    >
                                        <span className={styles["message-sender"]}>
                                            {(reply.user?._id || reply.user) === (currentUser?._id || currentUser?.id) ? "You" : (reply.user?.username || 'Unknown')}
                                        </span>
                                        <p className={styles["message-text"]}>{reply.message}</p>
                                        <span className={styles["message-time"]}>
                                            {/* {reply.createdAt
                                                ? new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                                                : 'Just now'
                                            } */}
                                            {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </span>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </>
                        ) : (
                            <div className={styles["empty-chat"]}>
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        )}
                    </div>

                    {/* Message Input */}
                    <div className={styles["message-input-container"]}>
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isSending}
                            className={styles["message-input"]}
                        />
                        <button
                            className={styles["send-btn"]}
                            onClick={handleSendMessage}
                            disabled={isSending || !message.trim()}
                        >
                            {isSending ? (
                                <div className={styles["send-spinner"]}></div>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 2L11 13" stroke="#083862" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#083862" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
