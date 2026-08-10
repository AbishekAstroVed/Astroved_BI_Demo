import React from 'react';
import { ArrowUpRight, ArrowDownRight, Target } from 'lucide-react';

const KPICard = ({ title, value, compValue, compChange, targetVal, formatType = 'currency', loading = false }) => {
  const isPositive = compChange >= 0;

  const displayVal = formatType === 'currency' 
    ? (typeof value === 'number' ? `$${value.toLocaleString(undefined, {maximumFractionDigits: 0})}` : value)
    : formatType === 'percentage' 
      ? `${typeof value === 'number' ? value.toFixed(2) : value}%`
      : (typeof value === 'number' ? value.toLocaleString() : value);

  return (
    <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent blur-2xl rounded-full" />
      
      <div>
        <div className="flex justify-between items-start">
          <span className="text-cosmic-muted text-sm font-medium tracking-wide">{title}</span>
          {compChange !== undefined && (
            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${
              isPositive 
                ? 'bg-cosmic-success/15 text-cosmic-success' 
                : 'bg-cosmic-danger/15 text-cosmic-danger'
            }`}>
              {isPositive ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
              {Math.abs(compChange).toFixed(1)}%
            </span>
          )}
        </div>
        
        <h3 className="text-3xl font-bold text-cosmic-text mt-3 tracking-tight">
          {loading ? (
            <div className="h-9 w-28 bg-slate-800 animate-pulse rounded-md" />
          ) : (
            displayVal
          )}
        </h3>
      </div>

      {(targetVal !== undefined || compValue !== undefined) && (
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-x-4 text-xs text-cosmic-muted">
          {targetVal !== undefined && (
            <span className="flex items-center">
              <Target size={12} className="mr-1 text-cosmic-accent" />
              Target: <span className="text-cosmic-text ml-1">{formatType === 'currency' ? `$${targetVal.toLocaleString(undefined, {maximumFractionDigits: 0})}` : targetVal}</span>
            </span>
          )}
          {compValue !== undefined && (
            <span>
              Prev: <span className="text-cosmic-text">{formatType === 'currency' ? `$${compValue.toLocaleString(undefined, {maximumFractionDigits: 0})}` : compValue}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default KPICard;
