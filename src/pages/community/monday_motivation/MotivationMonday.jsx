import { useState, useEffect, useRef } from "react";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { HeaderCard } from "../../../components/common/HeaderCard";
import { Button } from "../../../components/common/Button";
import { BackButton } from "../../../components/common/BackButton";

import styles from "./MotivationMonday.module.css";
import userImg from "../../../assets/user.png";

// Import stores for state management
import usePostStore from "../../../store/postStore";
import useAuthStore from "../../../store/authStore";
import { CommentsModal } from "../../../components/common/CommentsModal";

// Helper functions (restored)
// const formatTimeAgo = (date) => {
//   const now = new Date();
//   const past = new Date(date);
//   const diffMs = now - past;
//   const diffSecs = Math.floor(diffMs / 1000);
//   const diffMins = Math.floor(diffSecs / 60);
//   const diffHours = Math.floor(diffMins / 60);
//   const diffDays = Math.floor(diffHours / 24);

//   if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
//   if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
//   if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
//   return 'Just now';
// };

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // 1. Normalize Windows backslashes (\) to forward slashes (/)
  let normalizedPath = imageUrl.replace(/\\/g, '/');

  // 2. Find the "uploads/" folder in the path and strip away the "D:/PrepRx/Backend/" part
  const uploadsIndex = normalizedPath.indexOf('uploads/');
  if (uploadsIndex !== -1) {
    normalizedPath = normalizedPath.substring(uploadsIndex);
  }

  // 3. Ensure the path starts with a slash for clean concatenation
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath;
  }

  // 4. Dynamically pick the right server URL
  const serverURL = import.meta.env.PROD 
    ? 'https://api.mypreprx.com' 
    : 'http://localhost:4001';

  // Result locally: http://localhost:4001/uploads/images/1772568681942-Gemini...
  return `${serverURL}${normalizedPath}`;
};

