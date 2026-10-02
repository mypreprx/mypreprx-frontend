import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QRCode from 'react-qr-code';
import useAdminStore from '../../../store/adminStore';
import Modal from '../../../components/common/modal/Modal';
import ConfirmationModal from '../../../components/common/modal/ConfirmationModal';
import PromoCodeForm from './PromoCodeForm';
import toast from 'react-hot-toast';
import { AdminEditIcon, AdminDeleteIcon } from '../../../components/common/Icons';
import styles from './AdminPromoCodes.module.css';

/**
 * Promo codes are shared three ways — as a random code, a link, or a QR code.
 *
 * Every code is strictly single-use. The "Redeemed by" column is the audit
 * trail: once a code shows a user it can never be claimed again, by that user
 * (a retry just returns the same grant) or anyone else.
 */
const AdminPromoCodes = () => {
    const { promoCodes, fetchPromoCodes, deletePromoCode, downloadPromoQr } = useAdminStore();
    const [editingPromo, setEditingPromo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, promo: null });
    const [qrPromo, setQrPromo] = useState(null);
    const [sharePromo, setSharePromo] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    const isCreateRoute = location.pathname === '/admin/promo-codes/create';
    const isEditRoute = location.pathname.startsWith('/admin/promo-codes/edit');

    useEffect(() => {
        fetchPromoCodes();
    }, [fetchPromoCodes]);

    const openDeleteModal = (promo) => setDeleteModal({ isOpen: true, promo });
    const closeDeleteModal = () => setDeleteModal({ isOpen: false, promo: null });

    const handleDelete = async () => {
        const { promo } = deleteModal;
        if (!promo) return;
        const success = await deletePromoCode(promo._id);
        if (success) closeDeleteModal();
    };

    const handleCreate = () => {
        setEditingPromo(null);
        navigate('/admin/promo-codes/create');
    };

    const handleEdit = (promo) => {
        setEditingPromo(promo);
        navigate('/admin/promo-codes/edit');
    };

    const handleCloseModal = () => {
        setEditingPromo(null);
        navigate('/admin/promo-codes');
    };

    const copyText = async (text, label = 'Copied') => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(label);
        } catch {
            // Clipboard blocked (insecure context or denied permission) — fall
            // back to a selectable prompt so the admin can still copy manually.
            window.prompt('Copy this:', text);
        }
    };

    /**
     * Native share sheet where supported (mobile, desktop app), otherwise
     * copies the link. Email is tried before the generic fallback because a
     * promo link is usually sent by email in practice.
     */
    const sharePromoLink = async (promo) => {
        const { link, code, title } = promo;
        const text = `${title} — 6 months of PrepRX free with code ${code}: ${link}`;

        if (navigator.share) {
            try {
                await navigator.share({ title: `${title} — 6 months free`, text, url: link });
                return;
            } catch (err) {
                // AbortError just means the user dismissed the sheet.
                if (err?.name === 'AbortError') return;
            }
        }

        try {
            await navigator.clipboard.writeText(text);
            toast.success('Share text copied — paste it anywhere');
        } catch {
            window.prompt('Copy and share this promo:', text);
        }
    };

    const shareByEmail = (promo) => {
        const subject = encodeURIComponent(`${promo.title} — 6 months of PrepRX free`);
        const body = encodeURIComponent(
            `You're invited!\n\nRedeem 6 months of free PrepRX access with code ${promo.code}.\n\n${promo.link}\n\nThis code can be used once.`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const handleDownloadQr = (promo) => downloadPromoQr(promo._id, promo.code);

    const isRedeemed = (promo) => Boolean(promo.redeemedBy || promo.redeemedAt);

    const filteredPromos = promoCodes.filter((promo) => {
        const term = searchTerm.toLowerCase();
        const redeemer = promo.redeemedBy?.username || promo.redeemedBy?.email || '';
        const matchesSearch =
            promo.title?.toLowerCase().includes(term) ||
            promo.code?.toLowerCase().includes(term) ||
            // Let an admin find a code by searching for the person who used it.
            redeemer.toLowerCase().includes(term) ||
            (promo.redemptionEmail || '').toLowerCase().includes(term);
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active'
                ? promo.isActive && !isRedeemed(promo)
                : statusFilter === 'redeemed'
                  ? isRedeemed(promo)
                  : !promo.isActive);
        return matchesSearch && matchesStatus;
    });

    const activeCount = promoCodes.filter((p) => p.isActive).length;
    const redeemedCount = promoCodes.filter(isRedeemed).length;
    const availableCount = promoCodes.length - redeemedCount;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Promo Codes</h2>
                    <p className={styles.description}>
                        Create promo codes to share as a random code, a link, or a QR code.
                    </p>
                </div>
                <button className={styles.addBtn} onClick={handleCreate}>
                    + Add New Promo
                </button>
            </div>

            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{promoCodes.length}</span>
                    <span className={styles.statLabel}>Total Promos</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{activeCount}</span>
                    <span className={styles.statLabel}>Active</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{availableCount}</span>
                    <span className={styles.statLabel}>Unredeemed</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{redeemedCount}</span>
                    <span className={styles.statLabel}>Redeemed</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{promoCodes.length - activeCount}</span>
                    <span className={styles.statLabel}>Inactive</span>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        placeholder="Search by title or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.filtersWrapper}>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="redeemed">Redeemed</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Promo Code</th>
                            <th>Link</th>
                            <th>Status</th>
                            <th>Redeemed By</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPromos.length === 0 ? (
                            <tr>
                                <td colSpan="8" className={styles.emptyState}>
                                    <div className={styles.noDataInfo}>
                                        <p>
                                            {promoCodes.length === 0
                                                ? "There's no promo code yet"
                                                : 'No promo codes match your filters.'}
                                        </p>
                                        <button onClick={handleCreate}>Add Promo</button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredPromos.map((promo, index) => (
                                <tr key={promo._id}>
                                    <td>{index + 1}</td>
                                    <td className={styles.promoTitle}>{promo.title}</td>
                                    <td>
                                        <code className={styles.codeChip}>{promo.code}</code>
                                    </td>
                                    <td>
                                        <div className={styles.linkCell}>
                                            <a
                                                href={promo.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.linkAnchor}
                                                title={promo.link}
                                            >
                                                {promo.link}
                                            </a>
                                            <button
                                                className={styles.copyLinkBtn}
                                                onClick={() => copyText(promo.link)}
                                                title="Copy link"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        {isRedeemed(promo) ? (
                                            <span className={`${styles.statusBadge} ${styles.redeemed}`}>
                                                Used
                                            </span>
                                        ) : (
                                            <span
                                                className={`${styles.statusBadge} ${promo.isActive ? styles.active : styles.inactive}`}
                                            >
                                                {promo.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {isRedeemed(promo) ? (
                                            <div className={styles.redeemerCell}>
                                                <span className={styles.redeemerName}>
                                                    {promo.redeemedBy?.username || promo.redemptionEmail || 'Deleted user'}
                                                </span>
                                                <span className={styles.redeemerEmail}>
                                                    {promo.redeemedBy?.email || promo.redemptionEmail || '—'}
                                                </span>
                                                <span className={styles.redeemedAt}>
                                                    {new Date(promo.redeemedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className={styles.notRedeemed}>—</span>
                                        )}
                                    </td>
                                    <td>{new Date(promo.createdAt).toLocaleDateString()}</td>
                                    <td className={styles.actions}>
                                        <button
                                            className={styles.qrBtn}
                                            onClick={() => setSharePromo(promo)}
                                            title="Share promo"
                                            aria-label={`Share promo ${promo.code}`}
                                        >Share
                                        </button>
                                        <button
                                            className={styles.qrBtn}
                                            onClick={() => setQrPromo(promo)}
                                            title="View QR code"
                                        >
                                            <QRCode value={promo.qrPayload || promo.link} size={20} bgColor="#ffffff" fgColor="#083862" />
                                        </button>
                                        <button
                                            className={styles.downloadBtn}
                                            onClick={() => handleDownloadQr(promo)}
                                            title="Download QR as PNG"
                                            aria-label={`Download QR for ${promo.code}`}
                                        >
                                            Download
                                        </button>
                                        <button
                                            className={styles.shareBtn}
                                            onClick={() => sharePromoLink(promo)}
                                            title="Share promo"
                                            aria-label={`Share promo ${promo.code}`}
                                        >
                                            Share
                                        </button>
                                        <button
                                            className={styles.editBtn}
                                            onClick={() => handleEdit(promo)}
                                            title="Edit"
                                        >
                                            <AdminEditIcon />
                                        </button>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => openDeleteModal(promo)}
                                            title="Delete"
                                        >
                                            <AdminDeleteIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isCreateRoute || isEditRoute}
                onClose={handleCloseModal}
                title={editingPromo ? 'Edit Promo Code' : 'Add Promo Code'}
            >
                <PromoCodeForm
                    promo={editingPromo}
                    onSuccess={handleCloseModal}
                    onCancel={handleCloseModal}
                />
            </Modal>

            <Modal
                isOpen={!!qrPromo}
                onClose={() => setQrPromo(null)}
                title={qrPromo?.title}
            >
                {qrPromo && (
                    <div className={styles.qrModalBody}>
                        <div className={styles.qrModalFrame}>
                            <QRCode
                                value={qrPromo.qrPayload || qrPromo.link}
                                size={200}
                                bgColor="#ffffff"
                                fgColor="#083862"
                            />
                        </div>
                        <p className={styles.qrModalCode}>{qrPromo.code}</p>
                        <p className={styles.qrModalLink}>{qrPromo.link}</p>
                        <p className={styles.qrModalHint}>
                            Scan to open the promo link, or share the code directly.
                        </p>
                        <div className={styles.qrModalActions}>
                            <button
                                className={styles.downloadBtn}
                                onClick={() => handleDownloadQr(qrPromo)}
                            >
                                Download PNG
                            </button>
                            <button
                                className={styles.shareBtn}
                                onClick={() => sharePromoLink(qrPromo)}
                            >
                                Share
                            </button>
                        </div>
                        {isRedeemed(qrPromo) && (
                            <div className={styles.qrRedeemedNotice}>
                                <strong>Already used</strong> by{' '}
                                {qrPromo.redeemedBy?.username || qrPromo.redemptionEmail} on{' '}
                                {new Date(qrPromo.redeemedAt).toLocaleDateString()}. This code
                                cannot be redeemed again.
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={!!sharePromo}
                onClose={() => setSharePromo(null)}
                title={`Share "${sharePromo?.title || ''}"`}
            >
                {sharePromo && (
                    <div className={styles.shareBody}>
                        <div className={styles.shareBlock}>
                            <label className={styles.shareLabel}>Link</label>
                            <div className={styles.linkCell}>
                                <a
                                    href={sharePromo.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.linkAnchor}
                                    title={sharePromo.link}
                                >
                                    {sharePromo.link}
                                </a>
                                <button
                                    className={styles.copyLinkBtn}
                                    onClick={() => copyText(sharePromo.link, 'Link copied')}
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div className={styles.shareBlock}>
                            <label className={styles.shareLabel}>Code</label>
                            <div className={styles.linkCell}>
                                <code className={styles.codeChip}>{sharePromo.code}</code>
                                <button
                                    className={styles.copyLinkBtn}
                                    onClick={() => copyText(sharePromo.code, 'Code copied')}
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div className={styles.shareBlock}>
                            <label className={styles.shareLabel}>Share text</label>
                            <textarea
                                className={styles.shareTextarea}
                                readOnly
                                rows={4}
                                value={`You're invited! Redeem 6 months of free PrepRX access with code ${sharePromo.code}: ${sharePromo.link}`}
                            />
                            <button
                                className={styles.copyLinkBtn}
                                onClick={() =>
                                    copyText(
                                        `You're invited! Redeem 6 months of free PrepRX access with code ${sharePromo.code}: ${sharePromo.link}`,
                                        'Share text copied'
                                    )
                                }
                            >
                                Copy share text
                            </button>
                        </div>

                        <div className={styles.shareActions}>
                            <button className={styles.shareBtn} onClick={() => shareByEmail(sharePromo)}>
                                Share by email
                            </button>
                            <button className={styles.downloadBtn} onClick={() => handleDownloadQr(sharePromo)}>
                                Download QR
                            </button>
                            <button className={styles.copyLinkBtn} onClick={() => sharePromoLink(sharePromo)}>
                                Share…
                            </button>
                        </div>

                        {isRedeemed(sharePromo) && (
                            <div className={styles.qrRedeemedNotice}>
                                <strong>Heads up:</strong> this code was already redeemed by{' '}
                                {sharePromo.redeemedBy?.username || sharePromo.redemptionEmail} on{' '}
                                {new Date(sharePromo.redeemedAt).toLocaleDateString()}. Sharing it
                                now will not grant access.
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                title="Delete Promo Code"
                message={`Are you sure you want to delete "${deleteModal.promo?.title}" (${deleteModal.promo?.code})? This action cannot be undone.`}
            />
        </div>
    );
};

export default AdminPromoCodes;