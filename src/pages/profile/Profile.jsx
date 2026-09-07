import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/common/sidebar/Sidebar";
import { Topbar } from "../../components/common/topbar/Topbar";
import "./Profile.css";
import userImg from "../../assets/user.png";
import useAuthStore from "../../store/authStore";
import ConfirmationModal from "../../components/common/modal/ConfirmationModal";
import api from "../../config/axiosInstance";
import toast from "react-hot-toast";
import { getAvatarUrl } from "../../config/avatarUrl";

export const Profile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, setUser } = useAuthStore();
  const user = useAuthStore((state) => state.user);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [viewImage, setViewImage] = useState(false); // lightbox

  // Form state
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(user?.profileImage || null);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  const handleLogoutClick = () => setIsLogoutModalOpen(true);

  const confirmLogout = async () => {
    await logout();
    setIsLogoutModalOpen(false);
    window.location.href = "/login";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setIsSaving(true);
    try {
      const fd = new FormData();
      if (username) fd.append("username", username);
      if (email) fd.append("email", email);
      if (password) fd.append("password", password);
      if (profileImage) fd.append("profilePicture", profileImage);
      const response = await api.put("/user/update-profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // ✅ Update Zustand store → topbar/rightbar avatars refresh instantly
      if (response.data?.user) setUser(response.data.user);
      toast.success("Profile updated successfully!");
      setPassword("");
      setConfirmPassword("");
      setProfileImage(null);
      setPreviewImage(null); // clear blob so helper reads updated DB URL
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Use blob preview while user has picked a file (instant feedback),
  // otherwise fall back to the DB-stored URL via the helper
  const avatarSrc = previewImage || getAvatarUrl(user, userImg);

  return (
    <div className="profile-layout">
      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* MAIN */}
      <div className="profile-main">
        {/* TOPBAR — shared component */}
        <Topbar
          pageTitle="My Profile"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* ── PROFILE CONTENT ── */}
        <div className="profile-content">

          {/* Hero banner */}
          <div className="profile-hero">
            <div className="profile-hero-inner">
              {/* Avatar — click to VIEW full photo */}
              <div
                className="profile-avatar-wrap"
                onClick={() => setViewImage(true)}
                title="Click to view photo"
                style={{ cursor: "pointer" }}
              >
                <img src={avatarSrc} className="profile-avatar-img" alt="avatar" />
                {/* eye icon overlay */}
                <div className="profile-avatar-view-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 6.5C15.79 6.5 19.17 8.63 20.82 12C19.17 15.37 15.8 17.5 12 17.5C8.2 17.5 4.83 15.37 3.18 12C4.83 8.63 8.21 6.5 12 6.5ZM12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 9.5C13.38 9.5 14.5 10.62 14.5 12C14.5 13.38 13.38 14.5 12 14.5C10.62 14.5 9.5 13.38 9.5 12C9.5 10.62 10.62 9.5 12 9.5ZM12 7.5C9.52 7.5 7.5 9.52 7.5 12C7.5 14.48 9.52 16.5 12 16.5C14.48 16.5 16.5 14.48 16.5 12C16.5 9.52 14.48 7.5 12 7.5Z" fill="white" />
                  </svg>
                </div>
              </div>

              {/* Name + email display */}
              <div className="profile-hero-info">
                <h2 className="profile-hero-name">{user?.username || "Guest"}</h2>
                <p className="profile-hero-email">{user?.email || ""}</p>
              </div>
            </div>
          </div>

          {/* Form card */}
          <div className="profile-card-outer">
            <div className="profile-card">
              <h3 className="profile-card-title">Edit Profile</h3>

              {/* ── Avatar upload inside card ── */}
              <div className="pf-avatar-section">
                <div className="pf-avatar-preview-wrap">
                  <img src={avatarSrc} className="pf-avatar-preview" alt="avatar preview" />
                  {previewImage && (
                    <span className="pf-avatar-badge">New</span>
                  )}
                </div>
                <div className="pf-avatar-actions">
                  <p className="pf-avatar-label">Profile Photo</p>
                  <p className="pf-avatar-hint">JPG, PNG or GIF · Max 5 MB</p>
                  <div className="pf-avatar-btns">
                    <label htmlFor="profilePicInput" className="pf-upload-btn">
                      📷 Upload Photo
                    </label>
                    <input
                      id="profilePicInput"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageChange}
                    />
                    {previewImage && (
                      <button
                        className="pf-remove-btn"
                        onClick={() => { setPreviewImage(null); setProfileImage(null); }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="profile-form-grid">
                {/* Username */}
                <div className="pf-field">
                  <label className="pf-label">Username</label>
                  <div className="pf-input-wrap">
                    <svg className="pf-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 6C13.1 6 14 6.9 14 8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8C10 6.9 10.9 6 12 6ZM12 16C14.7 16 17.8 17.29 18 18H6C6.23 17.28 9.31 16 12 16ZM12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#083862" />
                    </svg>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your username"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="pf-field">
                  <label className="pf-label">Email Address</label>
                  <div className="pf-input-wrap">
                    <svg className="pf-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V8L12 13L20 8V18ZM12 11L4 6H20L12 11Z" fill="#083862" />
                    </svg>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="pf-field">
                  <label className="pf-label">New Password</label>
                  <div className="pf-input-wrap">
                    <svg className="pf-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M18 8.5H17V6.5C17 3.74 14.76 1.5 12 1.5C9.24 1.5 7 3.74 7 6.5V8.5H6C4.9 8.5 4 9.4 4 10.5V20.5C4 21.6 4.9 22.5 6 22.5H18C19.1 22.5 20 21.6 20 20.5V10.5C20 9.4 19.1 8.5 18 8.5ZM9 6.5C9 4.84 10.34 3.5 12 3.5C13.66 3.5 15 4.84 15 6.5V8.5H9V6.5ZM18 20.5H6V10.5H18V20.5ZM12 17.5C13.1 17.5 14 16.6 14 15.5C14 14.4 13.1 13.5 12 13.5C10.9 13.5 10 14.4 10 15.5C10 16.6 10.9 17.5 12 17.5Z" fill="#083862" />
                    </svg>
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank to keep current"
                    />
                    <button type="button" className="pf-eye" onClick={() => setShowPass(v => !v)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <g opacity="0.6">
                          <path d="M12 6.5C15.79 6.5 19.17 8.63 20.82 12C19.17 15.37 15.8 17.5 12 17.5C8.2 17.5 4.83 15.37 3.18 12C4.83 8.63 8.21 6.5 12 6.5ZM12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 9.5C13.38 9.5 14.5 10.62 14.5 12C14.5 13.38 13.38 14.5 12 14.5C10.62 14.5 9.5 13.38 9.5 12C9.5 10.62 10.62 9.5 12 9.5ZM12 7.5C9.52 7.5 7.5 9.52 7.5 12C7.5 14.48 9.52 16.5 12 16.5C14.48 16.5 16.5 14.48 16.5 12C16.5 9.52 14.48 7.5 12 7.5Z" fill="#787B80" />
                        </g>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="pf-field">
                  <label className="pf-label">Confirm Password</label>
                  <div className="pf-input-wrap">
                    <svg className="pf-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M18 8.5H17V6.5C17 3.74 14.76 1.5 12 1.5C9.24 1.5 7 3.74 7 6.5V8.5H6C4.9 8.5 4 9.4 4 10.5V20.5C4 21.6 4.9 22.5 6 22.5H18C19.1 22.5 20 21.6 20 20.5V10.5C20 9.4 19.1 8.5 18 8.5ZM9 6.5C9 4.84 10.34 3.5 12 3.5C13.66 3.5 15 4.84 15 6.5V8.5H9V6.5ZM18 20.5H6V10.5H18V20.5ZM12 17.5C13.1 17.5 14 16.6 14 15.5C14 14.4 13.1 13.5 12 13.5C10.9 13.5 10 14.4 10 15.5C10 16.6 10.9 17.5 12 17.5Z" fill="#083862" />
                    </svg>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                    <button type="button" className="pf-eye" onClick={() => setShowConfirm(v => !v)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <g opacity="0.6">
                          <path d="M12 6.5C15.79 6.5 19.17 8.63 20.82 12C19.17 15.37 15.8 17.5 12 17.5C8.2 17.5 4.83 15.37 3.18 12C4.83 8.63 8.21 6.5 12 6.5ZM12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 9.5C13.38 9.5 14.5 10.62 14.5 12C14.5 13.38 13.38 14.5 12 14.5C10.62 14.5 9.5 13.38 9.5 12C9.5 10.62 10.62 9.5 12 9.5ZM12 7.5C9.52 7.5 7.5 9.52 7.5 12C7.5 14.48 9.52 16.5 12 16.5C14.48 16.5 16.5 14.48 16.5 12C16.5 9.52 14.48 7.5 12 7.5Z" fill="#787B80" />
                        </g>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="profile-actions">
                <button className="profile-save-btn" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving…" : "Save Changes"}
                </button>
                <button className="profile-logout-btn" onClick={handleLogoutClick}>
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lightbox: view full profile photo ── */}
      {viewImage && (
        <div className="pf-lightbox-overlay" onClick={() => setViewImage(false)}>
          <div className="pf-lightbox-box" onClick={(e) => e.stopPropagation()}>
            <button className="pf-lightbox-close" onClick={() => setViewImage(false)}>✕</button>
            <img src={avatarSrc} className="pf-lightbox-img" alt="Profile" />
            <p className="pf-lightbox-name">{user?.username || "Guest"}</p>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Log Out"
        message="Are you sure you want to log out?"
      />
    </div>
  );
};