import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { HeaderCard } from "../../../components/common/HeaderCard";

import useStudyBuddyStore from "../../../store/studyBuddyStore";
import api from "../../../config/axiosInstance";
import socket from "../../../config/socket";

import styles from "./StudyBuddyInbox.module.css";

export const StudyBuddyInbox = () => {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [requestDetails, setRequestDetails] = useState(null);
    const [threads, setThreads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const currentUser = useStudyBuddyStore((state) => state.currentUser); // If store has user, otherwise use authStore directly if needed. 
    // Actually, let's use the API directly to be safe and consistent with Chat component or use store hook if available.

    useEffect(() => {
        const fetchRequestDetails = async () => {
            setIsLoading(true);
            try {
                // Fetch all study requests to find ours (reusing existing API pattern)
                const response = await api.get('/user/getAllStudyRequests');
                const allRequests = response.data.data || [];
                const currentRequest = allRequests.find(r => r._id === requestId);

                if (currentRequest) {
                    setRequestDetails(currentRequest);

                    // Group replies by user
                    if (currentRequest.replies) {
                        const grouped = currentRequest.replies.reduce((acc, reply) => {
                            // Identify the other participant (not the creator/me, unless I replied to myself)
                            // But usually, in inbox, we want to see WHO replied.
                            const replyUser = reply.user;
                            const userId = replyUser?._id || replyUser; // Handle populated vs unpopulated

                            // If user is ME (Creator), I am replying to someone, but who?
                            // The current backend structure is a flat list of replies.
                            // Limitation: If I (creator) reply, there's no "to" field.
                            // Assumption: If creator replies, it's usually the latest in a thread.
                            // BUT, for the inbox, we mainly care about INCOMING messages from others.
                            // So let's group by the "Sender" if they are NOT the creator.

                            const creatorId = currentRequest.creator?._id || currentRequest.creator;

                            // Only create threads for other users
                            if (userId !== creatorId) {
                                if (!acc[userId]) {
                                    acc[userId] = {
                                        user: replyUser,
                                        messages: [],
                                        lastMessage: null
                                    };
                                }
                                acc[userId].messages.push(reply);
                                // Update last message
                                if (!acc[userId].lastMessage || new Date(reply.createdAt) > new Date(acc[userId].lastMessage.createdAt)) {
                                    acc[userId].lastMessage = reply;
                                }
                            }
                            return acc;
                        }, {});

                        // Convert to array and sort by latest message
                        const threadArray = Object.values(grouped).map(thread => {
                            // Check if unread
                            const lastViewed = localStorage.getItem(`lastViewed_${requestId}_${thread.user?._id || thread.user}`);
                            const lastMsgTime = new Date(thread.lastMessage.createdAt).getTime();
                            const viewTime = lastViewed ? new Date(lastViewed).getTime() : 0;

                            // It is unread if the message is newer than the last view time
                            // AND the message was NOT sent by me (assuming I don't need to read my own messages)
                            // But wait, "thread.lastMessage" might be from ME. 
                            // If I replied, it's "read" effectively.
                            const currentUserId = currentUser?.id || currentUser?._id;
                            const senderId = thread.lastMessage.user?._id || thread.lastMessage.user;

                            const isMe = String(senderId) === String(currentUserId);

                            return {
                                ...thread,
                                isUnread: !isMe && lastMsgTime > viewTime
                            };
                        }).sort((a, b) => {
                            // Sort by Unread first, then by Date
                            if (a.isUnread !== b.isUnread) {
                                return a.isUnread ? -1 : 1;
                            }
                            return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
                        });

                        setThreads(threadArray);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch request details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (requestId) {
            fetchRequestDetails();

            // Listen for updates
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

    const handleThreadClick = (userId) => {
        // Mark as read locally
        localStorage.setItem(`lastViewed_${requestId}_${userId}`, new Date().toISOString());
        navigate(`/community/study-buddy-requests/chat/${requestId}?userId=${userId}`);
    };

    return (
        <div className={styles["sb-inbox-page"]}>
            <Sidebar sidebarOpen={sidebarOpen} />

            <main className={styles["sb-main-area"]}>
                <Topbar pageTitle="Inbox" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <HeaderCard
                    title="Message Inbox"
                    subtitle={requestDetails ? `REPLIES FOR: ${requestDetails.goal}` : "Your Study Buddy Messages"}
                    className={styles["sb-header-card"]}
                />

                <button className={styles['back-btn']} onClick={() => navigate("/community/study-buddy-requests")}>
                    <svg width="20" height="20" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#072445"><path d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"></path><path d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"></path></svg>
                    Back to Requests
                </button>

                <div className={styles["sb-inbox-container"]}>
                    {isLoading ? (
                        <div className={styles["sb-empty-state"]}>Loading messages...</div>
                    ) : threads.length > 0 ? (
                        threads.map((thread) => (
                            <div
                                key={thread.user._id || thread.user}
                                className={styles["sb-message-card"]}
                                onClick={() => handleThreadClick(thread.user._id || thread.user)}
                            >
                                <div className={styles["sb-avatar"]}>
                                    {thread.user.username ? thread.user.username.charAt(0).toUpperCase() : "?"}
                                </div>
                                <div className={styles["sb-message-content"]}>
                                    <div className={styles["sb-message-header"]}>
                                        <span className={styles["sb-username"]}>{thread.user.username || "Unknown User"}</span>
                                        <span className={styles["sb-timestamp"]}>
                                            {new Date(thread.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </span>
                                    </div>
                                    <p className={styles["sb-preview"]}>{thread.lastMessage.message}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles["sb-empty-state"]}>
                            <p>No replies yet. Wait for someone to connect!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
