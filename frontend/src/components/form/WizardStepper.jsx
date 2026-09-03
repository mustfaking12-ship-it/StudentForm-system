import React from 'react';
import { Check } from 'lucide-react';

export default function WizardStepper({ steps = [], currentStep = 0, onStepClick }) {
  const progressPercentage = steps.length > 1
    ? (currentStep / (steps.length - 1)) * 100
    : 0;

  return (
    <div className="wizard-stepper">
      <div
        className="stepper-progress"
        style={{ width: `${progressPercentage}%` }}
      />

      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;

        return (
          <div
            key={idx}
            className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            onClick={() => isCompleted && onStepClick && onStepClick(idx)}
            style={{ cursor: isCompleted ? 'pointer' : 'default' }}
          >
            <div className="step-circle">
              {isCompleted ? <Check size={20} strokeWidth={3} /> : idx + 1}
            </div>
            <span className="step-label">{step.title}</span>
          </div>
        );
      })}
    </div>
  );
}
