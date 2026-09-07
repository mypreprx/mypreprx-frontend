import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../config/axiosInstance';
import styles from './AdminPriorityPracticeGenerator.module.css';
import toast from 'react-hot-toast';
import GeneratingModal from '../../../components/common/GeneratingModal';

const AdminPriorityPracticeGenerator = () => {
    const navigate = useNavigate();
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [subtopics, setSubtopics] = useState([]);
    const [selectedSubtopic, setSelectedSubtopic] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [editedCase, setEditedCase] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            console.log('Fetching topics...');
            const response = await api.get('/admin/alltopics');
            console.log('Topics fetched:', response.data);
            setTopics(response.data.data || response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching topics:', err);
            setError(`Failed to fetch topics: ${err.message}`);
            setTopics([]);
        }
    };

    const handleTopicSelect = async (topicId) => {
        setSelectedTopic(topicId);
        setSelectedSubtopic(null);
        setEditedCase(null);
        setShowForm(false);
        setError('');

        try {
            console.log('Fetching subtopics for topic:', topicId);
            const response = await api.get(`/admin/subtopicsforTopic/${topicId}`);
            console.log('Subtopics response:', response);
            console.log('Subtopics data:', response.data);
            setSubtopics(response.data.data || response.data);
        } catch (err) {
            console.error('Error fetching subtopics:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            console.error('Error message:', err.message);
            setError(`Failed to fetch subtopics: ${err.response?.data?.message || err.message}`);
            setSubtopics([]);
        }
    };

    const handleGenerateCase = async (subtopicId) => {
        setSelectedSubtopic(subtopicId);
        setIsGenerating(true);
        setError('');

        try {
            const { data } = await api.post('/admin/genratePiriorityPractice', { subTopicId: subtopicId });

            // Axios already throws on non-2xx, but handle safety
            if (!data) throw new Error('Empty response from server');

            setEditedCase(JSON.parse(JSON.stringify(data.data))); // Deep copy for editing
            setShowForm(true);
            toast.success('Case study generated successfully!');
            setIsGenerating(false);
        } catch (err) {
            console.error('Error generating case study:', err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to generate case study';
            setError(errorMessage);
            toast.error(errorMessage);
            setIsGenerating(false);
        }
    };

    const handleEditField = (field, value) => {
        if (field.startsWith('patientChart.')) {
            const subField = field.replace('patientChart.', '');
            setEditedCase(prev => ({
                ...prev,
                patientChart: {
                    ...prev.patientChart,
                    [subField]: value
                }
            }));
        } else if (field === 'title' || field === 'difficulty' || field === 'scenarioNarrative') {
            setEditedCase(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleEditQuestion = (questionIndex, field, value) => {
        setEditedCase(prev => {
            const newQuestions = [...prev.questions];
            newQuestions[questionIndex] = {
                ...newQuestions[questionIndex],
                [field]: value
            };
            return {
                ...prev,
                questions: newQuestions
            };
        });
    };

    const handleSaveCase = async () => {
        setIsSaving(true);
        setError('');

        try {
            const payload = {
                ...editedCase,
                subTopic: selectedSubtopic
            };

            let responseData;

            // If the case already exists (has an _id), call the update endpoint
            if (editedCase && (editedCase._id || editedCase.id)) {
                const practiceId = editedCase._id || editedCase.id;
                const res = await api.post(`/admin/updatePiriorityPractice/${practiceId}`, payload);
                responseData = res.data;
            } else {
                // Create new practice
                const res = await api.post('/priority-practice', payload);
                responseData = res.data;
            }

            if (!responseData) throw new Error('Failed to save case study');

            // Update local editedCase with whatever the server returned (new or updated)
            if (responseData.data) {
                setEditedCase(JSON.parse(JSON.stringify(responseData.data)));
            }

            setIsSaving(false);
            setError('');
            toast.success('Case study saved successfully!');
            setShowForm(false);
            setSelectedSubtopic(null);
        } catch (err) {
            setError(err.message || 'Failed to save case study');
            toast.error(err.message || 'Failed to save case study');
            setIsSaving(false);
        }
    };

    const handlePlayCase = () => {
        if (!editedCase) {
            toast.error('No case study to play');
            return;
        }

        // Navigate to the priority practice player with the case study data
        navigate('/study-zone/priority-practice-player', {
            state: { caseStudy: editedCase }
        });
    };

    return (
        <div className={styles.container}>
            {/* Generating overlay popup */}
            <GeneratingModal isOpen={isGenerating} message="AI is generating the priority practice case study. This may take up to 30 seconds." />

            <h1 className={styles.title}>Generate Priority Practice Cases</h1>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.layout}>
                {/* Topics Panel */}
                <div className={styles.panel}>
                    <h2 className={styles.panelTitle}>Topics</h2>
                    <div className={styles.topicList}>
                        {topics.length > 0 ? (
                            topics.map(topic => (
                                <button
                                    key={topic._id}
                                    className={`${styles.topicButton} ${selectedTopic === topic._id ? styles.active : ''}`}
                                    onClick={() => handleTopicSelect(topic._id)}
                                >
                                    {topic.title}
                                </button>
                            ))
                        ) : (
                            <p className={styles.noData}>No topics found</p>
                        )}
                    </div>
                </div>

                {/* Subtopics Panel - Only show when topic is selected */}
                {selectedTopic ? (
                    <div className={styles.panel}>
                        <h2 className={styles.panelTitle}>Subtopics</h2>
                        <div className={styles.subtopicList}>
                            {subtopics.length > 0 ? (
                                subtopics.map(subtopic => (
                                    <div key={subtopic._id} className={styles.subtopicCard}>
                                        <div className={styles.subtopicInfo}>
                                            <h3>{subtopic.title}</h3>
                                            <p>{subtopic.description || 'No description'}</p>
                                        </div>
                                        <button
                                            className={styles.generateBtn}
                                            onClick={() => handleGenerateCase(subtopic._id)}
                                            disabled={isGenerating}
                                        >
                                            {isGenerating && selectedSubtopic === subtopic._id
                                                ? 'Generating...'
                                                : 'Generate Case'}
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.noData}>No subtopics found</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={styles.panel}>
                        <div className={styles.placeholderMessage}>
                            <p>👈 Select a topic to view subtopics</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Generated Case Form */}
            {showForm && editedCase && (
                <div className={styles.formPanel}>
                    <div className={styles.formHeader}>
                        <h2>Edit Generated Case Study</h2>
                        <button
                            className={styles.closeBtn}
                            onClick={() => setShowForm(false)}
                        >
                            ✕
                        </button>
                    </div>

                    <div className={styles.formContent}>
                        {/* Basic Info */}
                        <div className={styles.section}>
                            <h3>Case Study Information</h3>

                            <div className={styles.formGroup}>
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={editedCase.title}
                                    onChange={(e) => handleEditField('title', e.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Difficulty</label>
                                <select
                                    value={editedCase.difficulty}
                                    onChange={(e) => handleEditField('difficulty', e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Scenario Narrative</label>
                                <textarea
                                    value={editedCase.scenarioNarrative}
                                    onChange={(e) => handleEditField('scenarioNarrative', e.target.value)}
                                    className={styles.textarea}
                                    rows="4"
                                />
                            </div>
                        </div>

                        {/* Patient Chart */}
                        <div className={styles.section}>
                            <h3>Patient Chart</h3>
                            <div className={styles.chartGrid}>
                                {Object.entries(editedCase.patientChart).map(([key, value]) => (
                                    <div key={key} className={styles.formGroup}>
                                        <label>{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                                        {key === 'history' || key === 'assessment' || key === 'orders' || key === 'labs' ? (
                                            <textarea
                                                value={value}
                                                onChange={(e) => handleEditField(`patientChart.${key}`, e.target.value)}
                                                className={styles.textarea}
                                                rows="2"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => handleEditField(`patientChart.${key}`, e.target.value)}
                                                className={styles.input}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Questions */}
                        <div className={styles.section}>
                            <h3>Clinical Judgment Questions</h3>
                            {editedCase.questions && editedCase.questions.map((question, idx) => (
                                <div key={idx} className={styles.questionCard}>
                                    <div className={styles.questionHeader}>
                                        <h4>Step {question.step}: {question.cjmStage}</h4>
                                        <span className={styles.badge}>{question.questionType}</span>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Question Text</label>
                                        <textarea
                                            value={question.questionText}
                                            onChange={(e) => handleEditQuestion(idx, 'questionText', e.target.value)}
                                            className={styles.textarea}
                                            rows="2"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Options</label>
                                        {question.options && question.options.map((option, optIdx) => (
                                            <div key={optIdx} className={styles.optionInput}>
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => {
                                                        const newOptions = [...question.options];
                                                        newOptions[optIdx] = e.target.value;
                                                        handleEditQuestion(idx, 'options', newOptions);
                                                    }}
                                                    className={styles.input}
                                                    placeholder={`Option ${optIdx + 1}`}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Correct Answer</label>
                                            <input
                                                type="text"
                                                value={question.correctAnswer}
                                                onChange={(e) => handleEditQuestion(idx, 'correctAnswer', e.target.value)}
                                                className={styles.input}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Rationale</label>
                                        <textarea
                                            value={question.rationale}
                                            onChange={(e) => handleEditQuestion(idx, 'rationale', e.target.value)}
                                            className={styles.textarea}
                                            rows="2"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Distractor Explanation</label>
                                        <textarea
                                            value={question.distractorExplanation}
                                            onChange={(e) => handleEditQuestion(idx, 'distractorExplanation', e.target.value)}
                                            className={styles.textarea}
                                            rows="2"
                                        />
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Key Takeaway</label>
                                            <input
                                                type="text"
                                                value={question.keyTakeaway}
                                                onChange={(e) => handleEditQuestion(idx, 'keyTakeaway', e.target.value)}
                                                className={styles.input}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Strategy Tip</label>
                                            <input
                                                type="text"
                                                value={question.strategyTip}
                                                onChange={(e) => handleEditQuestion(idx, 'strategyTip', e.target.value)}
                                                className={styles.input}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className={styles.actionButtons}>
                            <button
                                className={styles.playBtn}
                                onClick={handlePlayCase}
                                disabled={isSaving}
                            >
                                Test Case
                            </button>
                            <button
                                className={styles.saveBtn}
                                onClick={handleSaveCase}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Case Study'}
                            </button>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => setShowForm(false)}
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPriorityPracticeGenerator;
