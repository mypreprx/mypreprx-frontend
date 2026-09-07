import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import useCrashCourseStore from "../../../store/crashCourseStore";

import { Topbar } from "../../../components/common/topbar/Topbar";
import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { HeaderCard } from "../../../components/common/HeaderCard";
import { ImageIcon } from "../../../components/common/Icons";

import styles from "./CrashCourses.module.css";
import { BackButton } from "../../../components/common/BackButton";



export const CrashCourses = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTopic, setActiveTopic] = useState("All Topics");
  const [activeType, setActiveType] = useState("All Types");

  const navigate = useNavigate();

  const { courses, fetchCrashCourses, isLoading } = useCrashCourseStore();

  useEffect(() => {
    fetchCrashCourses();
  }, [fetchCrashCourses]);

  const topics = ["All Topics", ...new Set(courses.map(c => c.topic))];
  const types = ["All Types", "Video", "PDF", "Image"];

  const filteredCourses = courses.filter(course => {
    const topicMatch = activeTopic === "All Topics" || course.topic === activeTopic;
    const typeMatch = activeType === "All Types" || course.fileType?.toLowerCase() === activeType.toLowerCase();
    return topicMatch && typeMatch;
  });

  const getFullImageUrl = (path) => {
    if (!path) return null;

    // 1. Clean quotes and change all backslashes (\) to forward slashes (/)
    const cleanPath = path.replace(/['"`]/g, '').replace(/\\/g, '/');

    // 2. If it's already a full URL from YouTube or elsewhere, return it
    if (cleanPath.startsWith('http')) return cleanPath;

    const serverBaseUrl = import.meta.env.PROD
      ? 'https://api.mypreprx.com'
      : 'http://localhost:4001';

    // 3. Find where "uploads/" starts in the string and keep everything after it
    // This dynamically preserves "uploads/docs/...", "uploads/videos/...", etc.
    const uploadIndex = cleanPath.indexOf('uploads/');

    if (uploadIndex !== -1) {
      // It will grab the exact subfolder structure from your database
      const relativePath = cleanPath.substring(uploadIndex);
      return `${serverBaseUrl}/${relativePath}`;
    }

    // Fallback: If for some reason there is no "uploads" in the string, just grab the filename
    const filename = cleanPath.split('/').pop();
    return `${serverBaseUrl}/uploads/${filename}`;
  };

  const getThumbnail = (course) => {
    const uploadedThumb = getFullImageUrl(course.thumbnail);
    if (uploadedThumb) return uploadedThumb;

    // Default Fallback
    return 'https://teaching4imgs.com.au/wp-content/uploads/2023/09/default-product-card.png';
  };

  const genSmallCaseCategory = (category) => (
    category
      .replace(/%20/g, "-")
      .replace(/-/g, ' ')
      .replace(/\w\S*/g, (word) => word.charAt(0).toLowerCase() + word.substring(1).toLowerCase())
  );

  const handleCardClick = (course) => {
    if (course.fileType === 'video' && course.fileUrl) {
      const videoUrl = getFullImageUrl(course.fileUrl);

      navigate(`/study-zone/crash-courses/${genSmallCaseCategory(course.topic)}`, {
        state: {
          videoUrl: videoUrl,
          title: course.title,
          fileType: course.fileType
        }
      });

    } else {
      // For PDF/Image, maybe open in new tab
      const url = getFullImageUrl(course.fileUrl);
      if (url) window.open(url, '_blank');
    }
  };

  return (
    <div className={styles['crash-page']}>
      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* MAIN CONTENT */}
      <main className={styles['cc-main-area']}>
        {/* TOPBAR */}
        <Topbar pageTitle="Study Zone" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className={styles['cc-content']}>
          {/* BACK BUTTON */}
          <div className={styles['back-btn-container']}>
            <BackButton to="/study-zone" />
          </div>

          {/* HEADER */}
          <HeaderCard
            title="Crash Courses"
            subtitle="Short, sharp videos for fast NCLEX wins."
            className={styles['cc-header']}
          />

          {/* FILTER SECTION */}
          <div className={styles['cc-filter-section']}>
            <div className={styles['cc-dropdown-container']}>
              <div className={styles['dropdown-group']}>
                <div className={styles['custom-dropdown']}>
                  <select
                    value={activeTopic}
                    onChange={(e) => setActiveTopic(e.target.value)}
                    className={styles['dropdown-select']}
                  >
                    {topics.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles['dropdown-group']}>
                <div className={styles['custom-dropdown']}>
                  <select
                    value={activeType}
                    onChange={(e) => setActiveType(e.target.value)}
                    className={styles['dropdown-select']}
                  >
                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* COURSES GRID */}
          <div className={styles['cc-video-grid']}>
            {!isLoading && courses.length === 0 && (
              <div className={styles['loading-container']}>
                No crash courses have been added yet.
              </div>
            )}

            {isLoading ? (
              <div className={styles['loading-container']}>Loading courses...</div>
            ) : filteredCourses.length > 0 ? (
              filteredCourses.map((course, idx) => (
                <div
                  key={idx}
                  className={styles['cc-video-card']}
                  style={{ backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.95), rgba(255,255,255,0.3), rgba(255,255,255,0.95), rgba(255,255,255,0.95)), url(${getThumbnail(course)})` }}
                  onClick={() => handleCardClick(course)}
                >
                  <h4>{course.title}</h4>
                  <div className={styles['cc-card-info']}>
                    <span className={styles['card-info-lessons']}>{course.topic}</span>
                    <span className={styles['card-info-duration']}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12.75 11.38V6H11.25V12L15.493 16.243L16.553 15.183L12.75 11.38ZM12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22Z" fill="#072445" />
                      </svg>
                      {course.duration}{course.fileType === "video" ? "min" : " pages"}
                    </span>
                  </div>
                  <div className={styles['play-icon']}>
                    {course.fileType === 'video'
                      ? (<svg width={17} height={17} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.4086 9.35258C23.5305 10.5065 23.5305 13.4935 21.4086 14.6474L8.59662 21.6145C6.53435 22.736 4 21.2763 4 18.9671L4 5.0329C4 2.72368 6.53435 1.26402 8.59661 2.38548L21.4086 9.35258Z" fill="#ffffff"></path> </g></svg>)
                      : course.fileType === 'pdf'
                        ? (<svg width={18} height={18} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="matrix(-1, 0, 0, 1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M9.29289 1.29289C9.48043 1.10536 9.73478 1 10 1H18C19.6569 1 21 2.34315 21 4V20C21 21.6569 19.6569 23 18 23H6C4.34315 23 3 21.6569 3 20V8C3 7.73478 3.10536 7.48043 3.29289 7.29289L9.29289 1.29289ZM18 3H11V8C11 8.55228 10.5523 9 10 9H5V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V4C19 3.44772 18.5523 3 18 3ZM6.41421 7H9V4.41421L6.41421 7ZM7 13C7 12.4477 7.44772 12 8 12H16C16.5523 12 17 12.4477 17 13C17 13.5523 16.5523 14 16 14H8C7.44772 14 7 13.5523 7 13ZM7 17C7 16.4477 7.44772 16 8 16H16C16.5523 16 17 16.4477 17 17C17 17.5523 16.5523 18 16 18H8C7.44772 18 7 17.5523 7 17Z" fill="#ffffff"></path> </g></svg>) :
                        <ImageIcon width={19} height={19} fillColor="white" />}
                  </div>
                </div>
              ))
            ) : courses.length > 0
              ? (
                <p>No courses match your criteria</p>
              ) : null
            }
          </div>
        </div>
      </main>
    </div>
  );
};























// const courses = [
//   { title: "Med-Surg Course", topic: "Med-Surg", duration: 45, fileUrl: "https://youtu.be/R6jntzglV2M?si=q709V8OCN7D2Ktqa", fileType: "video" },
//   { title: "Delegation Course", topic: "Delegation", duration: 45, fileUrl: "https://youtu.be/xA1VoOy1-zw?si=qMdhhRoE6AiD9Ew7", fileType: "video" },
//   { title: "Psych Nursing Course", topic: "Psych Nursing", duration: 45, fileUrl: "https://youtu.be/ZsEyrOWH6Mk?si=-9mUoZo0U5Rs3JIt", fileType: "video" },
//   { title: "Pediatrics Course", topic: "Pediatrics", duration: 45, fileUrl: "https://youtu.be/rHYk1sYsge0?si=9NIuMZSR5I1hyzVW", fileType: "video" },
//   { title: "Delegation Course", topic: "Delegation", duration: 45, fileUrl: "https://youtu.be/xA1VoOy1-zw?si=qMdhhRoE6AiD9Ew7", fileType: "video" },
//   { title: "Psych Nursing Course", topic: "Psych Nursing", duration: 45, fileUrl: "https://youtu.be/ZsEyrOWH6Mk?si=-9mUoZo0U5Rs3JIt", fileType: "video" },
//   { title: "Pharmacology Course", topic: "Pharmacology", duration: 45, fileUrl: "https://youtu.be/9rTFUEMhF04?si=E2VyWhGsD2PhWeD6", fileType: "video" },
//   { title: "Maternity Course", topic: "Maternity", duration: 45, fileUrl: "https://youtu.be/PBQviDb5Vk0?si=in0l9I9YSTHX39ya", fileType: "video" },
// ];


// const courses = [
//   { title: "Med-Surg", topic: "Med-Surg", lessons: 12, duration: "45 min", img: course1 },
//   { title: "NCLEX", topic: "NCLEX", lessons: 12, duration: "45 min", img: course2 },
//   { title: "Priority Practice", topic: "Priority Practice", lessons: 12, duration: "45 min", img: course3 },
//   { title: "Med-Surg", topic: "Med-Surg", lessons: 12, duration: "45 min", img: course1 },
//   { title: "NCLEX", topic: "NCLEX", lessons: 12, duration: "45 min", img: course2 },
//   { title: "Priority Practice", topic: "Priority Practice", lessons: 12, duration: "45 min", img: course3 },
//   { title: "Pharmacology", topic: "Pharmacology", lessons: 12, duration: "45 min", img: course1 },  // Added for demo
//   { title: "Mental Health", topic: "Mental Health", lessons: 12, duration: "45 min", img: course2 }, // Added for demo
// ];