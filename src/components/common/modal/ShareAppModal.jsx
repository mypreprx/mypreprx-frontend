import React, { useState } from "react";
import toast from "react-hot-toast";
import styles from "./ShareAppModal.module.css";

// Production share URL: use the live origin when deployed (mypreprx.com),
// otherwise fall back to the production URL so the dev preview shares the real link.
const APP_URL =
    typeof window !== "undefined" &&
    !["localhost", "127.0.0.1"].includes(window.location.hostname)
        ? window.location.origin + "/"
        : "https://mypreprx.com/";

const SHARE_TEXT = "Check out PrepRX – Your Prescription for NCLEX Success!";
const SHARE_SUBJECT = "PrepRX – Your Prescription for NCLEX Success";
const SHARE_MESSAGE = `${SHARE_TEXT} ${APP_URL}`;

const ShareAppModal = ({ isOpen, onClose }) => {
    const [copied, setCopied] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setCopied(false);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const copyLinkToClipboard = async () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(APP_URL);
            } else {
                const ta = document.createElement("textarea");
                ta.value = APP_URL;
                ta.style.position = "fixed";
                ta.style.opacity = "0";
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
            }
            return true;
        } catch {
            return false;
        }
    };

    const handleCopyClick = async () => {
        const ok = await copyLinkToClipboard();
        if (ok) {
            setCopied(true);
            toast.success("Link copied!");
            setTimeout(() => setCopied(false), 2000);
        } else {
            toast.error("Could not copy. Please copy the link manually.");
        }
    };

    const openExternal = (url) => {
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const handleNativeShare = async () => {
        if (!navigator.share) return;
        try {
            await navigator.share({ title: SHARE_SUBJECT, text: SHARE_TEXT, url: APP_URL });
        } catch (err) {
            if (err?.name !== "AbortError") {
                // Delegating to manual options is enough; no need to alarm the user via toast
            }
        }
    };

    const handleInstagramShare = async () => {
        // Instagram has no direct web share intent — copy the link first, then let the user paste it
        const ok = await copyLinkToClipboard();
        if (ok) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success("Link copied — paste it in your Instagram story, post or DM!");
            openExternal("https://www.instagram.com/");
        } else {
            toast.error("Could not copy the link. Please copy it manually.");
        }
    };

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(SHARE_MESSAGE)}`;
    // Gmail web compose opens directly in any browser, even without a desktop mail client configured
    const emailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(SHARE_SUBJECT)}&body=${encodeURIComponent(`${SHARE_TEXT}\n\n${APP_URL}`)}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(APP_URL)}&text=${encodeURIComponent(SHARE_TEXT)}`;
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_MESSAGE)}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(APP_URL)}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(APP_URL)}&quote=${encodeURIComponent(SHARE_TEXT)}`;

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <h3 className={styles.title}>Share App</h3>
                <p className={styles.message}>
                    Share PrepRX with your friends and study partners.
                </p>

                {/* Copy link */}
                <div className={styles.linkRow}>
                    <span className={styles.linkText}>{APP_URL}</span>
                    <button className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ""}`} onClick={handleCopyClick}>
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>

                {/* Sharing options — fixed 4-column grid so buttons always align */}
                <div className={styles.options}>
                    <button className={styles.option} onClick={() => openExternal(whatsappUrl)} title="Share on WhatsApp">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#25D366" d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2Zm5.73 13.72c-.25.7-1.45 1.33-2 1.38-.55.05-1.07.25-3.56-.94-2.99-1.43-4.85-4.7-5-4.92-.14-.22-1.17-1.7-1.13-3.23.04-1.53.83-2.26 1.12-2.57.28-.31.62-.39.83-.39h.6c.19 0 .45-.07.69.53.25.63.86 2.18.93 2.34.07.16.12.34.02.55-.1.21-.15.34-.3.53-.15.19-.31.42-.44.57-.15.15-.3.32-.13.63.17.31.76 1.26 1.63 2.04 1.12 1 2.06 1.31 2.36 1.46.3.15.47.13.65-.08.17-.21.75-.87.95-1.17.2-.3.4-.25.66-.15.27.1 1.69.8 1.98.94.29.15.48.22.55.34.07.12.07.7-.18 1.38Z" />
                        </svg>
                        <span>WhatsApp</span>
                    </button>
                    <button className={styles.option} onClick={() => openExternal(facebookUrl)} title="Share on Facebook">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07Z" />
                        </svg>
                        <span>Facebook</span>
                    </button>
                    <button className={styles.option} onClick={() => openExternal(telegramUrl)} title="Share on Telegram">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#229ED9" d="M12 2C6.48 2 2 6.04 2 11.02c0 2.87 1.45 5.43 3.71 7.08V22l3.4-1.87c.92.26 1.89.4 2.89.4 5.52 0 10-4.04 10-9.01C22 6.04 17.52 2 12 2Zm5 12.28c-.2.56-.95.9-1.37.9-.42.01-.79.16-2.76-.93-2.19-1.21-3.56-3.53-3.67-3.69-.1-.16-.87-1.2-.87-2.29 0-1.08.57-1.62.77-1.84.2-.22.45-.28.6-.28h.43c.14 0 .32-.05.5.38.19.45.66 1.66.72 1.78.06.12.1.26.02.42-.08.16-.12.26-.25.41-.13.15-.28.34-.4.46-.13.12-.27.26-.12.52.15.26.66 1.15 1.42 1.86.98.91 1.8 1.19 2.06 1.32.26.13.41.11.56-.06.16-.17.53-.62.67-.83.14-.22.28-.18.47-.11.19.07 1.22.58 1.43.69.2.1.33.16.38.25.05.09.05.53-.15 1.09Z" />
                        </svg>
                        <span>Telegram</span>
                    </button>
                    <button className={styles.option} onClick={() => openExternal(xUrl)} title="Share on X">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#0F172A" d="M18.24 2.25h3.31l-7.23 8.26L22.83 21.75h-6.66l-5.22-6.82-5.97 6.82H1.66l7.73-8.84L1.25 2.25h6.83l4.72 6.23 5.44-6.23Zm-1.16 17.52h1.84L7.08 4.13H5.1l11.98 15.64Z" />
                        </svg>
                        <span>X (Twitter)</span>
                    </button>
                    <button className={styles.option} onClick={() => openExternal(linkedInUrl)} title="Share on LinkedIn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#0A66C2" d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
                        </svg>
                        <span>LinkedIn</span>
                    </button>
                    <button className={styles.option} onClick={handleInstagramShare} title="Share on Instagram (link will be copied)">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#E4405F" d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.8.31-1.48.73-2.15 1.4A5.94 5.94 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.8.73 1.48 1.4 2.15.67.67 1.35 1.09 2.15 1.4.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.95 5.95 0 0 0 2.15-1.4 5.95 5.95 0 0 0 1.4-2.15c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.95 5.95 0 0 0-1.4-2.15A5.95 5.95 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0Z" />
                            <path fill="#E4405F" d="M12 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
                            <circle fill="#E4405F" cx="18.41" cy="5.59" r="1.44" />
                        </svg>
                        <span>Instagram</span>
                    </button>
                    <button className={styles.option} onClick={() => openExternal(emailUrl)} title="Share via Email">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="4" width="20" height="16" rx="2" stroke="#607BFB" strokeWidth="2" />
                            <path d="M3 6l9 7 9-7" stroke="#607BFB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Email</span>
                    </button>
                    {typeof navigator !== "undefined" && navigator.share && (
                        <button className={styles.option} onClick={handleNativeShare} title="More sharing options">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.803 5.333A3.325 3.325 0 1 1 17.151 8.667h-.001a3.245 3.245 0 0 1-1.29-.858l-4.635 3.156a3.5 3.5 0 0 1-.182 1.917l5.082 3.34a3.332 3.332 0 0 1 2.026-.687 3.334 3.334 0 1 1-3.349 3.334c0-.467.098-.93.29-1.356L9.05 14c-.61.53-1.39.822-2.202.821a3.334 3.334 0 1 1 .369-6.666 3.33 3.33 0 0 1 2.232.856l4.493-3.059a3.344 3.344 0 0 1-.139-.619Z" stroke="#083862" strokeWidth="1.8" />
                            </svg>
                            <span>More</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareAppModal;
