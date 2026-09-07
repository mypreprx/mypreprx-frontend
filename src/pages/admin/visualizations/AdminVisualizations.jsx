import { useEffect, useState } from 'react';
import Modal from '../../../components/common/modal/Modal';
import ConfirmationModal from '../../../components/common/modal/ConfirmationModal';
import useAdminStore from '../../../store/adminStore';
import VisualizationForm from './VisualizationForm';

import defaultThumb from '../../../assets/visual1.jpg';
import styles from './AdminVisualizations.module.css';

const AdminVisualizations = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingVisual, setEditingVisual] = useState(null);
    const [deletingVisual, setDeletingVisual] = useState(null);

    const { visualizations, fetchVisualizations, createVisualization, updateVisualization, deleteVisualization, isFetching } = useAdminStore();

    useEffect(() => {
        fetchVisualizations();
    }, [fetchVisualizations]);

    const getFullMediaUrl = (path) => {
        // Default to asset thumbnail when backend doesn't provide one
        if (!path || path === 'default_visualization.jpg') {
            return defaultThumb;
        }

        const cleanPath = path.replace(/['"`]/g, '').replace(/\\/g, '/');
        if (cleanPath.startsWith('http')) return cleanPath;

        const serverBaseUrl = import.meta.env.PROD ? 'https://api.mypreprx.com' : 'http://localhost:4001';
        const uploadIndex = cleanPath.indexOf('uploads/');
        if (uploadIndex !== -1) {
            const relativePath = cleanPath.substring(uploadIndex);
            return `${serverBaseUrl}/${relativePath}`;
        }

        const filename = cleanPath.split('/').pop();
        return `${serverBaseUrl}/uploads/${filename}`;
    };

    const filteredVisualizations = visualizations.filter((visual) => {
        const matchesSearch = visual.title?.toLowerCase().includes(searchTerm.toLowerCase())
            || visual.subtitle?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All'
            || (statusFilter === 'Active' && visual.isActive)
            || (statusFilter === 'Inactive' && !visual.isActive);
        return matchesSearch && matchesStatus;
    });

    const openDeleteModal = (visual) => {
        setDeletingVisual(visual);
    };

    const closeDeleteModal = () => {
        setDeletingVisual(null);
    };

    const handleDelete = async () => {
        if (!deletingVisual) return;
        const success = await deleteVisualization(deletingVisual._id);
        if (success) {
            closeDeleteModal();
        }
    };

    const handleEdit = (visual) => {
        setEditingVisual(visual);
        setIsAddModalOpen(true);
    };

    const handleCreate = () => {
        setEditingVisual(null);
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingVisual(null);
        setIsAddModalOpen(false);
    };

    const handleFormSuccess = () => {
        handleCloseModal();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isFetching && visualizations.length === 0) {
        return <div className={styles.loadingState}>Loading visualizations...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Visualization Room Management</h2>
                    <p className={styles.description}>Add, update, or remove guided visualization sessions.</p>
                </div>
                <button className={styles.addBtn} onClick={handleCreate}>
                    + Add New Visualization
                </button>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        placeholder="Search by title or subtitle..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.filtersWrapper}>
                    <select
                        className={styles.filterSelect}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Thumbnail</th>
                            <th>Title</th>
                            <th>Subtitle</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visualizations.length === 0 ? (
                            <tr>
                                <td colSpan="7" className={styles.emptyState}>
                                    <div className={styles.noDataInfo}>
                                        <p>No visualizations have been added yet.</p>
                                        <button onClick={handleCreate}>Add Visualization</button>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredVisualizations.length > 0 ? (
                            filteredVisualizations.map((visual, index) => (
                                <tr key={visual._id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className={styles.thumbnailContainer}>
                                            <img
                                                src={getFullMediaUrl(visual.thumbnailUrl)}
                                                alt={visual.title}
                                                className={styles.tableThumbnail}
                                            />
                                        </div>
                                    </td>
                                    <td className={styles.titleCell}>{visual.title}</td>
                                    <td>{visual.subtitle}</td>
                                    <td>
                                        <span className={`${styles.status} ${visual.isActive ? styles.active : styles.inactive}`}>
                                            {visual.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>{formatDate(visual.createdAt)}</td>
                                    <td className={styles.actions}>
                                        <button
                                            className={styles.editBtn}
                                            onClick={() => handleEdit(visual)}
                                            title="Edit"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#5B50D6" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                            </svg>
                                        </button>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => openDeleteModal(visual)}
                                            title="Delete"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#cc2c2c" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className={styles.emptyState}>
                                    No visualizations found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isAddModalOpen}
                onClose={handleCloseModal}
                title={editingVisual ? 'Edit Visualization' : 'Add Visualization'}
            >
                <VisualizationForm
                    visual={editingVisual}
                    onSuccess={handleFormSuccess}
                    onCancel={handleCloseModal}
                />
            </Modal>

            <ConfirmationModal
                isOpen={!!deletingVisual}
                onClose={closeDeleteModal}
                title="Delete Visualization"
                message="Are you sure you want to delete this visualization? This will remove the video and thumbnail from the server."
                onConfirm={handleDelete}
            />
        </div>
    );
};

export default AdminVisualizations;
