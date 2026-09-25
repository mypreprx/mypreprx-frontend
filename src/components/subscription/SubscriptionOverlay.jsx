import { Outlet } from 'react-router-dom';
import { Home } from '../../pages/home/Home';
import './SubscriptionOverlay.css';

export default function SubscriptionOverlay() {
  return (
    <div className="subscription-overlay-root">
      <div className="subscription-overlay-bg" aria-hidden="true">
        <Home />
      </div>
      <div className="subscription-overlay-dim" />
      <div className="subscription-overlay-content">
        <Outlet />
      </div>
    </div>
  );
}
