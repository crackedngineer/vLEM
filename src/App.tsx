import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import LabTemplates from './components/LabTemplates';
import CreateLab from './components/CreateLab';
import Settings from './components/Settings';
import LogViewer from './components/LogViewer';
import ContainerExec from './components/ContainerExec';
import { useDockerLabs } from './hooks/useDockerLabs';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showLogs, setShowLogs] = useState<{ labId: string; labName: string } | null>(null);
  const [showExec, setShowExec] = useState<{ labId: string; containerId: string; containerName: string } | null>(null);
  
  const { labs, loading, createLab, startLab, stopLab, removeLab } = useDockerLabs();

  const handleUseTemplate = (template: any) => {
    setSelectedTemplate(template);
    setActiveTab('create');
  };

  const handleCreateLab = (name: string, description: string, compose: string) => {
    createLab(name, description, compose);
    setActiveTab('dashboard');
    setSelectedTemplate(null);
  };

  const handleViewLogs = (labId: string) => {
    const lab = labs.find(l => l.id === labId);
    if (lab) {
      setShowLogs({ labId, labName: lab.name });
    }
  };

  const handleExecContainer = (labId: string, containerId: string) => {
    const lab = labs.find(l => l.id === labId);
    const container = lab?.containers.find(c => c.id === containerId);
    if (container) {
      setShowExec({ labId, containerId, containerName: container.name });
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            labs={labs}
            onStartLab={startLab}
            onStopLab={stopLab}
            onRemoveLab={removeLab}
            onViewLogs={handleViewLogs}
            onExecContainer={handleExecContainer}
            loading={loading}
          />
        );
      case 'labs':
        return (
          <Dashboard
            labs={labs}
            onStartLab={startLab}
            onStopLab={stopLab}
            onRemoveLab={removeLab}
            onViewLogs={handleViewLogs}
            onExecContainer={handleExecContainer}
            loading={loading}
          />
        );
      case 'templates':
        return <LabTemplates onUseTemplate={handleUseTemplate} />;
      case 'create':
        return (
          <CreateLab
            onCreateLab={handleCreateLab}
            initialTemplate={selectedTemplate}
            loading={loading}
          />
        );
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderActiveTab()}
        </div>
      </main>

      {showLogs && (
        <LogViewer
          labId={showLogs.labId}
          labName={showLogs.labName}
          onClose={() => setShowLogs(null)}
        />
      )}

      {showExec && (
        <ContainerExec
          labId={showExec.labId}
          containerId={showExec.containerId}
          containerName={showExec.containerName}
          onClose={() => setShowExec(null)}
        />
      )}
    </div>
  );
}

export default App;