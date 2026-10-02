import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <Loader2 className="animate-spin text-blue-600" size={36} />
      <span className="text-sm font-medium text-slate-600">{text}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        {content}
      </div>
    );
  }

  return content;
}
