import { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import { Clock } from 'lucide-react';

export function SessionInfo() {
  const [sessionInfo, setSessionInfo] = useState<{ isRemembered: boolean; expiresIn: number } | null>(null);

  useEffect(() => {
    const updateSessionInfo = () => {
      const info = authService.getSessionInfo();
      setSessionInfo(info);
    };

    // Update immediately
    updateSessionInfo();

    // Update every minute
    const intervalId = setInterval(updateSessionInfo, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  if (!sessionInfo) return null;

  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.floor(ms / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const isExpiringSoon = sessionInfo.expiresIn < 5 * 60 * 1000; // Less than 5 minutes

  return (
    <div className={`flex items-center gap-1.5 text-xs ${isExpiringSoon ? 'text-red-600' : 'text-gray-500'}`}>
      <Clock className="w-3.5 h-3.5" />
      <span>
        {sessionInfo.isRemembered ? '🔒 ' : ''}
        {formatTimeRemaining(sessionInfo.expiresIn)}
      </span>
    </div>
  );
}

