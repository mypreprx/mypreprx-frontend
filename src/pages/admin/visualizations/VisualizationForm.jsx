import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useAdminStore from '../../../store/adminStore';
import styles from './VisualizationForm.module.css';

const VisualizationForm = ({ visual, onSuccess, onCancel }) => {
    const { createVisualization, updateVisualization, isLoading } = useAdminStore();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm({
        defaultValues: {
            title: '',
            subtitle: '',
            description: '',
            isActive: true
        }
    });

    const [uploadProgress, setUploadProgress] = useState(0);

    const isEditing = !!visual;

    useEffect(() => {
        if (visual) {
            reset({
                title: visual.title || '',
                subtitle: visual.subtitle || '',
                description: visual.description || '',
                isActive: visual.isActive ?? true
            });
        }
    }, [visual, reset]);

    const onSubmit = async (data) => {
        setUploadProgress(0);
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('subtitle', data.subtitle);
        formData.append('description', data.description);
        formData.append('isActive', data.isActive ? 'true' : 'false');

        if (data.media?.[0]) {
            formData.append('media', data.media[0]);
        }

        if (data.thumbnail?.[0]) {
            formData.append('thumbnail', data.thumbnail[0]);
        }

        let success = false;
        if (isEditing) {
            success = await updateVisualization(visual._id, formData, setUploadProgress);
        } else {
            success = await createVisualization(formData, setUploadProgress);
        }

        if (success) {
            onSuccess();
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.field}>
                <label className={styles.label}>Title *</label>
                <input
                    type="text"
                    className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                    {...register('title', { required: 'Title is required' })}
                    placeholder="Enter title"
                />
                {errors.title && <span className={styles.errorText}>{errors.title.message}</span>}
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Subtitle *</label>
                <input
                    type="text"
                    className={`${styles.input} ${errors.subtitle ? styles.inputError : ''}`}
                    {...register('subtitle', { required: 'Subtitle is required' })}
                    placeholder="Enter subtitle"
                />
                {errors.subtitle && <span className={styles.errorText}>{errors.subtitle.message}</span>}
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Description *</label>
                <textarea
                    className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                    {...register('description', { required: 'Description is required' })}
                    placeholder="Add a short description"
                    rows={4}
                />
                {errors.description && <span className={styles.errorText}>{errors.description.message}</span>}
            </div>

            <div className={styles.fieldCheckbox}>
                <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                />
                <label htmlFor="isActive" className={styles.checkboxLabel}>
                    Active
                </label>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Media File (Audio/Video) {isEditing ? '(leave blank to keep current media)' : '*'}</label>
                <input
                    type="file"
                    className={`${styles.fileInput} ${errors.media ? styles.inputError : ''}`}
                    {...register('media', {
                        required: !isEditing ? 'Media file is required' : false,
                        validate: {
                            fileSize: (files) => {
                                if (files && files[0]) {
                                    const maxBytes = 200 * 1024 * 1024; // 200 MB limit
                                    if (files[0].size > maxBytes) {
                                        const sizeMb = (files[0].size / (1024 * 1024)).toFixed(1);
                                        return `File is too large (${sizeMb} MB). Maximum allowed size is 200 MB.`;
                                    }
                                }
                                return true;
                            }
                        }
                    })}
                    accept="audio/*,video/*"
                />
                <span className={styles.hintText}>Maximum allowed size: 200 MB</span>
                {errors.media && <span className={styles.errorText}>{errors.media.message}</span>}
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Thumbnail (optional)</label>
                <input
                    type="file"
                    className={`${styles.fileInput} ${errors.thumbnail ? styles.inputError : ''}`}
                    {...register('thumbnail', {
                        validate: {
                            fileSize: (files) => {
                                if (files && files[0]) {
                                    const maxBytes = 10 * 1024 * 1024; // 10 MB limit
                                    if (files[0].size > maxBytes) {
                                        const sizeMb = (files[0].size / (1024 * 1024)).toFixed(1);
                                        return `Thumbnail is too large (${sizeMb} MB). Maximum allowed size is 10 MB.`;
                                    }
                                }
                                return true;
                            }
                        }
                    })}
                    accept="image/*"
                />
                <span className={styles.hintText}>Maximum allowed size: 10 MB</span>
                {errors.thumbnail && <span className={styles.errorText}>{errors.thumbnail.message}</span>}
            </div>

            {isLoading && (
                <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <span className={styles.progressText}>
                        {uploadProgress > 0 ? `Uploading: ${uploadProgress}%` : 'Processing file on server...'}
                    </span>
                </div>
            )}

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
                    {isLoading
                        ? uploadProgress > 0
                            ? `Uploading (${uploadProgress}%)...`
                            : 'Processing...'
                        : isEditing
                        ? 'Update Visualization'
                        : 'Add Visualization'}
                </button>
            </div>
        </form>
    );
};

export default VisualizationForm;
