import { useState, useEffect } from 'react';
import { Calendar } from '../Calendar/Calendar';
import { TimePicker } from '../TimePicker/TimePicker';
import { ActivitySelector } from '../ActivitySelector/ActivitySelector';
import { supabase } from '../../lib/supabase';
import { CONFIG } from '../../config';
import { toActivity, toCuisine } from '../../types';
import type { DateDetails, Activity } from '../../types';
import './DateScheduler.css';

type Step = 1 | 2 | 3 | 4 | 5;

interface DateSchedulerProps {
  dateDetails: DateDetails;
  guestName: string;
  onUpdateName: (name: string) => void;
  onUpdateDate: (date: string) => void;
  onUpdateTime: (time: string) => void;
  onUpdateActivity: (activity: string) => void;
  onUpdateFood: (food: string) => void;
  onConfirm: () => void;
}

export function DateScheduler({
  dateDetails,
  guestName,
  onUpdateName,
  onUpdateDate,
  onUpdateTime,
  onUpdateActivity,
  onUpdateFood,
  onConfirm,
}: DateSchedulerProps) {
  const startStep = CONFIG.requireName ? 1 : 1;
  const nameStep = CONFIG.requireName ? 1 : 0;
  const dateStep = CONFIG.requireName ? 2 : 1;
  const timeStep = CONFIG.requireName ? 3 : 2;
  const actStep = CONFIG.requireName ? 4 : 3;
  const foodStep = CONFIG.requireName ? 5 : 4;

  const [step, setStep] = useState<Step>(startStep as Step);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [cuisines, setCuisines] = useState<Activity[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: acts } = await supabase
        .from('activities')
        .select('*')
        .eq('is_active', true)
        .order('id');
      const { data: cuis } = await supabase
        .from('cuisines')
        .select('*')
        .eq('is_active', true)
        .order('id');
      if (acts) setActivities(acts.map(toActivity));
      if (cuis) setCuisines(cuis.map(toCuisine));
    };
    load();
  }, []);

  const canNext = () => {
    if (step === nameStep) return guestName.trim() !== '';
    if (step === dateStep) return dateDetails.date !== null;
    if (step === timeStep) return dateDetails.timeSlot !== null;
    if (step === actStep) return dateDetails.activity !== null;
    if (step === foodStep) return dateDetails.food !== null;
  };

  return (
    <div className="date-scheduler phase-enter">
      <div className="step-indicator">
        {CONFIG.requireName && (
          <>
            <span className={`step-dot${step === nameStep ? ' active' : ''}${guestName.trim() ? ' done' : ''}`}>1</span>
            <span className="step-line" />
          </>
        )}
        <span className={`step-dot${step === dateStep ? ' active' : ''}${dateDetails.date ? ' done' : ''}`}>{CONFIG.requireName ? 2 : 1}</span>
        <span className="step-line" />
        <span className={`step-dot${step === timeStep ? ' active' : ''}${dateDetails.timeSlot ? ' done' : ''}`}>{CONFIG.requireName ? 3 : 2}</span>
        <span className="step-line" />
        <span className={`step-dot${step === actStep ? ' active' : ''}${dateDetails.activity ? ' done' : ''}`}>{CONFIG.requireName ? 4 : 3}</span>
        <span className="step-line" />
        <span className={`step-dot${step === foodStep ? ' active' : ''}${dateDetails.food ? ' done' : ''}`}>{CONFIG.requireName ? 5 : 4}</span>
      </div>

      <div className="scheduler-header">
        <span className="scheduler-banner">
          {CONFIG.showAnimals ? '🐻 太棒了！让我们来安排约会吧 🐼' : '请填写以下信息'}
        </span>
      </div>

      <div className="step-content">
        {step === nameStep && CONFIG.requireName && (
          <div className="step-panel">
            <h3 className="step-title">👤 你的姓名</h3>
            <input
              className="name-input"
              type="text"
              placeholder="请输入你的姓名"
              value={guestName}
              onChange={(e) => onUpdateName(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {step === dateStep && (
          <div className="step-panel">
            <h3 className="step-title">📅 选择日期</h3>
            <Calendar selectedDate={dateDetails.date} onSelectDate={onUpdateDate} />
          </div>
        )}

        {step === timeStep && (
          <div className="step-panel">
            <h3 className="step-title">⏰ 选择时间</h3>
            <TimePicker selectedDate={dateDetails.date} selectedTime={dateDetails.timeSlot} onSelectTime={onUpdateTime} />
          </div>
        )}

        {step === actStep && (
          <div className="step-panel">
            <h3 className="step-title">🎯 选择活动</h3>
            <ActivitySelector activities={activities} selected={dateDetails.activity} onSelect={onUpdateActivity} title="🎯 活动" />
          </div>
        )}

        {step === foodStep && (
          <div className="step-panel">
            <h3 className="step-title">🍽️ 选择菜系</h3>
            <ActivitySelector activities={cuisines} selected={dateDetails.food} onSelect={onUpdateFood} title="🍽️ 菜系" />
          </div>
        )}
      </div>

      <div className="step-buttons">
        {step > startStep && (
          <button className="btn-secondary" onClick={() => setStep((s) => (s - 1) as Step)}>← 上一步</button>
        )}

        {step < foodStep ? (
          <button className="btn-primary" disabled={!canNext()} onClick={() => setStep((s) => (s + 1) as Step)}>
            下一步 →
          </button>
        ) : (
          <button className="btn-primary" disabled={!canNext()} onClick={onConfirm}>
            {CONFIG.requireApproval ? '📩 提交预约' : '💌 确认约会'}
          </button>
        )}
      </div>
    </div>
  );
}
