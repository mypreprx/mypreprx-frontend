import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../components/common/modal/Modal';
import ConfirmationModal from '../../../components/common/modal/ConfirmationModal';
import styles from './AdminPriorityPractice.module.css';
import api from '../../../config/axiosInstance';

const AdminPriorityPractice = () => {
    const [practices, setPractices] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState('all');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, practice: null });

    const navigate = useNavigate();

    async function fetchPractices() {
        try {
            setFetchLoading(true);
            setError(null);
            console.log('Fetching practices from /admin/getAllPiriorityPractice/');
            const res = await api.get('/admin/getAllPiriorityPractice/');
            console.log('API Response:', res.data);
            const data = res.data && (res.data.data || res.data);
            console.log('Extracted data:', data);
            if (Array.isArray(data) && data.length > 0) {
                console.log('First practice object:', JSON.stringify(data[0], null, 2));
                console.log('Available fields:', Object.keys(data[0]));
            }
            setPractices(Array.isArray(data) ? data : []);
            setFetchLoading(false);
        } catch (err) {
            console.error('Error fetching practices:', err);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to fetch practices';
            console.error('Backend error:', errorMsg);
            setError(errorMsg);
            setPractices([]);
            setFetchLoading(false);
        }
    }

    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!mounted) return;
            await fetchPractices();
        })();
        return () => { mounted = false; };
    }, []);

    const openDeleteModal = (practice) => {
        setDeleteModal({ isOpen: true, practice });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, practice: null });
    };

    const handleDelete = async () => {
        const { practice } = deleteModal;
        if (!practice) return;
        
        try {
            await api.delete(`/admin/deletePiriorityPractice/${practice._id}`);
            setPractices(practices.filter(p => p._id !== practice._id));
            closeDeleteModal();
        } catch (error) {
            console.error('Error deleting practice:', error);
        }
    };

    // Details modal: fetch questions for the practice's subtopic
    const [detailsModal, setDetailsModal] = useState({ isOpen: false, practice: null, questions: [] });
    const [editFormData, setEditFormData] = useState({
        title: '',
        difficulty: '',
        scenarioNarrative: '',
        patientChart: {},
        questions: []
    });

    const openDetailsModal = async (practice) => {
        setEditFormData({
            title: practice?.title || '',
            difficulty: practice?.difficulty || '',
            scenarioNarrative: practice?.scenarioNarrative || '',
            patientChart: practice?.patientChart ? { ...practice.patientChart } : {},
            questions: practice?.questions ? JSON.parse(JSON.stringify(practice.questions)) : []
        });
        setDetailsModal({ isOpen: true, practice, questions: [] });
        try {
            const subId = practice.subTopic?._id || practice.subTopic;
            if (!subId) return;
            const res = await api.get(`/admin/getAllPiriorityPractice/${subId}`);
            const allPracticesForSubtopic = res.data && (res.data.data || res.data);
            setDetailsModal({ isOpen: true, practice, questions: allPracticesForSubtopic || [] });
        } catch (err) {
            console.error('Error fetching practices for subtopic:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch subtopic practices';
            console.error('Backend error:', errorMsg);
            setDetailsModal({ isOpen: true, practice, questions: [] });
        }
    }

    const closeDetailsModal = () => {
        setDetailsModal({ isOpen: false, practice: null, questions: [] });
    };

    const handlePlayFromList = (practice) => {
        // Play the stored practice data in the player
        navigate('/study-zone/priority-practice-player', { state: { caseStudy: practice } });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setLevelFilter('all');
    };

    const handleUpdatePractice = async () => {
        if (!detailsModal.practice?._id) return;
        try {
            const payload = {
                title: editFormData.title,
                difficulty: editFormData.difficulty,
                scenarioNarrative: editFormData.scenarioNarrative,
                patientChart: editFormData.patientChart
            };
            await api.post(`/admin/updatePiriorityPractice/${detailsModal.practice._id}`, payload);
            // Refresh the practices list
            await fetchPractices();
            closeDetailsModal();
        } catch (error) {
            console.error('Error updating practice:', error);
        }
    };

    const handleEditFormChange = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleChartChange = (chartKey, value) => {
        setEditFormData(prev => ({
            ...prev,
            patientChart: {
                ...prev.patientChart,
                [chartKey]: value
            }
        }));
    };

    const handleQuestionChange = (qIndex, field, value) => {
        setEditFormData(prev => {
            const updatedQuestions = [...prev.questions];
            updatedQuestions[qIndex] = {
                ...updatedQuestions[qIndex],
                [field]: value
            };
            return {
                ...prev,
                questions: updatedQuestions
            };
        });
    };

    const handleOptionChange = (qIndex, optIndex, value) => {
        setEditFormData(prev => {
            const updatedQuestions = [...prev.questions];
            const updatedOptions = [...(updatedQuestions[qIndex]?.options || [])];
            updatedOptions[optIndex] = value;
            updatedQuestions[qIndex] = {
                ...updatedQuestions[qIndex],
                options: updatedOptions
            };
            return {
                ...prev,
                questions: updatedQuestions
            };
        });
    };

    const filteredPractices = practices.filter(practice => {
        const matchesSearch = practice.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLevel = levelFilter === 'all' || practice.difficulty?.toLowerCase() === levelFilter.toLowerCase();
        return matchesSearch && matchesLevel;
    });

    if (fetchLoading) {
        return <div className={styles.loadingState}>Loading priority practices...</div>;
    }

    if (error) {
        return <div className={styles.errorState}>Error: {error}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Priority Practice</h1>
            </div>

            {/* Filters Section */}
            <div className={styles.filtersSection}>
                <div className={styles.filterGroup}>
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.filterGroup}>
                    <select
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <button 
                        className={styles.clearFiltersBtn}
                        onClick={handleClearFilters}
                    >
                        Clear Filters
                    </button>
                </div>

                <div className={styles.resultsCounter}>
                    Showing {filteredPractices.length} of {practices.length}
                </div>
            </div>

            {/* Table Section */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Level</th>
                            <th>Questions</th>
                            <th>Created Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPractices.length > 0 ? (
                            filteredPractices.map((practice) => (
                                <tr key={practice._id} className={styles.tableRow}>
                                    <td>{practice.title}</td>
                                    <td>
                                        <span className={`${styles.badge} ${styles[practice.difficulty]}`}>
                                            {practice.difficulty}
                                        </span>
                                    </td>
                                    <td>{practice.questions?.length || 0}</td>
                                    <td>{new Date(practice.createdAt).toLocaleDateString()}</td>
                                    <td className={styles.actionsCell}>
                                        <button
                                            className={styles.viewBtn}
                                            onClick={() => openDetailsModal(practice)}
                                            title="View"
                                        >
                                            View/Edit
                                        </button>

                                        <button
                                            className={styles.playBtn}
                                            onClick={() => handlePlayFromList(practice)}
                                            title="Play"
                                        >
                                            Play
                                        </button>

                                        <button
                                            className={styles.deleteTableBtn}
                                            onClick={() => openDeleteModal(practice)}
                                            title="Delete"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className={styles.noData}>
                                    No priority practices found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {deleteModal.isOpen && (
                <ConfirmationModal
                    isOpen={deleteModal.isOpen}
                    title="Delete Priority Practice"
                    message={`Are you sure you want to delete "${deleteModal.practice?.title}"?`}
                    onConfirm={handleDelete}
                    onCancel={closeDeleteModal}
                    confirmText="Delete"
                    cancelText="Cancel"
                />
            )}

            {/* Edit Details Modal */}
            {detailsModal.isOpen && (
                <Modal isOpen={detailsModal.isOpen} onClose={closeDetailsModal} title={`Edit: ${detailsModal.practice?.title}`} icon>
                    <div className={styles.detailContainer}>
                        <div className={styles.formGroup}>
                            <label>Title</label>
                            <input
                                type="text"
                                value={editFormData.title}
                                onChange={(e) => handleEditFormChange('title', e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Difficulty Level</label>
                            <select
                                value={editFormData.difficulty}
                                onChange={(e) => handleEditFormChange('difficulty', e.target.value)}
                                className={styles.input}
                            >
                                <option value="">Select Difficulty</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Scenario Narrative</label>
                            <textarea
                                value={editFormData.scenarioNarrative}
                                onChange={(e) => handleEditFormChange('scenarioNarrative', e.target.value)}
                                className={styles.textarea}
                                rows="4"
                            />
                        </div>

                        <h4>Patient Chart</h4>
                        <div className={styles.chartGrid}>
                            {editFormData.patientChart && Object.entries(editFormData.patientChart).map(([k,v])=> (
                                <div key={k} className={styles.detailItem}>
                                    <label>{k.replace(/([A-Z])/g,' $1').trim()}</label>
                                    <textarea
                                        value={v || ''}
                                        onChange={(e) => handleChartChange(k, e.target.value)}
                                        className={styles.textarea}
                                        rows="2"
                                    />
                                </div>
                            ))}
                        </div>

                        <h4>Questions ({editFormData.questions?.length || 0})</h4>
                        {editFormData.questions && editFormData.questions.length > 0 ? (
                            <div className={styles.questionsWrapper}>
                                {editFormData.questions.map((q, qIdx) => (
                                    <div key={q._id || qIdx} className={styles.questionDetail}>
                                        <div className={styles.formGroup}>
                                            <label>Step {q.step} - CJM Stage</label>
                                            <input
                                                type="text"
                                                value={q.cjmStage || ''}
                                                onChange={(e) => handleQuestionChange(qIdx, 'cjmStage', e.target.value)}
                                                className={styles.input}
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label>Question Text</label>
                                            <textarea
                                                value={q.questionText || ''}
                                                onChange={(e) => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                                                className={styles.textarea}
                                                rows="2"
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label>Options</label>
                                            {q.options && q.options.map((opt, optIdx) => (
                                                <input
                                                    key={optIdx}
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                                                    className={styles.input}
                                                    style={{ marginBottom: '8px' }}
                                                    placeholder={`Option ${optIdx + 1}`}
                                                />
                                            ))}
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label>Correct Answer</label>
                                            <input
                                                type="text"
                                                value={q.correctAnswer || ''}
                                                onChange={(e) => handleQuestionChange(qIdx, 'correctAnswer', e.target.value)}
                                                className={styles.input}
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label>Rationale</label>
                                            <textarea
                                                value={q.rationale || ''}
                                                onChange={(e) => handleQuestionChange(qIdx, 'rationale', e.target.value)}
                                                className={styles.textarea}
                                                rows="3"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No questions found for this practice.</p>
                        )}

                        <div className={styles.modalActions}>
                            <button
                                className={styles.updateBtn}
                                onClick={handleUpdatePractice}
                            >
                                Update Practice
                            </button>
                            <button
                                className={styles.closeModalBtn}
                                onClick={closeDetailsModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminPriorityPractice;
