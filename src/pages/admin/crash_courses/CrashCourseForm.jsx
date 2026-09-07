import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useAdminStore from '../../../store/adminStore';
import styles from './CrashCourseForm.module.css';

const CrashCourseForm = ({ course, onSuccess, onCancel }) => {
    const { topics, fetchTopics, addCourse, updateCourse, isLoading } = useAdminStore();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm({
        defaultValues: {
            title: '',
            topicId: '',
            duration: '',
        }
    });

    const isEditing = !!course;

    useEffect(() => {
        fetchTopics();
    }, []);

  useEffect(() => {
    if (course) {
        reset({
            title: course.title || '',
            topicId: course.topicId?._id || '', // FIXED: Binds to the ID
            duration: course.duration || '',
        });
    }
}, [course, reset]);

    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append('Title', data.title);
        formData.append('topicId', data.topicId);
        formData.append('duration', data.duration);

        if (data.file?.[0]) {
            formData.append('file', data.file[0]);
        }

        if (data.thumbnail?.[0]) {
            formData.append('thumbnail', data.thumbnail[0]);
        }

        let success = false;
        if (isEditing) {
            success = await updateCourse(course._id, formData);
        } else {
            success = await addCourse(formData);
        }

        if (success) {
            onSuccess();
        }
    };

    return (
        <form className={styles.courseForm} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.field}>
                <label className={styles.label}>Title *</label>
                <input
                    type="text"
                    className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                    {...register('title', { required: 'Title is required' })}
                    placeholder="Enter course title"
                />
                {errors.title && <span className={styles.errorText}>{errors.title.message}</span>}
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Topic *</label>
                <select
                    className={`${styles.select} ${errors.topicId ? styles.inputError : ''}`}
                    {...register('topicId', { required: 'Topic is required' })}
                >
                    <option value="">Select a topic</option>
                    {topics.map((topic) => (
                        <option key={topic._id} value={topic._id}>
                            {topic.title}
                        </option>
                    ))}
                </select>
                {errors.topicId && <span className={styles.errorText}>{errors.topicId.message}</span>}
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Duration (minutes for videos, pages for PDFs) *</label>
                <input
                    type="number"
                    className={`${styles.input} ${errors.duration ? styles.inputError : ''}`}
                    {...register('duration', {
                        required: 'Duration is required',
                        min: { value: 1, message: 'Min duration is 1' }
                    })}
                    placeholder="e.g., 30"
                />
                {errors.duration && <span className={styles.errorText}>{errors.duration.message}</span>}
            </div>

            <div className={styles.field}>
                <label className={styles.label}>
                    Main File (Video/PDF/Image) {!isEditing && '*'}
                </label>
                <input
                    type="file"
                    className={styles.fileInput}
                    {...register('file', { required: !isEditing ? 'File is required' : false })}
                    accept="video/*,application/pdf,image/*"
                />
                {errors.file && <span className={styles.errorText}>{errors.file.message}</span>}
                {isEditing && (
                    <p className={styles.hint}>Leave empty to keep current file</p>
                )}
            </div>

            <div className={styles.field}>
                <label className={styles.label}>
                    Thumbnail Image (Optional)
                </label>
                <input
                    type="file"
                    className={styles.fileInput}
                    {...register('thumbnail')}
                    accept="image/*"
                />
                <p className={styles.hint}>Recommended size: 16:9 aspect ratio</p>
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isLoading}
                >
                    {isLoading ? 'Saving...' : (isEditing ? 'Update Course' : 'Add Course')}
                </button>
            </div>
        </form>
    );
};

export default CrashCourseForm;

