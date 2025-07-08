import React, { useState, useEffect, useCallback, memo } from 'react';
import { getRemainingUsage, getDailyLimit, getTodaysUsage } from '../services/usageService';
import { getApiKey } from '../services/configService';

interface HeaderUsageIndicatorProps {
  refreshTrigger?: number;
  onOpenSettings?: () => void;
}

export const HeaderUsageIndicator: React.FC<HeaderUsageIndicatorProps> = memo(({ refreshTrigger, onOpenSettings }) => {
  const [remainingUses, setRemainingUses] = useState<number>(0);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [todayUsage, setTodayUsage] = useState<number>(0);

  const loadUsageData = useCallback(async () => {
    const remaining = await getRemainingUsage();
    const usage = await getTodaysUsage();
    const apiKey = await getApiKey();
    
    setRemainingUses(remaining);
    setTodayUsage(usage);
    setHasApiKey(!!apiKey);
  }, []);

  useEffect(() => {
    loadUsageData();
  }, [refreshTrigger, loadUsageData]);

  // Don't show if user has their own API key
  if (hasApiKey) {
    return null;
  }

  const dailyLimit = getDailyLimit();

  return (
    <button
      onClick={remainingUses === 0 ? onOpenSettings : undefined}
      className={`flex items-center gap-1.5 text-xs ${
        remainingUses === 0 ? 'cursor-pointer hover:text-slate-300 transition-colors' : 'cursor-default'
      }`}
      disabled={remainingUses > 0}
    >
      <div className="flex gap-0.5">
        {Array.from({ length: dailyLimit }, (_, i) => (
          <div
            key={i}
            className={`w-1 h-1 rounded-full ${
              i < todayUsage ? 'bg-indigo-500' : 'bg-slate-600'
            }`}
          />
        ))}
      </div>
      <span className="text-slate-400 hidden sm:inline">
        {remainingUses > 0 ? `${remainingUses} left` : 'Limit reached'}
      </span>
      <span className="text-slate-400 sm:hidden">
        {remainingUses > 0 ? remainingUses : '0'}
      </span>
    </button>
  );
});
