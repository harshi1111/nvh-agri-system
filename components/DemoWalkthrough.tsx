'use client';

import { useEffect, useState } from 'react';

interface Step {
  target: string;
  title: string;
  content: string;
  action?: () => void;  // ← Added optional action property
}

export default function DemoWalkthrough() {
  const [step, setStep] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [isLoginPage, setIsLoginPage] = useState(false);

  useEffect(() => {
    // Check if we're on login page or dashboard
    const isLogin = window.location.pathname === '/login';
    setIsLoginPage(isLogin);
    
    const hasSeenTour = localStorage.getItem('demo_tour_completed');
    if (process.env.NEXT_PUBLIC_IS_DEMO === 'true' && !hasSeenTour) {
      setShowTour(true);
    }
  }, []);

  // Steps for Login Page
  const loginSteps: Step[] = [
    { 
      target: 'input[type="email"]', 
      title: '📧 Email Pre-filled', 
      content: 'Demo email is already filled for you: demo@example.com',
      action: () => {
        const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
        if (emailInput) emailInput.value = 'demo@example.com';
      }
    },
    { 
      target: 'input[type="password"]', 
      title: '🔒 Password Pre-filled', 
      content: 'Password is already filled: demo123',
      action: () => {
        const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
        if (passwordInput) passwordInput.value = 'demo123';
      }
    },
    { 
      target: '#enter-field-button, button[type="submit"]', 
      title: '🚀 Enter the Demo', 
      content: 'Click here to login and explore the farm management system',
    },
  ];

  // Steps for Dashboard
  const dashboardSteps: Step[] = [
    { target: '.dashboard-cards', title: '💰 Financial Overview', content: 'See total debit, credit, and available cash at a glance' },
    { target: '.recent-activity', title: '📋 Recent Transactions', content: 'Latest 10 transactions - newest at the top' },
    { target: '.add-transaction-btn', title: '➕ Add Transaction', content: 'Record labour, fertilizer, tractor, or crop sales' },
    { target: '.customers-list', title: '👨‍🌾 Manage Farmers', content: 'View all farmers and their projects' },
    { target: '.sidebar', title: '🧭 Navigation', content: 'Switch between Dashboard, Accounting, Customers, and Reports' },
  ];

  const steps = isLoginPage ? loginSteps : dashboardSteps;
  const currentStep = steps[step];
  const [targetRect, setTargetRect] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    if (showTour && currentStep) {
      // Run action if exists (for pre-filling credentials)
      if (currentStep.action) {
        currentStep.action();
      }
      
      // Wait a moment for DOM to update, then find element
      setTimeout(() => {
        const element = document.querySelector(currentStep.target);
        if (element) {
          const rect = element.getBoundingClientRect();
          setTargetRect({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height,
          });
        }
      }, 100);
    }
  }, [step, showTour, currentStep, isLoginPage]);

  const handleNext = () => {
    if (step + 1 < steps.length) {
      setStep(step + 1);
    } else {
      setShowTour(false);
      localStorage.setItem('demo_tour_completed', 'true');
    }
  };

  const handleSkip = () => {
    setShowTour(false);
    localStorage.setItem('demo_tour_completed', 'true');
  };

  if (!showTour || !currentStep) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 z-[100] pointer-events-auto" onClick={handleSkip} />
      
      {/* Highlight Box */}
      <div
        className="absolute z-[101] border-4 border-[#D4AF37] rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] transition-all duration-300 pointer-events-none"
        style={{
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
        }}
      />
      
      {/* Tooltip */}
      <div
        className="fixed z-[102] bg-[#1A241A] border border-[#D4AF37] rounded-xl p-4 max-w-sm shadow-2xl"
        style={{
          top: targetRect.top + targetRect.height + 15,
          left: targetRect.left + targetRect.width / 2 - 150,
        }}
      >
        <h3 className="text-[#D4AF37] font-bold text-sm mb-1">{currentStep.title}</h3>
        <p className="text-gray-300 text-xs mb-3">{currentStep.content}</p>
        <div className="flex justify-between items-center">
          <button onClick={handleSkip} className="text-gray-500 text-xs hover:text-gray-300">
            Skip tour
          </button>
          <button onClick={handleNext} className="bg-[#D4AF37] text-[#0A120A] px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-[#C6A032]">
            {step + 1 === steps.length ? (isLoginPage ? 'Login →' : 'Finish') : 'Next →'}
          </button>
        </div>
        <div className="mt-2 text-center">
          <span className="text-[10px] text-gray-500">Step {step + 1} of {steps.length}</span>
        </div>
      </div>
    </>
  );
}
