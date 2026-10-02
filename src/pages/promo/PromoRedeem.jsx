import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { savePendingPromo, getPendingPromo, clearPendingPromo } from '../../utils/promoStorage';
import { Button } from '../../components/common/Button';
import styles from './PromoRedeem.module.css';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

/**
 * Landing + redemption for a shared promo link or QR code.
 *
 * Route shapes:
 *   /promo/:code  — opened from the shared link or the scanned QR
 *   /promo/redeem — reached after login/signup, redeems whatever is pending
 *
 * The code is NOT validated while the visitor is anonymous on purpose: doing so
 * would let anyone test which codes exist. It is only checked by the server
 * once we know which account would benefit.
 */
export const PromoRedeem = () => {
  const { code: codeFromUrl } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isCheckingAuth, redeemPromo } = useAuthStore();

  const [status, setStatus] = useState('working'); // working | success | error
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  // Guards against a second POST when React re-runs the effect in dev/StrictMode
  // or the effect fires again after a re-render.
  const attempted = useRef(false);

  useEffect(() => {
    if (codeFromUrl) savePendingPromo(codeFromUrl);
  }, [codeFromUrl]);

  useEffect(() => {
    if (isCheckingAuth || !isAuthenticated) return;
    if (attempted.current) return;

    const code = getPendingPromo();

    // Missing code is a render-time condition, not a state transition — handle
    // it by rendering rather than by setting state inside the effect.
    if (!code) {
      attempted.current = true;
      return;
    }

    attempted.current = true;
    let cancelled = false;

    (async () => {
      try {
        const data = await redeemPromo(code);
        if (!cancelled) {
          setResult(data.promo || {});
          setStatus('success');
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error.response?.data?.message ||
              'We could not redeem this promo code. Please try again.'
          );
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isCheckingAuth, redeemPromo]);

  const missingCode = !isCheckingAuth && isAuthenticated && !getPendingPromo();

  const goTo = (path) => {
    clearPendingPromo();
    navigate(path);
  };

  // ---------- Success ----------
  if (status === 'success') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.successIcon} aria-hidden="true">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M7.5 12.5L10.5 15.5L16.5 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className={styles.title}>
            {result?.months || 6} months of free subscription redeemed
          </h1>
          <p className={styles.subtitle}>
            Your free PrepRX premium access is now active on your account.
          </p>

          <dl className={styles.details}>
            {result?.title && (
              <div className={styles.detailRow}>
                <dt>Promo</dt>
                <dd>{result.title}</dd>
              </div>
            )}
            {result?.code && (
              <div className={styles.detailRow}>
                <dt>Code</dt>
                <dd className={styles.codeText}>{result.code}</dd>
              </div>
            )}
            {formatDate(result?.endsAt) && (
              <div className={styles.detailRow}>
                <dt>Free access until</dt>
                <dd>{formatDate(result?.endsAt)}</dd>
              </div>
            )}
          </dl>

          <p className={styles.footnote}>
            You have full access to every premium feature in the meantime. When your free period
            ends, you can pick up any plan to keep going.
          </p>

          <Button onClick={() => goTo('/home')} className={styles.primaryBtn}>
            Start studying
          </Button>
        </div>
      </div>
    );
  }

  // ---------- Error ----------
  if (status === 'error' || missingCode) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>We couldn&apos;t apply this promo</h1>
          <p className={styles.subtitle}>
            {errorMessage ||
              'This promo link is missing its code. Open the original link, or enter your code on the subscription page.'}
          </p>
          <div className={styles.actions}>
            <Button onClick={() => navigate('/pricing')} className={styles.primaryBtn}>
              Go to plans
            </Button>
            <Button onClick={() => goTo('/home')} className={styles.secondaryBtn}>
              Back to PrepRX
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Signed out: sign in or create an account ----------
  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.giftIcon} aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className={styles.title}>You&apos;ve got 6 months of free PrepRX</h1>
          <p className={styles.subtitle}>
            Sign in or create your account to claim it. We&apos;ll apply your promo automatically.
          </p>

          <div className={styles.actions}>
            <Button onClick={() => navigate('/signup')} className={styles.primaryBtn}>
              Create account
            </Button>
            <Button onClick={() => navigate('/login')} className={styles.secondaryBtn}>
              I already have an account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Signed in, redeeming ----------
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.spinner} aria-hidden="true" />
        <h1 className={styles.title}>Applying your promo…</h1>
        <p className={styles.subtitle}>Hang on while we set up your free access.</p>
      </div>
    </div>
  );
};

export default PromoRedeem;