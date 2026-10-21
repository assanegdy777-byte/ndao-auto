import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface PhoneContainerProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export const PhoneContainer: React.FC<PhoneContainerProps> = ({
  label,
  children,
  className = '',
  compact = false,
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Phone Hardware Mockup */}
      <div
        className={`w-full max-w-[340px] sm:max-w-[360px] bg-[#000000] rounded-[44px] p-3 border-4 border-[#1f2e35] shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative flex flex-col overflow-hidden transition-all duration-300 hover:border-[#00c9a7]/50 ${
          compact ? 'h-[620px]' : 'h-[690px]'
        }`}
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 201, 167, 0.1)',
        }}
      >
        {/* Notch / Speaker */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30 flex items-center justify-center">
          <div className="w-10 h-1 bg-[#1a2328] rounded-full"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#0a1013] ml-3 border border-[#1f2e35]"></div>
        </div>

        {/* Status Bar */}
        <div className="w-full flex items-center justify-between px-6 pt-1 pb-2 text-[11px] font-semibold text-slate-300 z-20 select-none">
          <span>9:41</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 w-full bg-[#071E26] text-white rounded-[32px] overflow-hidden flex flex-col relative z-10 border border-[#11323d]/40">
          {children}
        </div>

        {/* Home Indicator Bar */}
        <div className="w-full flex justify-center pt-2 pb-0.5 z-20">
          <div className="w-28 h-1 bg-slate-600/70 rounded-full"></div>
        </div>
      </div>

      {/* Screen Title Caption from reference poster */}
      {label && (
        <div className="mt-4 text-center">
          <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-200 font-['Plus_Jakarta_Sans',sans-serif]">
            {label}
          </h3>
        </div>
      )}
    </div>
  );
};
