'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function DemoWalkthrough() {
  const [step, setStep] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('demo_tour_completed');
    if (process.env.NEXT_PUBLIC_IS_DEMO === 'true' && !hasSeenTour) {
      setShowTour(true);
      setStep(0);
    }
  }, [pathname]);

  // Login steps
  const loginSteps = [
    { selector: '#enter-field-button', title: '🚀 Enter the Demo', text: 'Click this button to login' },
  ];

  // Dashboard steps - using simple selectors that exist in your code
  const dashboardSteps = [
    { selector: '.grid.grid-cols-2', title: '💰 Financial Cards', text: 'See debit, credit, and cash' },
    { selector: '.lg\\:col-span-4', title: '📋 Recent Activity', text: 'Your latest transactions' },
    { selector: '.bg-\\[\\#D4AF37\\]', title: '➕ Add Transaction', text: 'Record expenses or income' },
    { selector: '.cursor-pointer.group', title: '👨‍🌾 Manage Farmers', text: 'View all farmers' },
    { selector: '.sidebar', title: '🧭 Navigation', text: 'Switch between pages' },
  ];

  const steps = isLoginPage ? loginSteps : dashboardSteps;
  const currentStep = steps[step];
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    if (showTour && currentStep) {
      const findElement = () => {
        const el = document.querySelector(currentStep.selector);
        if (el) {
          const rect = el.getBoundingClientRect();
          setPosition({
            top: rect.top + window.scrollY - 10,
            left: rect.left + window.scrollX - 10,
            width: rect.width + 20,
            height: rect.height + 20,
          });
        } else {
          setTimeout(findElement, 500);
        }
      };
      setTimeout(findElement, 500);
    }
  }, [step, showTour, currentStep]);

  const nextStep = () => {
    if (step + 1 < steps.length) {
      setStep(step + 1);
    } else {
      setShowTour(false);
      localStorage.setItem('demo_tour_completed', 'true');
    }
  };

  const skipTour = () => {
    setShowTour(false);
    localStorage.setItem('demo_tour_completed', 'true');
  };

  if (!showTour || !currentStep) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[200]" onClick={skipTour} />
      <div
        className="fixed z-[201] border-4 border-[#D4AF37] rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] pointer-events-none transition-all duration-300"
        style={{
          top: position.top,
          left: position.left,
          width: position.width,
          height: position.height,
        }}
      />
      <div
        className="fixed z-[202] bg-[#1A241A] border border-[#D4AF37] rounded-xl p-4 w-80 shadow-2xl"
        style={{
          top: position.top + position.height + 15,
          left: position.left + position.width / 2 - 160,
        }}
      >
        <h3 className="text-[#D4AF37] font-bold text-sm mb-1">{currentStep.title}</h3>
        <p className="text-gray-300 text-xs mb-3">{currentStep.text}</p>
        <div className="flex justify-between">
          <button onClick={skipTour} className="text-gray-500 text-xs hover:text-gray-300">Skip</button>
          <button onClick={nextStep} className="bg-[#D4AF37] text-black px-4 py-1 rounded text-xs font-medium hover:bg-[#C6A032]">
            {step + 1 === steps.length ? 'Finish' : 'Next →'}
          </button>
        </div>
        <div className="text-center mt-2 text-[10px] text-gray-500">Step {step + 1} of {steps.length}</div>
      </div>
    </>
  );
}
