import React, { useState, useEffect } from 'react';
import { TopNav } from './components/navigation/TopNav';
import { LandingPage } from './components/landing/LandingPage';
import { WorkspaceLayout } from './components/workspace/WorkspaceLayout';
import { checkBackendHealth } from './api/client';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'workspace' | 'landing'>('workspace');
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [latencyMs, setLatencyMs] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const pollHealth = async () => {
      const health = await checkBackendHealth();
      if (isMounted) {
        setIsBackendOnline(health.online);
        setLatencyMs(health.latencyMs);
      }
    };

    pollHealth();
    const interval = setInterval(pollHealth, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-canvas text-brand-hero selection:bg-brand-teal selection:text-white">
      {/* Top Header */}
      <TopNav
        currentView={currentView}
        onViewChange={setCurrentView}
        isBackendOnline={isBackendOnline}
        latencyMs={latencyMs}
      />

      {/* Main View Port */}
      <div className="flex-1 w-full">
        {currentView === 'workspace' ? (
          <WorkspaceLayout />
        ) : (
          <LandingPage onOpenWorkspace={() => setCurrentView('workspace')} />
        )}
      </div>
    </div>
  );
};

export default App;
