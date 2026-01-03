import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="tooltip-container">
      <div
        className="tooltip-trigger"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <Info size={16} className="tooltip-icon" />
      </div>
      {isVisible && (
        <div className="tooltip-content">
          {content}
        </div>
      )}
      <style>{`
        .tooltip-container {
          position: relative;
          display: inline-flex;
          align-items: center;
          margin-left: 6px;
          vertical-align: middle;
        }
        .tooltip-icon {
          color: var(--text-muted);
          cursor: help;
          transition: color 0.2s;
        }
        .tooltip-icon:hover {
          color: var(--primary);
        }
        .tooltip-content {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 10px;
          padding: 12px;
          width: 240px;
          font-size: 0.85rem;
          color: white;
          background: #1e293b;
          border-radius: 8px;
          z-index: 100;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
          animation: fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
};
