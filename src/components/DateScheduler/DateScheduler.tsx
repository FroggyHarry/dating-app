import { useState } from 'react';
import { Calendar } from '../Calendar/Calendar';
import { TimePicker } from '../TimePicker/TimePicker';
import { ActivitySelector } from '../ActivitySelector/ActivitySelector';
import { ACTIVITIES, CUISINES } from '../../constants/activities';
import type { DateDetails } from '../../types';
import './DateScheduler.css';

type Step = 1 | 2 | 3 | 4;

interface DateSchedulerProps {
  dateDetails: DateDetails;
  onUpdateDate: (date: string) => void;
  onUpdateTime: (time: string) => void;
  onUpdateActivity: (activity: string) => void;
  onUpdateFood: (food: string) => void;
  onConfirm: () => void;
}

export function DateScheduler({
  dateDetails,
  onUpdateDate,
  onUpdateTime,
  onUpdateActivity,
  onUpdateFood,
  onConfirm,
}: DateSchedulerProps) {
  const [step, setStep] = useState<Step>(1);

  const canNext = () => {
    if (step === 1) return dateDetails.date !== null;
    if (step === 2) return dateDetails.timeSlot !== null;
    if (step === 3) return dateDetails.activity !== null;
    if (step === 4) return dateDetails.food !== null;
  };

  return (
    <div className="date-scheduler phase-enter">
      {/* 步骤指示器 */}
      <div className="step-indicator">
        <span className={`step-dot${step === 1 ? ' active' : ''}${dateDetails.date ? ' done' : ''}`}>1</span>
        <span className="step-line" />
        <span className={`step-dot${step === 2 ? ' active' : ''}${dateDetails.timeSlot ? ' done' : ''}`}>2</span>
        <span className="step-line" />
        <span className={`step-dot${step === 3 ? ' active' : ''}${dateDetails.activity ? ' done' : ''}`}>3</span>
        <span className="step-line" />
        <span className={`step-dot${step === 4 ? ' active' : ''}${dateDetails.food ? ' done' : ''}`}>4</span>
      </div>

      <div className="scheduler-header">
        <span className="scheduler-banner">🐻 太棒了！让我们来安排约会吧 🐼</span>
      </div>

      {/* 步骤内容 */}
      <div className="step-content">
        {step === 1 && (
          <div className="step-panel">
            <h3 className="step-title">📅 选择约会日期</h3>
            <Calendar
              selectedDate={dateDetails.date}
              onSelectDate={onUpdateDate}
            />
          </div>
        )}

        {step === 2 && (
          <div className="step-panel">
            <h3 className="step-title">⏰ 选择约会时间</h3>
            <TimePicker
              selectedTime={dateDetails.timeSlot}
              onSelectTime={onUpdateTime}
            />
          </div>
        )}

        {step === 3 && (
          <div className="step-panel">
            <h3 className="step-title">🎯 选择约会活动</h3>
            <ActivitySelector
              activities={ACTIVITIES}
              selected={dateDetails.activity}
              onSelect={onUpdateActivity}
              title="🎯 约会活动"
            />
          </div>
        )}

        {step === 4 && (
          <div className="step-panel">
            <h3 className="step-title">🍽️ 我们吃点什么？</h3>
            <ActivitySelector
              activities={CUISINES}
              selected={dateDetails.food}
              onSelect={onUpdateFood}
              title="🍽️ 我们吃点什么？"
            />
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div className="step-buttons">
        {step > 1 && (
          <button
            className="btn-secondary"
            onClick={() => setStep((s) => (s - 1) as Step)}
          >
            ← 上一步
          </button>
        )}

        {step < 4 ? (
          <button
            className="btn-primary"
            disabled={!canNext()}
            onClick={() => setStep((s) => (s + 1) as Step)}
          >
            下一步 →
          </button>
        ) : (
          <button
            className="btn-primary"
            disabled={!canNext()}
            onClick={onConfirm}
          >
            💌 确认约会
          </button>
        )}
      </div>
    </div>
  );
}
