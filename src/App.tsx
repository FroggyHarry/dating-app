import { useState, useCallback } from 'react';
import { InvitationPopup } from './components/InvitationPopup/InvitationPopup';
import { IntermediatePage } from './components/IntermediatePage/IntermediatePage';
import { DateScheduler } from './components/DateScheduler/DateScheduler';
import { Confirmation } from './components/Confirmation/Confirmation';
import { AdminPanel } from './components/AdminPanel/AdminPanel';
import { useAppointments } from './hooks/useAppointments';
import { useAdmin } from './hooks/useAdmin';
import type { AppPhase, DateDetails } from './types';
import './App.css';

function App() {
  const [phase, setPhase] = useState<AppPhase>('invitation');
  const [dateDetails, setDateDetails] = useState<DateDetails>({
    date: null,
    timeSlot: null,
    activity: null,
    food: null,
  });
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const { isAdmin } = useAdmin();
  const { addAppointment } = useAppointments();

  const handleAccept = useCallback(() => setPhase('intermediate'), []);
  const handleIntermediateNext = useCallback(() => setPhase('scheduling'), []);

  const handleUpdateDate = useCallback((date: string) => {
    setDateDetails((prev) => ({ ...prev, date }));
  }, []);

  const handleUpdateTime = useCallback((time: string) => {
    setDateDetails((prev) => ({ ...prev, timeSlot: time }));
  }, []);

  const handleUpdateActivity = useCallback((activity: string) => {
    setDateDetails((prev) => ({ ...prev, activity }));
  }, []);

  const handleUpdateFood = useCallback((food: string) => {
    setDateDetails((prev) => ({ ...prev, food }));
  }, []);

  const handleConfirm = useCallback(async () => {
    const { date, timeSlot, activity, food } = dateDetails;
    if (date && timeSlot && activity && food) {
      // 获取 IP 和位置（多源尝试）
      let ip = '';
      let loc = '';
      try {
        // 先拿 IP
        const ipRes = await fetch('https://api.ipify.org?format=json');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          ip = ipData.ip || '';
        }
        // 再拿位置
        const geoRes = await fetch('https://ipapi.co/json/');
        if (geoRes.ok) {
          const geo = await geoRes.json();
          if (!ip) ip = geo.ip || '';
          loc = geo.city ? `${geo.city}, ${geo.country_name}` : '';
        }
      } catch { /* 获取失败不影响预约 */ }

      await addAppointment(date, timeSlot, activity, food, { ip, loc });
    }
    setPhase('confirmed');
  }, [dateDetails, addAppointment]);

  const handleReset = useCallback(() => {
    setPhase('scheduling');
    setDateDetails({ date: null, timeSlot: null, activity: null, food: null });
  }, []);

  const handleFrogTripleClick = useCallback(() => {
    setShowAdminLogin(true);
  }, []);

  const handleCloseAdminLogin = useCallback(() => {
    setShowAdminLogin(false);
  }, []);

  // 管理员模式下显示管理后台
  if (isAdmin) {
    return (
      <div className="app-container">
        <AdminPanel showLogin={showAdminLogin} onCloseLogin={handleCloseAdminLogin} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {phase === 'invitation' && (
        <InvitationPopup onAccept={handleAccept} onSecretClick={handleFrogTripleClick} />
      )}

      {phase === 'intermediate' && (
        <IntermediatePage onNext={handleIntermediateNext} />
      )}

      {phase === 'scheduling' && (
        <DateScheduler
          dateDetails={dateDetails}
          onUpdateDate={handleUpdateDate}
          onUpdateTime={handleUpdateTime}
          onUpdateActivity={handleUpdateActivity}
          onUpdateFood={handleUpdateFood}
          onConfirm={handleConfirm}
        />
      )}

      {phase === 'confirmed' && (
        <Confirmation
          dateDetails={dateDetails}
          onReset={handleReset}
          onFrogTripleClick={handleFrogTripleClick}
        />
      )}

      {/* 未登录时也可以触发登录弹窗 */}
      {showAdminLogin && !isAdmin && (
        <AdminPanel showLogin={showAdminLogin} onCloseLogin={handleCloseAdminLogin} />
      )}
    </div>
  );
}

export default App;
