import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import QRCode from 'react-qr-code';
import useAdminStore from '../../../store/adminStore';
import styles from './PromoCodeForm.module.css';

/**
 * A promo is shared three ways, all derived from the same code:
 *   1. the random code  — typed by a user
 *   2. the link         — sent as a URL
 *   3. the QR code      — scanned from a poster
 *
 * The QR previews live here so the admin sees exactly what will be printed.
 * Redemption rules are intentionally not included yet.
 */
const PromoCodeForm = ({ promo, onSuccess, onCancel }) => {
    const { createPromoCode, updatePromoCode, generatePromoCode, isFetching } = useAdminStore();
    const isEditing = !!promo;

    const [isGenerating, setIsGenerating] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm({
        defaultValues: { title: '', code: '', link: '', notes: '', isActive: true }
    });

    // Must mirror backend `clientBaseUrl()` in PromoCodeService, which builds
    // links from process.env.CLIENT_URL. If only one side is configured the two
    // would disagree and the admin's QR would point somewhere the backend never
    // intended. VITE_CLIENT_URL is the required source; the fallback only keeps
    // a local dev server working before .env is set up.
    const clientBase = (
        import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173'
    ).replace(/\/+$/, '');
    const buildLink = (code) => (code ? `${clientBase}/promo/${code}` : '');

    const code = watch('code');
    const link = watch('link');

    // Link always mirrors the code unless the admin typed a custom one.
    useEffect(() => {
        if (code) {
            setValue('link', `${clientBase}/promo/${code.toUpperCase()}`);
        }
    }, [code, clientBase, setValue]);

    useEffect(() => {
        if (promo) {
            reset({
                title: promo.title || '',
                code: promo.code || '',
                link: promo.link || '',
                notes: promo.notes || '',
                isActive: promo.isActive !== false
            });
        } else {
            reset({ title: '', code: '', link: '', notes: '', isActive: true });
        }
    }, [promo, reset]);

    const onGenerate = async () => {
        setIsGenerating(true);
        const generated = await generatePromoCode();
        setIsGenerating(false);
        if (generated?.code) {
            setValue('code', generated.code, { shouldDirty: true });
            setValue('link', generated.link || buildLink(generated.code), { shouldDirty: true });
        }
    };

    const onSubmit = async (data) => {
        const payload = {
            title: data.title,
            code: (data.code || '').toUpperCase().trim(),
            notes: data.notes || '',
            isActive: data.isActive
        };

        const success = isEditing
            ? await updatePromoCode(promo._id, payload)
            : await createPromoCode(payload);

        if (success) onSuccess();
    };

    const qrValue = (link || '').trim() || buildLink((code || '').toUpperCase());

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // Clipboard blocked (insecure context / permissions) — the field
            // stays selectable so the admin can copy manually.
        }
    };

    return (
        <form className={styles.promoForm} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.field}>
                <label className={styles.label}>Title *</label>
                <input
                    type="text"
                    className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                    {...register('title', { required: 'Title is required' })}
                    placeholder="e.g., Spring Semester Launch"
                />
                {errors.title && <span className={styles.errorText}>{errors.title.message}</span>}
            </div>

            {/* 1. Random promo code */}
            <div className={styles.field}>
                <label className={styles.label}>Promo Code</label>
                <div className={styles.codeRow}>
                    <input
                        type="text"
                        className={`${styles.input} ${styles.codeInput} ${errors.code ? styles.inputError : ''}`}
                        {...register('code', {
                            pattern: { value: /^[A-Za-z0-9-]*$/, message: 'Letters, numbers and dashes only' }
                        })}
                        placeholder="Leave blank for a random code"
                    />
                    <button
                        type="button"
                        className={styles.generateBtn}
                        onClick={onGenerate}
                        disabled={isGenerating || isFetching}
                    >
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </button>
                </div>
                <p className={styles.hint}>Leave empty and one is generated automatically.</p>
                {errors.code && <span className={styles.errorText}>{errors.code.message}</span>}
            </div>

            {/* 2. Shareable link */}
            <div className={styles.field}>
                <label className={styles.label}>Link</label>
                <div className={styles.linkRow}>
                    <input
                        type="url"
                        className={`${styles.input} ${styles.linkInput}`}
                        {...register('link')}
                        placeholder="https://www.mypreprx.com/promo/CODE"
                    />
                    <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={() => copyToClipboard(link)}
                        disabled={!link}
                        title="Copy link"
                    >
                        Copy
                    </button>
                </div>
                <p className={styles.hint}>Updates automatically from the code unless you replace it.</p>
            </div>

            {/* 3. QR code */}
            <div className={styles.field}>
                <label className={styles.label}>QR Code</label>
                <div className={styles.qrBox}>
                    {qrValue ? (
                        <QRCode value={qrValue} size={150} bgColor="#ffffff" fgColor="#083862" />
                    ) : (
                        <div className={styles.qrPlaceholder}>
                            Generate a code or link to preview the QR.
                        </div>
                    )}
                </div>
                <p className={styles.hint}>Scans to the link above. Download from the saved promo.</p>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Notes (optional)</label>
                <textarea
                    className={`${styles.input} ${styles.textarea}`}
                    {...register('notes')}
                    rows={3}
                    placeholder="Internal notes about this promo"
                />
            </div>

            <label className={styles.switchRow}>
                <input type="checkbox" {...register('isActive')} />
                <span>Active</span>
            </label>

            <div className={styles.actions}>
                <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={isFetching}>
                    Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={isFetching}>
                    {isFetching ? 'Saving...' : (isEditing ? 'Update Promo' : 'Create Promo')}
                </button>
            </div>
        </form>
    );
};

export default PromoCodeForm;