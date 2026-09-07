import React, { useState, useEffect } from 'react';
import api from '../../../config/axiosInstance';
import useAdminStore from '../../../store/adminStore';
import toast from 'react-hot-toast';
import styles from './AdminTopics.module.css';

const AdminTopics = () => {
    const { topics, fetchTopics, getSubtopicsForTopic, updateTopic, deleteTopic } = useAdminStore();

    // States for main views
    const [view, setView] = useState('list'); // 'list', 'generate', 'edit'
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [subtopics, setSubtopics] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // States for generate view
    const [mainTopic, setMainTopic] = useState('');
    const [generatedSubtopics, setGeneratedSubtopics] = useState([]);
    const [generatedTopicId, setGeneratedTopicId] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // States for edit view
    const [editingTopic, setEditingTopic] = useState(null);
    const [editingSubtopics, setEditingSubtopics] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    // States for bulk question generation
    const [isBulkGenerating, setIsBulkGenerating] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, currentName: '' });
    const [bulkResults, setBulkResults] = useState(null);

    useEffect(() => {
        fetchTopics();
    }, [fetchTopics]);

    // ===== BULK GENERATION HANDLER =====
    const handleGenerateAllQuestions = async () => {
        if (topics.length === 0) {
            toast.error('No topics found. Please add topics first.');
            return;
        }

        const confirmed = window.confirm(
            `This will generate questions for ALL subtopics across ${topics.length} topics. This may take several minutes and will use significant AI credits. Continue?`
        );
        if (!confirmed) return;

        setIsBulkGenerating(true);
        setBulkResults(null);
        let successCount = 0;
        let failCount = 0;

        // Gather all subtopics first
        const allSubtopics = [];
        for (const topic of topics) {
            try {
                const res = await api.get(`/admin/subtopicsforTopic/${topic._id}`);
                const subs = res.data.data || [];
                subs.forEach(sub => allSubtopics.push({ ...sub, topicTitle: topic.title }));
            } catch {
                // skip topics that fail to fetch subtopics
            }
        }

        setBulkProgress({ current: 0, total: allSubtopics.length, currentName: '' });

        for (let i = 0; i < allSubtopics.length; i++) {
            const sub = allSubtopics[i];
            setBulkProgress({ current: i + 1, total: allSubtopics.length, currentName: sub.title });
            try {
                await api.post('/admin/gerateTopicQuestion', { subTopicId: sub._id });
                successCount++;
            } catch {
                failCount++;
            }
            // Small delay to avoid rate-limiting
            await new Promise(r => setTimeout(r, 500));
        }

        setIsBulkGenerating(false);
        setBulkResults({ successCount, failCount, total: allSubtopics.length });
        toast.success(`Bulk generation complete! ${successCount} succeeded, ${failCount} failed.`);
    };


    // ===== GENERATE VIEW HANDLERS =====
    const handleGenerate = async () => {
        if (!mainTopic.trim()) {
            toast.error('Please enter a topic name');
            return;
        }

        setIsGenerating(true);
        try {
            const res = await api.post('/admin/genrateTopics', { topic: mainTopic });
            const data = res.data.data || res.data;
            if (data) {
                setGeneratedTopicId(data.topicId);
                setGeneratedSubtopics(Array.isArray(data.aiSubtopics) ? data.aiSubtopics : []);
                toast.success('Topics generated. Review before saving.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Failed to generate topics');
        }
        setIsGenerating(false);
    };

    const handleGenSubChange = (index, field, value) => {
        setGeneratedSubtopics(prev => {
            const arr = [...prev];
            arr[index] = { ...arr[index], [field]: value };
            return arr;
        });
    };

    const handleSaveGenerated = async () => {
        if (!generatedTopicId) return;
        setIsSaving(true);
        try {
            await api.post('/admin/addTopics', {
                topicId: generatedTopicId,
                subtopic: generatedSubtopics
            });
            toast.success('Subtopics saved successfully.');
            setMainTopic('');
            setGeneratedSubtopics([]);
            setGeneratedTopicId(null);
            setView('list');
            fetchTopics();
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Failed to save subtopics');
        }
        setIsSaving(false);
    };

    // ===== LIST VIEW HANDLERS =====
    const handleViewTopic = async (topic) => {
        setSelectedTopic(topic);
        setIsLoading(true);
        const subs = await getSubtopicsForTopic(topic._id);
        setSubtopics(subs);
        setIsLoading(false);
    };

    const handleEditTopic = async (topic) => {
        setEditingTopic({
            title: topic.title,
            description: topic.description || '',
            _id: topic._id
        });
        // Load subtopics before going to edit view
        setIsLoading(true);
        const subs = await getSubtopicsForTopic(topic._id);
        setEditingSubtopics(subs.map(s => ({ ...s })));
        setIsLoading(false);
        setView('edit');
    };

    const handleDeleteTopic = async (topicId) => {
        if (!window.confirm('Are you sure you want to delete this topic and ALL its subtopics?')) {
            return;
        }
        const success = await deleteTopic(topicId);
        if (success) {
            setSelectedTopic(null);
            setSubtopics([]);
            // No need to call fetchTopics - state is updated in store
        }
    };

    // ===== EDIT VIEW HANDLERS =====
    const handleEditSubtopic = (index, field, value) => {
        setEditingSubtopics(prev => {
            const arr = [...prev];
            arr[index] = { ...arr[index], [field]: value };
            return arr;
        });
    };

    const handleAddNewSubtopic = () => {
        setEditingSubtopics(prev => [...prev, { title: '', content: '' }]);
    };

    const handleRemoveSubtopic = (index) => {
        setEditingSubtopics(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveEdit = async () => {
        if (!editingTopic.title.trim()) {
            toast.error('Topic title cannot be empty');
            return;
        }

        setIsEditing(true);
        const updated = await updateTopic(editingTopic._id, {
            title: editingTopic.title,
            description: editingTopic.description,
            subtopics: editingSubtopics
        });

        if (updated) {
            setView('list');
            setSelectedTopic(null);
            setSubtopics([]);
            setEditingTopic(null);
            setEditingSubtopics([]);
        }
        setIsEditing(false);
    };

    // ===== RENDER FUNCTIONS =====
    const renderListView = () => (
        <div className={styles.container}>
            <div className={styles.listHeader}>
                <h2 className={styles.title}>Topics Management</h2>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            setView('generate');
                            setSelectedTopic(null);
                            setSubtopics([]);
                        }} 
                        className={styles.createBtn}
                    >
                        + Generate New Topic
                    </button>
                    <button
                        type="button"
                        onClick={handleGenerateAllQuestions}
                        disabled={isBulkGenerating || topics.length === 0}
                        className={styles.createBtn}
                        style={{ background: isBulkGenerating ? '#999' : '#1a6b5c', cursor: isBulkGenerating ? 'not-allowed' : 'pointer' }}
                        title="Generate NCLEX questions for every subtopic across all topics"
                    >
                        {isBulkGenerating
                            ? `Generating... (${bulkProgress.current}/${bulkProgress.total})`
                            : '⚡ Generate All Questions'}
                    </button>
                </div>
            </div>

            {isBulkGenerating && bulkProgress.total > 0 && (
                <div style={{ margin: '12px 0', padding: '12px 16px', background: '#e8f5e9', borderRadius: '8px', borderLeft: '4px solid #2e7d32' }}>
                    <strong>Bulk Generation in Progress</strong>
                    <p style={{ margin: '4px 0', fontSize: '14px' }}>
                        Processing subtopic: <em>{bulkProgress.currentName}</em>
                        &nbsp;({bulkProgress.current} of {bulkProgress.total})
                    </p>
                    <div style={{ height: '8px', background: '#c8e6c9', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' }}>
                        <div style={{
                            height: '100%',
                            width: `${(bulkProgress.current / bulkProgress.total) * 100}%`,
                            background: '#2e7d32',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                </div>
            )}

            {bulkResults && !isBulkGenerating && (
                <div style={{ margin: '12px 0', padding: '12px 16px', background: '#e3f2fd', borderRadius: '8px', borderLeft: '4px solid #1565c0' }}>
                    <strong>✅ Bulk Generation Complete</strong>
                    <p style={{ margin: '4px 0', fontSize: '14px' }}>
                        {bulkResults.successCount} subtopics succeeded · {bulkResults.failCount} failed · {bulkResults.total} total processed
                    </p>
                    <button
                        type="button"
                        onClick={() => setBulkResults(null)}
                        style={{ marginTop: '6px', fontSize: '12px', background: 'none', border: '1px solid #1565c0', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', color: '#1565c0' }}
                    >
                        Dismiss
                    </button>
                </div>
            )}


            {topics.length === 0 ? (
                <div className={styles.noData}>No topics found</div>
            ) : (
                <div className={styles.topicsTable}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Topic Name</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topics.map((topic, idx) => (
                                <tr key={topic._id}>
                                    <td>{idx + 1}</td>
                                    <td>
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleViewTopic(topic);
                                            }}
                                            className={styles.topicLink}
                                        >
                                            {topic.title}
                                        </a>
                                    </td>
                                    <td>{topic.description || '—'}</td>
                                    <td className={styles.actions}>
                                        <button
                                            type="button"
                                            onClick={() => handleViewTopic(topic)}
                                            className={styles.viewBtn}
                                            title="View subtopics"
                                        >
                                            View
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleEditTopic(topic)}
                                            className={styles.editBtn}
                                            title="Edit topic"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteTopic(topic._id)}
                                            className={styles.deleteBtn}
                                            title="Delete topic"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedTopic && (
                <div className={styles.subtopicsPanel}>
                    <div className={styles.panelHeader}>
                        <h3>{selectedTopic.title} - Subtopics</h3>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedTopic(null);
                                setSubtopics([]);
                            }}
                            className={styles.closeBtn}
                        >
                            ✕
                        </button>
                    </div>
                    {isLoading ? (
                        <p>Loading subtopics...</p>
                    ) : subtopics.length === 0 ? (
                        <p className={styles.noData}>No subtopics found</p>
                    ) : (
                        <div className={styles.subtopicsList}>
                            {subtopics.map((sub, idx) => (
                                <div key={sub._id} className={styles.subtopicCard}>
                                    <h4>{idx + 1}. {sub.title}</h4>
                                    <p>{sub.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderGenerateView = () => (
        <div className={styles.container}>
            <div className={styles.header}>
                <button 
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        setView('list');
                        setMainTopic('');
                        setGeneratedSubtopics([]);
                        setGeneratedTopicId(null);
                    }} 
                    className={styles.backBtn}
                >
                    ← Back to Topics
                </button>
                <h2 className={styles.title}>Generate Topics with AI</h2>
            </div>

            <div className={styles.formGroup}>
                <input
                    type="text"
                    placeholder="Enter main topic name"
                    value={mainTopic}
                    onChange={e => setMainTopic(e.target.value)}
                    className={styles.textInput}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !mainTopic.trim()}
                    className={styles.generateBtn}
                >
                    {isGenerating ? 'Generating...' : 'Generate'}
                </button>
            </div>

            {generatedSubtopics.length > 0 && (
                <div className={styles.generatedSection}>
                    <h3 className={styles.subHeader}>Review &amp; Edit Subtopics</h3>
                    {generatedSubtopics.map((sub, idx) => (
                        <div key={idx} className={styles.subtopicItem}>
                            <label>Subtopic {idx + 1} Title</label>
                            <input
                                type="text"
                                value={sub.title || ''}
                                onChange={e => handleGenSubChange(idx, 'title', e.target.value)}
                                className={styles.textInput}
                                placeholder="Subtopic title"
                            />
                            <label>Content</label>
                            <textarea
                                value={sub.content || ''}
                                onChange={e => handleGenSubChange(idx, 'content', e.target.value)}
                                className={styles.textarea}
                                placeholder="Subtopic content"
                                rows={3}
                            />
                        </div>
                    ))}
                    <button
                        onClick={handleSaveGenerated}
                        disabled={isSaving}
                        className={styles.saveBtn}
                    >
                        {isSaving ? 'Saving...' : 'Save All Subtopics'}
                    </button>
                </div>
            )}
        </div>
    );

    const renderEditView = () => (
        <div className={styles.container}>
            <div className={styles.header}>
                <button 
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        setView('list');
                        setSelectedTopic(null);
                        setSubtopics([]);
                        setEditingTopic(null);
                        setEditingSubtopics([]);
                    }} 
                    className={styles.backBtn}
                >
                    ← Back to Topics
                </button>
                <h2 className={styles.title}>Edit Topic</h2>
            </div>

            <div className={styles.editForm}>
                <div className={styles.formGroup}>
                    <label>Topic Title</label>
                    <input
                        type="text"
                        value={editingTopic.title}
                        onChange={e => setEditingTopic({ ...editingTopic, title: e.target.value })}
                        className={styles.textInput}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Description</label>
                    <textarea
                        value={editingTopic.description}
                        onChange={e => setEditingTopic({ ...editingTopic, description: e.target.value })}
                        className={styles.textarea}
                        rows={3}
                    />
                </div>

                <h3 className={styles.subHeader}>Subtopics</h3>
                {editingSubtopics.map((sub, idx) => (
                    <div key={idx} className={styles.subtopicItem}>
                        <div className={styles.subtopicHeader}>
                            <span>Subtopic {idx + 1}</span>
                            <button
                                type="button"
                                onClick={() => handleRemoveSubtopic(idx)}
                                className={styles.removeBtn}
                            >
                                Remove
                            </button>
                        </div>
                        <label>Title</label>
                        <input
                            type="text"
                            value={sub.title || ''}
                            onChange={e => handleEditSubtopic(idx, 'title', e.target.value)}
                            className={styles.textInput}
                            placeholder="Subtopic title"
                        />
                        <label>Content</label>
                        <textarea
                            value={sub.content || ''}
                            onChange={e => handleEditSubtopic(idx, 'content', e.target.value)}
                            className={styles.textarea}
                            placeholder="Subtopic content"
                            rows={3}
                        />
                    </div>
                ))}

                <button 
                    type="button"
                    onClick={handleAddNewSubtopic} 
                    className={styles.addSubBtn}
                >
                    + Add Subtopic
                </button>

                <div className={styles.formActions}>
                    <button
                        type="button"
                        onClick={handleSaveEdit}
                        disabled={isEditing}
                        className={styles.saveBtn}
                    >
                        {isEditing ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {view === 'list' && renderListView()}
            {view === 'generate' && renderGenerateView()}
            {view === 'edit' && renderEditView()}
        </>
    );
};

export default AdminTopics;

