import React from 'react';
import { Route, Switch, Redirect } from 'wouter';
import { RegionProvider, useRegion } from './context/RegionContext';
import { PremiumProvider } from './context/PremiumContext';
import { Sidebar } from './components/Sidebar';
import { ComparePage } from './pages/ComparePage';
import { CookPage } from './pages/CookPage';
import { TaskPage } from './pages/TaskPage';
import { LazyAIModal } from './components/LazyAIModal';
import { UpgradeModal } from './components/UpgradeModal';
import { WifiOff, Bell, X } from 'lucide-react';

function Layout({ children }: { children: React.ReactNode }) {
  const { isOnline, pushNotification, clearNotification } = useRegion();

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
      {/* Offline Banner */}
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-0 left-0 right-0 z-[70] flex items-center justify-center gap-2 border-b border-amber-400/25 bg-amber-500/15 px-4 py-2 text-xs font-semibold text-amber-200 backdrop-blur-xl"
        >
          <WifiOff className="h-3.5 w-3.5" />
          <span>Working Offline — Using Local Cache</span>
        </div>
      )}

      {/* Floating Push Notification Banner */}
      {pushNotification && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed left-3 right-3 z-[75] mx-auto max-w-md animate-in slide-in-from-top-4 fade-in duration-300 ${
            isOnline ? 'top-3 md:top-5' : 'top-12'
          }`}
        >
          <div className="flex items-center gap-3 rounded-2xl border border-violet-400/30 bg-card/95 p-3.5 shadow-2xl shadow-black/60 backdrop-blur-xl animate-pulse-soft">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/15 text-violet-300">
              <Bell className="h-4 w-4" />
            </div>
            <p className="min-w-0 flex-1 text-xs font-semibold leading-relaxed text-foreground">
              {pushNotification}
            </p>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={clearNotification}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground/60 hover:bg-muted/50 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8 relative">
        {children}
      </main>

      {/* Floating LazyAI Chat Drawer */}
      <LazyAIModal />

      {/* Upgrade Pro Modal */}
      <UpgradeModal />
    </div>
  );
}

export default function App() {
  return (
    <PremiumProvider>
      <RegionProvider>
        <Layout>
          <Switch>
            <Route path="/" component={() => <Redirect to="/compare" />} />
            <Route path="/compare" component={ComparePage} />
            <Route path="/cook" component={CookPage} />
            <Route path="/task" component={TaskPage} />
            <Route component={() => <Redirect to="/compare" />} />
          </Switch>
        </Layout>
      </RegionProvider>
    </PremiumProvider>
  );
}
