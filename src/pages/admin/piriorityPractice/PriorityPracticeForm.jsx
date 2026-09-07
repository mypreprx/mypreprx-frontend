import { useState, useEffect } from 'react';
import styles from './PriorityPracticeForm.module.css';

const PriorityPracticeForm = ({ practice, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        level: 'beginner',
        image: '',
        questions: [],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (practice) {
            setFormData(practice);
        }
    }, [practice]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    image: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const url = practice
                // ? `http://localhost:4001/api/priority-practices/${practice._id}`
                // : 'http://localhost:4001/api/priority-practices';
                ? `https://api.mypreprx.com/api/priority-practices/${practice._id}`
                : 'https://api.mypreprx.com/api/priority-practices';

            const method = practice ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to save practice');

            onSuccess();
        } catch (err) {
            setError(err.message || 'An error occurred');
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2 className={styles.title}>
                {practice ? 'Edit Priority Practice' : 'Create Priority Practice'}
            </h2>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="title">Title *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Enter title"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter description"
                        className={styles.textarea}
                        rows="4"
                    />
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="level">Level *</label>
                        <select
                            id="level"
                            name="level"
                            value={formData.level}
                            onChange={handleChange}
                            className={styles.select}
                        >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="image">Image</label>
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className={styles.input}
                        />
                    </div>
                </div>

                {formData.image && (
                    <div className={styles.imagePreview}>
                        <img src={formData.image} alt="Preview" />
                    </div>
                )}

                <div className={styles.buttonGroup}>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={styles.submitBtn}
                    >
                        {isSubmitting ? 'Saving...' : practice ? 'Update' : 'Create'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className={styles.cancelBtn}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PriorityPracticeForm;
