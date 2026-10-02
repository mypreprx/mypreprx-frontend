import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QRCode from 'react-qr-code';
import useAdminStore from '../../../store/adminStore';
import Modal from '../../../components/common/modal/Modal';
import ConfirmationModal from '../../../components/common/modal/ConfirmationModal';
import PromoCodeForm from './PromoCodeForm';
import { AdminEditIcon, AdminDeleteIcon } from '../../../components/common/Icons';
import styles from './AdminPromoCodes.module.css';

/**
 * Promo codes are shared three ways — as a random code, a link, or a QR code.
 * Redemption behaviour is not wired up yet.
 */
const AdminPromoCodes = () => {
    const { promoCodes, fetchPromoCodes, deletePromoCode } = useAdminStore();
    const [editingPromo, setEditingPromo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, promo: null });
    const [qrPromo, setQrPromo] = useState(null);

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

    const copyText = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // Clipboard may be blocked; the text is also shown on screen.
        }
    };

    const filteredPromos = promoCodes.filter((promo) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            promo.title?.toLowerCase().includes(term) ||
            promo.code?.toLowerCase().includes(term);
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' ? promo.isActive : !promo.isActive);
        return matchesSearch && matchesStatus;
    });

    const activeCount = promoCodes.filter((p) => p.isActive).length;

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
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPromos.length === 0 ? (
                            <tr>
                                <td colSpan="7" className={styles.emptyState}>
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
                                        <span
                                            className={`${styles.statusBadge} ${promo.isActive ? styles.active : styles.inactive}`}
                                        >
                                            {promo.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>{new Date(promo.createdAt).toLocaleDateString()}</td>
                                    <td className={styles.actions}>
                                        <button
                                            className={styles.qrBtn}
                                            onClick={() => setQrPromo(promo)}
                                            title="View QR code"
                                        >
                                            <QRCode value={promo.qrPayload || promo.link} size={20} bgColor="#ffffff" fgColor="#083862" />
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