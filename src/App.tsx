import { useState, useCallback, useEffect } from 'react';
import { InvitationPopup } from './components/InvitationPopup/InvitationPopup';
import { IntermediatePage } from './components/IntermediatePage/IntermediatePage';
import { DateScheduler } from './components/DateScheduler/DateScheduler';
import { Confirmation } from './components/Confirmation/Confirmation';
import { AdminPanel } from './components/AdminPanel/AdminPanel';
import { useAppointments } from './hooks/useAppointments';
import { useAdmin } from './hooks/useAdmin';
import { CONFIG, APP_MODE } from './config';
import type { AppPhase, DateDetails } from './types';
import './App.css';

function App() {
  const [phase, setPhase] = useState<AppPhase>('invitation');
  const [dateDetails, setDateDetails] = useState<DateDetails>({ date: null, timeSlot: null, activity: null, food: null });
  const [guestName, setGuestName] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const { isAdmin } = useAdmin();
  const { addAppointment } = useAppointments();

  // 注入主题变量
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-pink-primary', CONFIG.primaryColor);
    root.style.setProperty('--color-pink-light', CONFIG.primaryLight);
    root.style.setProperty('--color-pink-pale', CONFIG.primaryPale);
    root.style.setProperty('--color-pink-dark', CONFIG.primaryDark);
    root.style.setProperty('--font-family', CONFIG.fontFamily);
    document.body.style.background = CONFIG.bgGradient;
  }, []);

  const handleAccept = useCallback(() => {
    if (CONFIG.intermediateTitle) {
      setPhase('intermediate');
    } else {
      setPhase('scheduling');
    }
  }, []);

  const handleIntermediateNext = useCallback(() => setPhase('scheduling'), []);

  const handleUpdateName = useCallback((name: string) => setGuestName(name), []);
  const handleUpdateDate = useCallback((date: string) => setDateDetails((p) => ({ ...p, date })), []);
  const handleUpdateTime = useCallback((time: string) => setDateDetails((p) => ({ ...p, timeSlot: time })), []);
  const handleUpdateActivity = useCallback((a: string) => setDateDetails((p) => ({ ...p, activity: a })), []);
  const handleUpdateFood = useCallback((f: string) => setDateDetails((p) => ({ ...p, food: f })), []);

  const handleConfirm = useCallback(async () => {
    const { date, timeSlot, activity, food } = dateDetails;
    if (!date || !timeSlot || !activity || !food) return;

    let loc = '';
    try {
      const res = await fetch('https://ip-api.com/json/?fields=city,country');
      if (res.ok) { const g = await res.json(); loc = g.city ? `${g.city}, ${g.country}` : ''; }
    } catch { /* ignore */ }

    const status = CONFIG.requireApproval ? 'pending' : 'confirmed';

    await addAppointment({
      date, time_slot: timeSlot, activity, cuisine: food,
      source: APP_MODE,
      guest_name: CONFIG.requireName ? guestName : undefined,
      status,
      loc,
    });

    setIsPending(status === 'pending');
    setPhase('confirmed');
  }, [dateDetails, guestName, addAppointment]);

  const handleReset = useCallback(() => {
    setPhase('scheduling');
    setDateDetails({ date: null, timeSlot: null, activity: null, food: null });
    setGuestName('');
    setIsPending(false);
  }, []);

  const handleFrogTripleClick = useCallback(() => setShowAdminLogin(true), []);
  const handleCloseAdminLogin = useCallback(() => setShowAdminLogin(false), []);

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
          guestName={guestName}
          onUpdateName={handleUpdateName}
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
          isPending={isPending}
        />
      )}

      {showAdminLogin && !isAdmin && (
        <AdminPanel showLogin={showAdminLogin} onCloseLogin={handleCloseAdminLogin} />
      )}
    </div>
  );
}

export default App;
