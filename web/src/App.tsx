import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LabTemplates from './components/LabTemplates';
import LabDetails from './components/LabDetails';
import BuildLogs from './components/BuildLogs';
import ContainerExecPage from './components/ContainerExecPage';
import LogsPage from './components/LogsPage';
import Settings from './components/Settings';
import { useDockerLabs } from './hooks/useDockerLabs';

function App() {
  const { labs, loading, installLab, startLab, stopLab, removeLab } = useDockerLabs();

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard
                  labs={labs}
                  onStartLab={startLab}
                  onStopLab={stopLab}
                  onRemoveLab={removeLab}
                  loading={loading}
                />
              } 
            />
            <Route 
              path="/labs" 
              element={
                <Dashboard
                  labs={labs}
                  onStartLab={startLab}
                  onStopLab={stopLab}
                  onRemoveLab={removeLab}
                  loading={loading}
                />
              } 
            />
            <Route 
              path="/templates" 
              element={
                <LabTemplates 
                  onInstallLab={installLab}
                  loading={loading}
                />
              } 
            />
            <Route 
              path="/lab/:labId" 
              element={
                <LabDetails
                  labs={labs}
                  onStartLab={startLab}
                  onStopLab={stopLab}
                  onRemoveLab={removeLab}
                  loading={loading}
                />
              } 
            />
            <Route 
              path="/build/:templateId" 
              element={
                <BuildLogs
                  onInstallComplete={(labId) => window.location.href = `/lab/${labId}`}
                />
              } 
            />
            <Route 
              path="/lab/:labId/exec/:containerId" 
              element={<ContainerExecPage labs={labs} />} 
            />
            <Route 
              path="/lab/:labId/logs" 
              element={<LogsPage labs={labs} />} 
            />
            <Route path="/settings" element={<Settings />} />
          </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;