export const MotivationMonday = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Post creation state
  const [postContent, setPostContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Comments Modal state
  const [selectedPost, setSelectedPost] = useState(null);
  // Removed local input state as it's now in the modal

  // Get store state and actions
  const { posts, isLoading, isCreatingPost, fetchPosts, createPost, toggleLike, addComment } = usePostStore();
  const { user } = useAuthStore();

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setSelectedPost(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  /**
   * Handle post creation - passes current user for immediate display
   */
  const handleCreatePost = async () => {
    // Validate: require at least text or image
    if (!postContent.trim() && !imageFile) return;

    try {
      // Pass user object so the new post shows username immediately
      await createPost(postContent, imageFile, user);
      // Clear inputs after successful post
      setPostContent("");
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      // Error already handled in store with toast
    }
  };

  /**
   * Handle image file selection
   */
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handle like button click
   */
  const handleLikeClick = (postId) => {
    toggleLike(postId);
  };

  /**
   * Open comments modal for a specific post
   */
  const handleOpenCommentsModal = (post) => {
    setSelectedPost(post);
  };

  /**
   * Close comments modal
   */
  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  /**
   * Handle comment submission from modal
   */
  const handleAddComment = async (postId, text) => {
    try {
      // Pass user object so the new comment shows username immediately
      await addComment(postId, text, user);
    } catch (error) {
      throw error; // Let modal handle error state
    }
  };

  // Keep selectedPost in sync with posts from store
  // useEffect(() => {
  //   if (selectedPost) {
  //     const updatedPost = posts.find(p => p._id === selectedPost._id);
  //     if (updatedPost) setSelectedPost(updatedPost);
  //   }
  // }, [posts, selectedPost?._id]);

  // Keep selectedPost in sync with posts from store, but preserve populated user data
  useEffect(() => {
    if (selectedPost) {
      const updatedPost = posts.find(p => p._id === selectedPost._id);

      if (updatedPost) {
        // FIX for Issue 1: Smart Merge
        // If the store update has unpopulated comments (just IDs), we don't want to lose 
        // the usernames we already have in selectedPost.

        const mergedComments = updatedPost.comments?.map(newComment => {
          // Try to find this comment in our existing state
          const existingComment = selectedPost.comments?.find(c => c._id === newComment._id);

          // Check if the new comment data is "worse" (unpopulated string) than what we have
          const newCommentUserIsString = typeof newComment.user === 'string';
          const existingCommentUserIsObject = existingComment?.user && typeof existingComment.user === 'object';

          // If we have a rich object locally, but the update is just a string ID, keep the rich object
          if (newCommentUserIsString && existingCommentUserIsObject) {
            return { ...newComment, user: existingComment.user };
          }

          return newComment;
        });

        // Update state with the merged comments
        setSelectedPost({ ...updatedPost, comments: mergedComments });
      }
    }
  }, [posts, selectedPost?._id]);

  /**
   * Get formatted date for header
   */
  const getFormattedDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div className={styles["mm-page"]}>
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* MAIN CONTENT */}
      <main className={styles["mm-main-area"]}>
        {/* TOPBAR */}
        <Topbar pageTitle="Community" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* CONTENT CONTAINER */}
        <div className={styles["mm-content-container"]}>
          {/* BACK BUTTON */}
          <div className={styles["mm-back-btn-container"]}>
            <BackButton to="/community" />
          </div>

          {/* HEADER CARD */}
          <HeaderCard
            title="Motivation Monday"
            subtitle={getFormattedDate()}
            className={styles["mm-header-card"]}
          />

          {/* SHARE BOX */}
          <div className={styles["mm-share-box"]}>
            {/* Image Preview */}
            {imagePreview && (
              <div className={styles["mm-image-preview"]}>
                <img src={imagePreview} alt="Preview" />
                <button
                  className={styles["mm-remove-image"]}
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                >
                  ×
                </button>
              </div>
            )}

            <input
              type="text"
              placeholder="Share your win!"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreatePost()}
              disabled={isCreatingPost}
            />

            {/* Hidden file input for image upload */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleImageSelect}
            />

            {/* CAMERA ICON (SEPARATE) */}
            <div
              className={styles["mm-share-camera"]}
              onClick={() => fileInputRef.current?.click()}
              style={{ cursor: 'pointer' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M13.997 4.00012C14.3578 4.00012 14.7119 4.09771 15.0217 4.28256C15.3316 4.46741 15.5856 4.73263 15.757 5.05012L16.243 5.95012C16.4144 6.26761 16.6684 6.53284 16.9783 6.71769C17.2881 6.90253 17.6422 7.00013 18.003 7.00012H20C20.5304 7.00012 21.0391 7.21084 21.4142 7.58591C21.7893 7.96098 22 8.46969 22 9.00012V18.0001C22 18.5306 21.7893 19.0393 21.4142 19.4143C21.0391 19.7894 20.5304 20.0001 20 20.0001H4C3.46957 20.0001 2.96086 19.7894 2.58579 19.4143C2.21071 19.0393 2 18.5306 2 18.0001V9.00012C2 8.46969 2.21071 7.96098 2.58579 7.58591C2.96086 7.21084 3.46957 7.00012 4 7.00012H5.997C6.35742 7.00014 6.71115 6.90276 7.02078 6.71829C7.33041 6.53381 7.58444 6.26909 7.756 5.95212L8.245 5.04812C8.41656 4.73115 8.67059 4.46643 8.98022 4.28196C9.28985 4.09748 9.64358 4.0001 10.004 4.00012H13.997Z"
                  stroke="#00A5B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 16.0002C13.6569 16.0002 15 14.6571 15 13.0002C15 11.3434 13.6569 10.0002 12 10.0002C10.3431 10.0002 9 11.3434 9 13.0002C9 14.6571 10.3431 16.0002 12 16.0002Z"
                  stroke="#00A5B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* POST BUTTON (SEPARATE)  */}
            <Button
              className={styles["mm-share-btn"]}
              onClick={handleCreatePost}
              disabled={isCreatingPost || (!postContent.trim() && !imageFile)}
            >
              {isCreatingPost ? "Posting..." : "Post"}
            </Button>
          </div>

          {/* POSTS CONTAINER */}
          <div className={styles["mm-posts-container"]}>
            {/* Loading State */}
            {isLoading && (
              <div className={styles["mm-loading"]}>Loading posts...</div>
            )}

            {/* Empty State */}
            {!isLoading && posts.length === 0 && (
              <div className={styles["mm-empty-state"]}>
                No posts yet. Be the first to share your win!
              </div>
            )}

            {/* Posts List */}
            {!isLoading && posts.map((post) => (
              <div key={post._id} className={styles["mm-post"]}>
                {/* Post User Info */}
                <div className={styles["mm-post-user"]}>
                  <img src={userImg} alt="User" className={styles["mm-post-avatar"]} />
                  <h4 className={styles["mm-post-username"]}>
                    {post.author?.username || "Anonymous"}
                  </h4>
                </div>

                {/* Post Body Text */}
                <p className={styles["mm-post-body-text"]}>{post.content}</p>

                {/* Post Image (if exists) */}
                {post.imageUrl && (
                  <img
                    src={getImageUrl(post.imageUrl)}
                    alt="Post"
                    className={styles["mm-post-image"]}
                  />
                )}

                {/* Post Footer - Likes and Comments */}
                <div className={styles["mm-post-footer"]}>
                  {/* Like Button */}
                  <div
                    className={styles["mm-footer-item"]}
                    onClick={() => handleLikeClick(post._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles["mm-icon mm-like-icon"]}>
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="32" height="32" rx="8" fill="#00A5B7" />
                        <g transform="translate(16 16) scale(0.8) translate(-16 -16)">
                          <path
                            d="M10.9998 7.11108C7.62478 7.11108 4.88867 9.8472 4.88867 13.2222C4.88867 19.3333 12.1109 24.8889 15.9998 26.1811C19.8887 24.8889 27.1109 19.3333 27.1109 13.2222C27.1109 9.8472 24.3748 7.11108 20.9998 7.11108C18.9331 7.11108 17.1053 8.1372 15.9998 9.70775C15.4362 8.90519 14.6875 8.2502 13.8172 7.79821C12.9469 7.34622 11.9805 7.11053 10.9998 7.11108Z"
                            fill={post.likes?.includes(user?._id) ? "#ff6b6b" : "white"}
                            stroke="white"
                            strokeWidth="2.22222"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                      </svg>
                    </div>
                    <span>{post.likes?.length || 0} likes</span>
                  </div>

                  {/* Comments Button - Opens Modal */}
                  <div
                    className={styles["mm-footer-item"]}
                    onClick={() => handleOpenCommentsModal(post)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles["mm-icon mm-comment-icon"]}>
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="32" height="32" rx="8" fill="#00A5B7" />
                        <g transform="translate(16 16) scale(0.8) translate(-16 -16)">
                          <path
                            d="M4.33398 10.1667C4.33398 9.0616 4.77297 8.00179 5.55437 7.22039C6.33577 6.43899 7.39558 6 8.50065 6H23.5007C24.6057 6 25.6655 6.43899 26.4469 7.22039C27.2283 8.00179 27.6673 9.0616 27.6673 10.1667V18.5C27.6673 19.0472 27.5595 19.589 27.3502 20.0945C27.1408 20.6 26.8338 21.0594 26.4469 21.4463C26.06 21.8332 25.6007 22.1401 25.0952 22.3495C24.5896 22.5589 24.0478 22.6667 23.5007 22.6667H17.1473L12.0423 27.1333C11.8061 27.3398 11.5154 27.4739 11.205 27.5196C10.8946 27.5652 10.5776 27.5205 10.2919 27.3908C10.0063 27.2611 9.76399 27.0518 9.59411 26.788C9.42424 26.5242 9.33393 26.2171 9.33398 25.9033V22.6667H8.50065C7.39558 22.6667 6.33577 22.2277 5.55437 21.4463C4.77297 20.6649 4.33398 19.6051 4.33398 18.5V10.1667ZM8.50065 7.66667C7.83761 7.66667 7.20173 7.93006 6.73288 8.3989C6.26404 8.86774 6.00065 9.50363 6.00065 10.1667V18.5C6.00065 19.163 6.26404 19.7989 6.73288 20.2678C7.20173 20.7366 7.83761 21 8.50065 21H11.0007V25.83L16.5207 21H23.5007C24.1637 21 24.7996 20.7366 25.2684 20.2678C25.7373 19.7989 26.0007 19.163 26.0007 18.5V10.1667C26.0007 9.50363 25.7373 8.86774 25.2684 8.3989C24.7996 7.93006 24.1637 7.66667 23.5007 7.66667H8.50065Z"
                            fill="white"
                          />
                        </g>
                      </svg>
                    </div>
                    <span>{post.comments?.length || 0} comments</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* COMMENTS MODAL */}
      <CommentsModal
        isOpen={!!selectedPost}
        onClose={handleCloseModal}
        post={selectedPost}
        onAddComment={handleAddComment}
        currentUser={user}
        getImageUrl={getImageUrl}
      />
    </div>
  );
};