import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/common/sidebar/Sidebar";
import { Topbar } from "../../components/common/topbar/Topbar";
import styles from "./SearchResults.module.css";
import { HeaderCard } from "../../components/common/HeaderCard";
import { TopicCard } from "../../components/common/topic_card/TopicCard";
import { CardIcon } from "../../components/common/topic_card/CardIcon";
import { searchableItems } from "../../data/searchableItems";

export const SearchResults = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q")?.toLowerCase() || "";
    const navigate = useNavigate();

    const results = searchableItems.filter(item => {
        if (!query) return false;

        const titleMatch = item.title.toLowerCase().includes(query);
        const descMatch = item.description.toLowerCase().includes(query);
        const tagMatch = item.tags.some(tag => tag.toLowerCase().includes(query));

        return titleMatch || descMatch || tagMatch;
    });

    return (
        <div className={styles["search-container"]}>
            <Sidebar sidebarOpen={sidebarOpen} />

            <div className={styles["search-main-area"]}>
                <Topbar pageTitle="Search Results" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <div className={styles["search-content"]}>
                    <HeaderCard
                        title={query ? `Search results for "${query}"` : "Search"}
                        subtitle={results.length === 1 ? "1 result found" : `${results.length} results found`}
                        className={styles["search-header-card"]}
                    />

                    {results.length > 0 ? (
                        <div className={styles["search-grid"]}>
                            {results.map((item, index) => (
                                <TopicCard
                                    key={index}
                                    title={item.title}
                                    subtitle={item.description}
                                    icon={<CardIcon>{item.icon}</CardIcon>}
                                    onClick={() => navigate(item.path)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className={styles["no-results"]}>
                            <h3>No exact matches found</h3>
                            <p>Try searching for different keywords like "Crash", "Quizzes", "Mind", or "Strategy".</p>
                            <button className={styles["back-btn"]} onClick={() => navigate(-1)}>
                                Go Back
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
