import React, { useState, useEffect } from 'react';
import { getRemainingUsage, getDailyLimit, getTodaysUsage } from '../services/usageService';
import { getApiKey } from '../services/configService';

interface UsageStatusProps {
  onOpenSettings: () => void;
  refreshTrigger?: number; // Optional prop to trigger refresh
}

export const UsageStatus: React.FC<UsageStatusProps> = ({ onOpenSettings, refreshTrigger }) => {
  const [remainingUses, setRemainingUses] = useState<number>(0);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [todayUsage, setTodayUsage] = useState<number>(0);

  useEffect(() => {
    const loadUsageData = async () => {
      const remaining = await getRemainingUsage();
      const usage = await getTodaysUsage();
      const apiKey = await getApiKey();
      
      setRemainingUses(remaining);
      setTodayUsage(usage);
      setHasApiKey(!!apiKey);
    };

    loadUsageData();
  }, [refreshTrigger]); // Add refreshTrigger as dependency

  // Don't show if user has their own API key
  if (hasApiKey) {
    return null;
  }

  const dailyLimit = getDailyLimit();

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {Array.from({ length: dailyLimit }, (_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i < todayUsage ? 'bg-indigo-500' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-400">
            {remainingUses > 0 ? `${remainingUses} free uses left` : 'Daily limit reached'}
          </span>
        </div>
        
        {remainingUses === 0 && (
          <button
            onClick={onOpenSettings}
            className="px-2 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors"
          >
            Add Key
          </button>
        )}
      </div>
    </div>
  );
};
