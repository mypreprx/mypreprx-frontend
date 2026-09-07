import React from 'react';

const LoadingScreen = ({ text }) => {
    return (
        <div style={styles.container}>
            <div style={styles.loaderContainer}>
                <div style={styles.spinner}></div>
                <div style={styles.spinnerInner}></div>
            </div>
            {text && <h2 style={styles.text}>{text}</h2>}
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @keyframes spin-reverse {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(-360deg); }
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                `}
            </style>
        </div>
    );
};

const styles = {
    container: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        transition: 'all 0.3s ease',
    },
    loaderContainer: {
        position: 'relative',
        width: '60px',
        height: '60px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinner: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        border: '3px solid transparent',
        borderTopColor: '#00A5B7',
        borderRightColor: '#00A5B7',
        borderRadius: '50%',
        animation: 'spin 1.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite',
    },
    spinnerInner: {
        position: 'absolute',
        width: '60%',
        height: '60%',
        border: '3px solid transparent',
        borderBottomColor: '#36D1DC',
        borderLeftColor: '#36D1DC',
        borderRadius: '50%',
        opacity: 0.8,
        animation: 'spin-reverse 1.2s linear infinite',
    },
    text: {
        marginTop: '24px',
        color: '#072445',
        fontSize: '0.9rem',
        fontWeight: 500,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        animation: 'pulse 2s ease-in-out infinite',
    }
};

export default LoadingScreen;
