'use client';

import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import DashboardView from '@/components/views/DashboardView';
import NewRequestView from '@/components/views/NewRequestView';
import MyRequestsView from '@/components/views/MyRequestsView';
import TrackingView from '@/components/views/TrackingView';
import ReportsView from '@/components/views/ReportsView';
import SettingsView from '@/components/views/SettingsView';
import { useApp } from '@/context/AppContext';

export default function Home() {
  const { currentView, connectionStatus, mqttConfig } = useApp();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'new_request':
        return <NewRequestView />;
      case 'my_requests':
        return <MyRequestsView />;
      case 'tracking':
        return <TrackingView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {/* Top Navbar Header */}
      <Header />

      {/* Main Container with Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {renderView()}

          {/* SPU Bottom Footer Bar (Matching Mockup in PDF) */}
          <footer className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500 sm:flex-row dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sky-700 dark:text-sky-300">
                Sripatum University
              </span>
              <span>|</span>
              <span>Smart Fix Service (กลุ่ม 5 Fix and Service)</span>
            </div>

            <div className="flex items-center space-x-3 text-[11px]">
              <div className="flex items-center space-x-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    connectionStatus === 'connected'
                      ? 'bg-emerald-500 animate-pulse'
                      : connectionStatus === 'connecting'
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-rose-500'
                  }`}
                ></span>
                <span>
                  {connectionStatus === 'connected'
                    ? 'Connected to SPU Network & MQTT'
                    : connectionStatus === 'connecting'
                    ? 'Connecting to Broker...'
                    : 'Disconnected'}
                </span>
              </div>
              <span>•</span>
              <span className="font-mono">{mqttConfig.brokerUrl}</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
