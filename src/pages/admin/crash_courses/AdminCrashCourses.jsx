import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAdminStore from '../../../store/adminStore';
import Modal from '../../../components/common/modal/Modal';
import ConfirmationModal from '../../../components/common/modal/ConfirmationModal';
import CrashCourseForm from './CrashCourseForm';
import { AdminEditIcon, AdminDeleteIcon } from '../../../components/common/Icons';
import styles from './AdminCrashCourses.module.css';

const AdminCrashCourses = () => {
    const { courses, topics, isLoading, fetchCourses, fetchTopics, deleteCourse } = useAdminStore();
    const [editingCourse, setEditingCourse] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [topicFilter, setTopicFilter] = useState('all');
    const [createdFilter, setCreatedFilter] = useState('all');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, course: null });

    const navigate = useNavigate();
    const location = useLocation();

    const isCreateRoute = location.pathname === '/admin/crash-courses/create';
    const isEditRoute = location.pathname.startsWith('/admin/crash-courses/edit');

    useEffect(() => {
        fetchCourses();
        fetchTopics();
    }, [fetchCourses, fetchTopics]);


    const openDeleteModal = (course) => {
        setDeleteModal({ isOpen: true, course });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, course: null });
    };

    const handleDelete = async () => {
        const { course } = deleteModal;
        if (!course) return;
        const success = await deleteCourse(course._id);
        if (success) closeDeleteModal();
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
        navigate('/admin/crash-courses/edit');
    };

    const handleCreate = () => {
        setEditingCourse(null);
        navigate('/admin/crash-courses/create');
    };

    const handleCloseModal = () => {
        setEditingCourse(null);
        navigate('/admin/crash-courses');
    };

    const handleFormSuccess = () => {
        handleCloseModal();
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || course.fileType === typeFilter;
        const matchesTopic = topicFilter === 'all' || course.topicId?._id === topicFilter;

        let matchesCreated = true;
        if (createdFilter !== 'all') {
            const createdDate = new Date(course.createdAt);
            const now = new Date();
            if (createdFilter === 'today') {
                matchesCreated = createdDate.toDateString() === now.toDateString();
            } else if (createdFilter === 'week') {
                const weekAgo = new Date(now.setDate(now.getDate() - 7));
                matchesCreated = createdDate >= weekAgo;
            } else if (createdFilter === 'month') {
                const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                matchesCreated = createdDate >= monthAgo;
            }
        }

        return matchesSearch && matchesType && matchesTopic && matchesCreated;
    });

   const getFullImageUrl = (path) => {
    // 1. Fallback for empty paths
    if (!path) return 'https://teaching4imgs.com.au/wp-content/uploads/2023/09/default-product-card.png';
    
    // 2. If it's already a full external URL, return it directly
    if (path.startsWith('http')) return path;

    // 3. Define your base server URL dynamically (Prod vs Dev)
    const serverURL = import.meta.env.PROD 
        ? 'https://api.mypreprx.com' 
        : 'http://localhost:4001';

    // 4. Normalize the slashes (just in case Windows backslashes ever get saved)
    let normalizedPath = path.replace(/\\/g, '/');
    
    // 5. Ensure it starts with a forward slash for clean concatenation
    if (!normalizedPath.startsWith('/')) {
        normalizedPath = '/' + normalizedPath;
    }

    // This will correctly return: http://localhost:4001/uploads/docs/1769184735181-application.pdf
    return `${serverURL}${normalizedPath}`;
};

    if (isLoading && courses.length === 0) {
        return <div className={styles.loadingState}>Loading crash courses...</div>;
    }


    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Crash Courses Management</h2>
                    <p className={styles.description}>Add, edit, or delete crash courses for students.</p>
                </div>
                <button
                    className={styles.addBtn}
                    onClick={handleCreate}
                >
                    + Add New Course
                </button>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.filtersWrapper}>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Types</option>
                        <option value="video">Videos</option>
                        <option value="pdf">PDFs</option>
                        <option value="image">Images</option>
                    </select>
                    <select
                        value={topicFilter}
                        onChange={(e) => setTopicFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Topics</option>
                        {topics.map(topic => (
                            <option key={topic._id} value={topic._id}>{topic.title}</option>
                        ))}
                    </select>
                    <select
                        value={createdFilter}
                        onChange={(e) => setCreatedFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Time</option>
                        <option value="today">Created Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
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
                            <th>Topic</th>
                            <th>Type</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.length === 0 ? (
                            <tr>
                                <td colSpan="7" className={styles.emptyState}>
                                    <div className={styles.noDataInfo}>
                                        {/* <BsMusicNoteBeamed size={40} /> */}
                                        <p>There's no course has been added</p>
                                        <button onClick={handleCreate}>Add Course</button>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredCourses.length > 0 ? (
                            filteredCourses.reverse().map((course, index) => (
                                <tr key={course._id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className={styles.thumbnailContainer}>
                                            <img
                                                src={getFullImageUrl(course.thumbnail)}
                                                alt={course.title}
                                                className={styles.tableThumbnail}
                                            />

                                        </div>
                                    </td>
                                    <td className={styles.courseTitle}>{course.title}</td>
                                    <td>{course.topicId?.title || 'N/A'}</td>
                                    <td>
                                        <span className={`${styles.typeBadge} ${styles[course.fileType]}`}>
                                            {course.fileType}
                                        </span>
                                    </td>
                                    <td>{new Date(course.createdAt).toLocaleDateString()}</td>
                                    <td className={styles.actions}>
                                        <button
                                            className={styles.editBtn}
                                            onClick={() => handleEdit(course)}
                                            title="Edit"
                                        >
                                            <AdminEditIcon />
                                        </button>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => openDeleteModal(course)}
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
                                    No courses found matching your current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isCreateRoute || isEditRoute}
                onClose={handleCloseModal}
                title={editingCourse ? 'Edit Crash Course' : 'Add Crash Course'}
            >
                <CrashCourseForm
                    course={editingCourse}
                    onSuccess={handleFormSuccess}
                    onCancel={handleCloseModal}
                />
            </Modal>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                title="Delete Crash Course"
                message={`Are you sure you want to delete "${deleteModal.course?.title}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default AdminCrashCourses;

