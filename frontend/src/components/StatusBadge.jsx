import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return null;

  const normalized = status.toString().toLowerCase();

  return (
    <span className={`badge badge-${normalized}`}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'currentColor'
        }}
      />
      {status.replace(/_/g, ' ')}
    </span>
  );
}
