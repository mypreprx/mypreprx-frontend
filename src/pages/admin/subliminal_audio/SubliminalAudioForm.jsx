import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useSubliminalStore from '../../../store/subliminalStore';
import styles from './SubliminalAudioForm.module.css';

const SubliminalAudioForm = ({ audio, onSuccess, onCancel }) => {
    const { uploadAudio, updateAudio, isLoading } = useSubliminalStore();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            title: '',
            category: '',
            isActive: true
        }
    });

    const isEditing = !!audio;

    useEffect(() => {
        if (audio) {
            reset({
                title: audio.title || '',
                category: audio.category || '',
                isActive: audio.isActive ?? true
            });
        }
    }, [audio, reset]);

    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('category', data.category);
        formData.append('isActive', data.isActive);

        if (data.audio?.[0]) {
            formData.append('audio', data.audio[0]);
        }

        let success = false;
        if (isEditing) {
            success = await updateAudio(audio._id, formData);
        } else {
            success = await uploadAudio(formData);
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
                    placeholder="Enter audio title"
                />
                {errors.title && <span className={styles.errorText}>{errors.title.message}</span>}
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Category *</label>
                <input
                    type="text"
                    className={`${styles.input} ${errors.category ? styles.inputError : ''}`}
                    {...register('category', { required: 'Category is required' })}
                    placeholder="e.g., Confidence, Focus, Calm"
                />
                {errors.category && <span className={styles.errorText}>{errors.category.message}</span>}
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Audio File {isEditing ? '(Optional)' : '*'}</label>
                <input
                    type="file"
                    className={styles.fileInput}
                    {...register('audio', { required: !isEditing ? 'Audio file is required' : false })}
                    accept="audio/*"
                />
                {errors.audio && <span className={styles.errorText}>{errors.audio.message}</span>}
                {isEditing && <p className={styles.hint}>Leave empty to keep existing audio file.</p>}
            </div>

            {isEditing && (
                <div className={styles.field}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            className={styles.hiddenCheckbox}
                            {...register('isActive')}
                        />
                        <span className={styles.customCheckbox}></span>
                        <span className={styles.label}>Is Active</span>
                    </label>
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
                    {isLoading ? 'Saving...' : (isEditing ? 'Update Audio' : 'Add Audio')}
                </button>
            </div>
        </form>
    );
};

export default SubliminalAudioForm;
