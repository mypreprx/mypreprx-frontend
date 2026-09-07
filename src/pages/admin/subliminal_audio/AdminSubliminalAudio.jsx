import { useState, useEffect } from 'react';
import Modal from '../../../components/common/modal/Modal';
import ConfirmationModal from '../../../components/common/modal/ConfirmationModal';
import useSubliminalStore from '../../../store/subliminalStore';
import SubliminalAudioForm from './SubliminalAudioForm';
import styles from './AdminSubliminalAudio.module.css';
import { AdminDeleteIcon, AdminEditIcon } from '../../../components/common/Icons';

const AdminSubliminalAudio = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateSort, setDateSort] = useState('newest');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAudio, setEditingAudio] = useState(null);
    const [deletingAudio, setDeletingAudio] = useState(null);

    const { audios, fetchAllAudios, deleteAudio, isLoading } = useSubliminalStore();

    useEffect(() => {
        fetchAllAudios();
    }, []);

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredAudios = audios.filter(audio => {
        const matchesSearch = audio.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            audio.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || audio.category === categoryFilter;
        const matchesStatus = statusFilter === 'All' ||
            (statusFilter === 'Active' ? audio.isActive : !audio.isActive);

        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sorting
    const sortedAudios = [...filteredAudios].sort((a, b) => {
        if (dateSort === 'newest') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }
    });

    const handleDelete = async () => {
        if (deletingAudio) {
            await deleteAudio(deletingAudio._id);
            setDeletingAudio(null);
        }
    };

    // Extract unique categories from the audios array
    const categories = [...new Set(audios.map(audio => audio.category).filter(Boolean))];

    if (isLoading && audios.length === 0) {
        return <div className={styles.loadingState}>Loading audios...</div>
    }


    return (
        <div className={styles.adminContainer}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Subliminal Study Audio Management</h2>
                    <p className={styles.description}>Upload and manage subliminal audio tracks for student study sessions.</p>
                </div>
                <button
                    className={styles.addBtn}
                    onClick={() => setIsAddModalOpen(true)}
                >
                    + Add New Audio
                </button>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        placeholder="Search by title..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.filtersWrapper}>
                    <select
                        className={styles.filterSelect}
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <select
                        className={styles.filterSelect}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                    <select
                        className={styles.filterSelect}
                        value={dateSort}
                        onChange={(e) => setDateSort(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>

            <div className={styles.tableWrapper}>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Added</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {audios.length === 0 ? (
                            <tr>
                                <td colSpan="7" className={styles.emptyState}>
                                    <div className={styles.noDataInfo}>
                                        {/* <BsMusicNoteBeamed size={40} /> */}
                                        <p>There's no audio has been added</p>
                                        <button onClick={() => setIsAddModalOpen(true)}>Add Audio</button>
                                    </div>
                                </td>
                            </tr>
                        ) : sortedAudios.length > 0 ? (
                            sortedAudios.map((audio, index) => (
                                <tr key={audio._id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <span className={styles.titleCell}>
                                            {audio.title}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={styles.categoryTag}>
                                            {audio.category}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={styles.dateCell}>
                                            {formatDate(audio.createdAt)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.status} ${audio.isActive ? styles.active : styles.inactive}`}>
                                            {audio.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className={styles.actions}>
                                        <button
                                            className={styles.editBtn}
                                            onClick={() => setEditingAudio(audio)}
                                            title="Edit"
                                        >
                                            <AdminEditIcon />
                                        </button>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => setDeletingAudio(audio)}
                                            title="Delete"
                                        >
                                            <AdminDeleteIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className={styles.emptyState}>
                                    No audios found matching your current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Subliminal Audio"
            >
                <SubliminalAudioForm
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        fetchAllAudios();
                    }}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingAudio}
                onClose={() => setEditingAudio(null)}
                title="Edit Subliminal Audio"
            >
                {editingAudio && (
                    <SubliminalAudioForm
                        audio={editingAudio}
                        onSuccess={() => {
                            setEditingAudio(null);
                            fetchAllAudios();
                        }}
                        onCancel={() => setEditingAudio(null)}
                    />
                )}
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmationModal
                isOpen={!!deletingAudio}
                onClose={() => setDeletingAudio(null)}
                onConfirm={handleDelete}
                title="Delete Audio"
                message={`Are you sure you want to delete "${deletingAudio?.title}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default AdminSubliminalAudio;

