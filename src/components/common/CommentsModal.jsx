import React, { useState, useEffect } from "react";
import styles from "./CommentsModal.module.css";
import { Button } from "./Button";
import userImg from "../../assets/user.png";

/**
 * Reusable Comments Modal
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {Function} onClose - Function to close the modal
 * @param {Object} post - The post or question object to display
 *      Expected structure:
 *      {
 *          _id: string,
 *          content: string, (or body/heading)
 *          imageUrl?: string,
 *          author?: { username: string }, (or user/username)
 *          comments: Array<{
 *              _id: string,
 *              text: string,
 *              createdAt: string,
 *              user: { username: string } | string
 *          }>
 *      }
 * @param {Function} onAddComment - Async function to add a comment (postId, text)
 * @param {Object} currentUser - Current logged-in user (for optimistic updates/display)
 */
export const CommentsModal = ({
    isOpen,
    onClose,
    post,
    onAddComment,
    currentUser,
    getImageUrl
}) => {
    const [commentInput, setCommentInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset input when post changes
    useEffect(() => {
        setCommentInput("");
    }, [post?._id]);

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen || !post) return null;

    const handleSubmit = async () => {
        if (!commentInput.trim()) return;

        setIsSubmitting(true);
        try {
            await onAddComment(post._id, commentInput);
            setCommentInput("");
        } catch (error) {
            console.error("Failed to add comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTimeAgo = (date) => {
        if (!date) return '';
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    // Normalize Data
    const displayUsername = post.author?.username || post.username || "Anonymous";
    const displayContent = post.content || post.heading || post.body || "";


    return (
        <div className={styles["modal-overlay"]} onClick={onClose}>
            <div className={styles["modal"]} onClick={(e) => e.stopPropagation()}>
                {/* Modal Close Button */}
                <button className={styles["modal-close"]} onClick={onClose}>
                    ×
                </button>

                {/* Post Content in Modal */}
                <div className={styles["modal-post"]}>
                    {/* Post User Info */}
                    <div className={styles["post-user"]}>
                        <img src={userImg} alt="User" className={styles["post-avatar"]} />
                        <h4 className={styles["post-username"]}>
                            {displayUsername}
                        </h4>
                    </div>

                    {/* Post Body Text */}
                    {displayContent && (
                        <p className={styles["post-body-text"]}>{displayContent}</p>
                    )}
                    {/* Secondary Body Text (if heading and body exist) */}
                    {post.heading && post.body && (
                        <p className={styles["post-body-text"]}>{post.body}</p>
                    )}

                    {/* Post Image */}
                    {/* {post.imageUrl && getImageUrl && (
                        <img
                            src={getImageUrl(post.imageUrl)}
                            alt="Post"
                            className={styles["modal-image"]}
                        />
                    )} */}
                </div>

                {/* Comments Section */}
                <div className={styles["modal-comments"]}>
                    <h4 className={styles["modal-comments-title"]}>
                        Comments ({post.comments?.length || 0})
                    </h4>

                    {/* Comments List */}
                    <div className={styles["modal-comments-list"]}>
                        {(!post.comments || post.comments.length === 0) ? (
                            <p className={styles["comments-empty"]}>No comments yet. Be the first!</p>
                        ) : (
                            post.comments.map((comment, index) => {
                                // Determine username robustly
                                const commentUser = comment.user || {};
                                const commentUsername =
                                    commentUser.username ||
                                    ((commentUser === currentUser?._id || commentUser._id === currentUser?._id)
                                        ? currentUser?.username
                                        : "Anonymous");


                                return (
                                    <div key={comment._id || index} className={styles["comment-item"]}>
                                        <div className={styles["comment-header"]}>
                                            <span className={styles["comment-username"]}>
                                                {commentUsername}
                                            </span>
                                            <span className={styles["comment-time"]}>
                                                {formatTimeAgo(comment.createdAt)}
                                            </span>
                                        </div>
                                        <p className={styles["comment-text"]}>{comment.text}</p>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Comment Input */}
                    <div className={styles["modal-comment-input"]}>
                        <input
                            type="text"
                            placeholder="Write a comment..."
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            disabled={isSubmitting}
                        />
                        <Button
                            className={styles["comment-submit-btn"]}
                            onClick={handleSubmit}
                            disabled={isSubmitting || !commentInput.trim()}
                        >
                            {isSubmitting ? "..." : "Add"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
