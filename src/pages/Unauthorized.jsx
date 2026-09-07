import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Unauthorized</h1>
            <p className="text-xl text-gray-700 mb-8">You do not have permission to view this page.</p>
            <button
                onClick={() => navigate('/home')}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                Go to Home
            </button>
        </div>
    );
};

