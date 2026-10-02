import React from 'react';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend
}) {
  const colorStyles = {
    blue: { bg: 'var(--color-blue-50)', text: 'var(--color-blue-600)', border: 'rgba(37, 99, 235, 0.2)' },
    emerald: { bg: 'var(--color-emerald-50)', text: 'var(--color-emerald-600)', border: 'rgba(16, 185, 129, 0.2)' },
    amber: { bg: 'var(--color-amber-50)', text: 'var(--color-amber-600)', border: 'rgba(245, 158, 11, 0.2)' },
    rose: { bg: 'var(--color-rose-50)', text: 'var(--color-rose-600)', border: 'rgba(225, 29, 72, 0.2)' },
    navy: { bg: 'var(--color-slate-100)', text: 'var(--color-navy-900)', border: 'var(--color-slate-200)' }
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div className="card p-6" style={{ height: '100%' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div style={{
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: style.bg,
            color: style.text,
            border: `1px solid ${style.border}`
          }}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--color-navy-900)'
        }}>
          {value}
        </span>
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500">{subtitle}</p>
      )}

      {trend && (
        <div className="mt-2 text-xs font-semibold text-emerald-600">
          {trend}
        </div>
      )}
    </div>
  );
}
