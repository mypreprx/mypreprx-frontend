import React from "react";
import {
    SidebarIconStudyZone,
    SidebarIconMindRx,
    CrashCoursesIcon,
    AllTopicsGridIcon,
    BrainIcon
} from "../components/common/Icons";

export const searchableItems = [
    {
        title: "All Topics",
        description: "Browse all NCLEX subjects and categories",
        path: "/study-zone/all-topics",
        tags: ["topics", "subjects", "all", "study", "study zone"],
        icon: <AllTopicsGridIcon />
    },
    {
        title: "Crash Courses",
        description: "Bite-sized video lessons for quick review",
        path: "/study-zone/crash-courses",
        tags: ["crash", "courses", "video", "videos", "watch", "lessons", "study zone"],
        icon: <CrashCoursesIcon />
    },
    {
        title: "Custom Quizzes",
        description: "Create and take personalized practice tests",
        path: "/study-zone/custom-quizzes",
        tags: ["quiz", "quizzes", "test", "practice", "custom", "study zone"],
        icon: <SidebarIconStudyZone />
    },
    {
        title: "Visualization Room",
        description: "Mini meditations for calm focus and test anxiety",
        path: "/mind-rx/visualization-room",
        tags: ["visualization", "room", "mind", "stress", "anxiety", "relax", "calm", "mind rx"],
        icon: <BrainIcon />
    },
    {
        title: "Scripting Space",
        description: "Journaling prompts for your nursing journey",
        path: "/mind-rx/scripting-space",
        tags: ["scripting", "journal", "journaling", "write", "mind", "space", "mind rx"],
        icon: <SidebarIconMindRx />
    },
    {
        title: "Subliminal Study Mode",
        description: "Background positive affirmations for study sessions",
        path: "/mind-rx/subliminal-study",
        tags: ["subliminal", "audio", "listen", "affirmations", "background", "study", "mind rx"],
        icon: <SidebarIconMindRx />
    },
    {
        title: "Manifestation Calendar",
        description: "Gratitude, Reflection, Focus tracking",
        path: "/mind-rx/manifestation-calendar",
        tags: ["manifestation", "calendar", "gratitude", "dates", "schedule", "mind", "mind rx"],
        icon: <SidebarIconMindRx />
    },
    {
        title: "Priority Frameworks",
        description: "Strategies for tackling priority NCLEX questions",
        path: "/strategy-zone/priority-frameworks",
        tags: ["priority", "frameworks", "strategy", "strategies", "strategy zone"],
        icon: <SidebarIconStudyZone />
    },
    {
        title: "Elimination Techniques",
        description: "How to narrow down multiple choice answers",
        path: "/strategy-zone/elimination-techniques",
        tags: ["elimination", "techniques", "strategy", "multiple", "choice", "strategy zone"],
        icon: <SidebarIconStudyZone />
    },
    {
        title: "Test Day Mindset",
        description: "Mental preparation for taking the NCLEX",
        path: "/strategy-zone/test-day-mindset",
        tags: ["test", "day", "mindset", "prepare", "strategy", "strategy zone"],
        icon: <SidebarIconStudyZone />
    },
    {
        title: "SATA Bootcamp",
        description: "Conquer Select All That Apply questions",
        path: "/strategy-zone/sata-bootcamp",
        tags: ["sata", "bootcamp", "select", "apply", "strategy", "strategy zone"],
        icon: <SidebarIconStudyZone />
    }
];
