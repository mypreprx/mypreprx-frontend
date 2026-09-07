import React from "react";

/**
 * CardIcon Component
 * A reusable wrapper for the 40x40 teal background icons used in topic cards.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The SVG path or any other content inside the icon box
 * @param {string} [props.color="#00A5B7"] - Background color (teal)
 * @param {string} [props.className=""] - Additional CSS class
 */
export const CardIcon = ({ children, color = "#00A5B7", className = "" }) => {
    return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <rect width="40" height="40" rx="10" fill={color} />
            {children}
        </svg>
    );
};
