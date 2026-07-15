import { useState, useCallback } from 'react';
import { InvitationPopup } from './components/InvitationPopup/InvitationPopup';
import { IntermediatePage } from './components/IntermediatePage/IntermediatePage';
import { DateScheduler } from './components/DateScheduler/DateScheduler';
import { Confirmation } from './components/Confirmation/Confirmation';
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

  const handleAccept = useCallback(() => {
    setPhase('intermediate');
  }, []);

  const handleIntermediateNext = useCallback(() => {
    setPhase('scheduling');
  }, []);

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

  const handleConfirm = useCallback(() => {
    setPhase('confirmed');
  }, []);

  const handleReset = useCallback(() => {
    setPhase('scheduling');
    setDateDetails({ date: null, timeSlot: null, activity: null, food: null });
  }, []);

  return (
    <div className="app-container">
      {phase === 'invitation' && (
        <InvitationPopup onAccept={handleAccept} />
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
        />
      )}
    </div>
  );
}

export default App;
