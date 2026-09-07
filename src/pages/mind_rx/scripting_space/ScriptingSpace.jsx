import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { HeaderCard } from "../../../components/common/HeaderCard";

import useScriptStore from "../../../store/scriptStore";
import { BackButton } from "../../../components/common/BackButton";

import styles from "./ScriptingSpace.module.css";


export const ScriptingSpace = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newScript, setNewScript] = useState("");
  const [selectedScript, setSelectedScript] = useState(null);
  const navigate = useNavigate();

  // Edit mode state for modal
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const modalRef = useRef();

  // Get state and actions from the script store
  const {
    scripts,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    fetchScripts,
    createScript,
    updateScript,
    deleteScript
  } = useScriptStore();

  // Fetch scripts on component mount
  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleCloseModal();
      }
    };
    if (selectedScript) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedScript]);

  // Save a new script
  const handleSaveScript = async () => {
    // if (!newScript.trim()) return;
    // try {
    //   await createScript(newScript);
    //   setNewScript("");
    // } catch (error) {
    //   // Error is already handled by the store with toast
    // }

    if (!newScript.trim()) return;

    // Clean the content: remove extra spaces and empty lines
    const cleanedContent = newScript
      .split('\n')                          // Split by lines
      .map(line => line.trim())             // Trim each line
      .filter(line => line !== '')          // Remove empty lines
      .join(' ')                            // Join with single space (or use '\n' to keep line breaks)
      .replace(/\s+/g, ' ')                 // Replace multiple spaces with single space
      .trim();                              // Final trim

    if (!cleanedContent) return;

    try {
      await createScript(cleanedContent);
      setNewScript("");
    } catch (error) {
      // Error is already handled by the store with toast
    }
  };

  // Open modal with selected script
  const handleOpenScript = (script) => {
    setSelectedScript(script);
    setIsEditing(false);
    setShowDeleteConfirm(false);
  };

  // Close modal and reset states
  const handleCloseModal = () => {
    setSelectedScript(null);
    setIsEditing(false);
    setEditContent("");
    setShowDeleteConfirm(false);
  };

  // Enter edit mode
  const handleEditClick = () => {
    setEditContent(selectedScript.content);
    setIsEditing(true);
    setShowDeleteConfirm(false);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent("");
  };

  // Save edited script
  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    try {
      const updated = await updateScript(selectedScript._id, editContent, selectedScript.title);
      setSelectedScript(updated);
      setIsEditing(false);
      setEditContent("");
    } catch (error) {
      // Error is already handled by the store with toast
    }
  };

  // Show delete confirmation
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setIsEditing(false);
  };

  // Confirm and delete script
  const handleConfirmDelete = async () => {
    try {
      await deleteScript(selectedScript._id);
      handleCloseModal();
    } catch (error) {
      // Error is already handled by the store with toast
    }
  };

  // Cancel delete confirmation
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className={styles["ss-container"]}>
      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* MAIN CONTENT */}
      <main className={styles["ss-content"]}>
        {/* TOPBAR */}
        <Topbar pageTitle="Mind RX" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* BACK BUTTON */}
        <div className={styles['back-btn-container']}>
          <BackButton to="/mind-rx" />
        </div>

        {/* HEADER CARD */}
        <HeaderCard
          title="Scripting Space"
          subtitle="Write your future into reality."
          className={styles["ss-header-card"]}
        ></HeaderCard>

        {/* SCRIPT TEXT AREA */}
        <div className={styles["ss-textarea-card"]}>
          <textarea
            placeholder="Describe your feelings here, tap to start writing."
            value={newScript}
            onChange={(e) => setNewScript(e.target.value)}
            disabled={isCreating}
          />
          <button
            className={`${styles["ss-submit-btn"]} ${isCreating ? styles["btn-loading"] : ""}`}
            onClick={handleSaveScript}
            disabled={isCreating || !newScript.trim()}
          >
            {isCreating ? (
              <div className={styles["loading-spinner"]}></div>
            ) : (
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="10" fill="#00A5B7" />
                <path fillRule="evenodd" clipRule="evenodd" d="M12.5 6.25C11.837 6.25 11.2011 6.51339 10.7322 6.98223C10.2634 7.45107 10 8.08696 10 8.75V28.75C10 29.413 10.2634 30.0489 10.7322 30.5178C11.2011 30.9866 11.837 31.25 12.5 31.25H27.5C28.163 31.25 28.7989 30.9866 29.2678 30.5178C29.7366 30.0489 30 29.413 30 28.75V11.7675C29.9999 11.1045 29.7364 10.4687 29.2675 10L26.25 6.9825C25.7813 6.51363 25.1455 6.25014 24.4825 6.25H12.5ZM25.2975 17.2413C25.4169 17.1259 25.5121 16.988 25.5776 16.8355C25.6431 16.683 25.6776 16.519 25.6791 16.353C25.6805 16.187 25.6489 16.0224 25.586 15.8688C25.5232 15.7152 25.4304 15.5756 25.313 15.4583C25.1956 15.3409 25.0561 15.2481 24.9024 15.1852C24.7488 15.1224 24.5842 15.0907 24.4182 15.0922C24.2523 15.0936 24.0883 15.1281 23.9357 15.1936C23.7832 15.2591 23.6453 15.3544 23.53 15.4737L18.2275 20.7775L16.4587 19.0087C16.223 18.7811 15.9072 18.6551 15.5795 18.6579C15.2518 18.6608 14.9382 18.7922 14.7065 19.024C14.4747 19.2557 14.3433 19.5693 14.3404 19.897C14.3376 20.2247 14.4636 20.5405 14.6912 20.7763L17.2538 23.34C17.3814 23.4677 17.533 23.5691 17.6999 23.6382C17.8668 23.7074 18.0456 23.743 18.2263 23.743C18.4069 23.743 18.5857 23.7074 18.7526 23.6382C18.9195 23.5691 19.0711 23.4677 19.1988 23.34L25.2975 17.2413Z" fill="white" />
              </svg>
            )}
          </button>
        </div>

        {/* PAST SCRIPTS */}
        <div className={styles["ss-past-scripts-card"]}>
          <h4>Your past Scripts</h4>

          {/* Loading State */}
          {isLoading ? (
            <div className={styles["ss-loading-state"]}>
              <div className={styles["loading-spinner-large"]}></div>
              <p>Loading your scripts...</p>
            </div>
          ) : scripts.length > 0 ? (
            scripts.map((s, index) => (
              <div
                key={s._id}
                className={styles["ss-script-item"]}
                onClick={() => handleOpenScript(s)}
              >
                <span className={styles["ss-script-date"]}>{formatDate(s.createdAt)}</span>
                <p>{index + 1}. {s.content}</p>
              </div>
            ))
          ) : (
            <div className={styles["ss-no-scripts"]}>
              <p>No scripts found. Start writing above to see your history!</p>
            </div>
          )}
        </div>

        {/* POPUP MODAL */}
        {selectedScript && (
          <div className={styles["modal-overlay"]}>
            <div className={styles["modal-card"]} ref={modalRef}>
              <button className={styles["modal-close"]} onClick={handleCloseModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 18L18 6M6 6L18 18" stroke="#00A5B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <h5 className={styles["modal-date"]}>{formatDate(selectedScript.createdAt)}</h5>

              {/* View Mode */}
              {!isEditing && !showDeleteConfirm && (
                <>
                  <div className={styles["modal-body"]}>
                    {/* <p>{selectedScript.content}</p> */}
                    <p>{scripts.findIndex(s => s._id === selectedScript._id) + 1}. {selectedScript.content}</p>
                  </div>
                  <div className={styles["modal-actions"]}>
                    <button
                      className={styles["modal-edit-btn"]}
                      onClick={handleEditClick}
                    >
                      Edit
                    </button>
                    <button
                      className={styles["modal-delete-btn"]}
                      onClick={handleDeleteClick}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}

              {/* Edit Mode */}
              {isEditing && (
                <>
                  <div className={styles["modal-body"]}>
                    <textarea
                      className={styles["modal-edit-textarea"]}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      disabled={isUpdating}
                    />
                  </div>
                  <div className={styles["modal-actions"]}>
                    <button
                      className={styles["modal-save-btn"]}
                      onClick={handleSaveEdit}
                      disabled={isUpdating || !editContent.trim()}
                    >
                      {isUpdating ? "Saving..." : "Save"}
                    </button>
                    <button
                      className={styles["modal-cancel-btn"]}
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {/* Delete Confirmation */}
              {showDeleteConfirm && (
                <>
                  <div className={styles["modal-body"]}>
                    <p className={styles["delete-confirm-text"]}>
                      Are you sure you want to delete this script? This action cannot be undone.
                    </p>
                  </div>
                  <div className={styles["modal-actions"]}>
                    <button
                      className={styles["modal-delete-confirm-btn"]}
                      onClick={handleConfirmDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Yes, Delete"}
                    </button>
                    <button
                      className={styles["modal-cancel-btn"]}
                      onClick={handleCancelDelete}
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};