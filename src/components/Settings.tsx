import React, { useState } from 'react';
import { 
  Save, 
  Server, 
  Shield, 
  Bell, 
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Monitor,
  Palette
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

const Settings: React.FC = () => {
  const [dockerHost, setDockerHost] = useState('unix:///var/run/docker.sock');
  const [apiVersion, setApiVersion] = useState('1.43');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleExportConfig = () => {
    const config = {
      dockerHost,
      apiVersion,
      autoRefresh,
      refreshInterval,
      notifications,
      darkMode
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'docker-labs-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          setDockerHost(config.dockerHost || dockerHost);
          setApiVersion(config.apiVersion || apiVersion);
          setAutoRefresh(config.autoRefresh !== undefined ? config.autoRefresh : autoRefresh);
          setRefreshInterval(config.refreshInterval || refreshInterval);
          setNotifications(config.notifications !== undefined ? config.notifications : notifications);
          setDarkMode(config.darkMode !== undefined ? config.darkMode : darkMode);
        } catch (error) {
          alert('Invalid configuration file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSave = () => {
    localStorage.setItem('dockerLabsConfig', JSON.stringify({
      dockerHost,
      apiVersion,
      autoRefresh,
      refreshInterval,
      notifications,
      darkMode
    }));
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    setDockerHost('unix:///var/run/docker.sock');
    setApiVersion('1.43');
    setAutoRefresh(true);
    setRefreshInterval(5);
    setNotifications(true);
    setDarkMode(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground">
          Configure your Docker Labs environment and preferences
        </p>
      </div>

      <div className="flex justify-center space-x-2">
        <Button
          onClick={handleExportConfig}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Config</span>
        </Button>
        
        <label className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center space-x-2" asChild>
            <span>
              <Upload className="w-4 h-4" />
              <span>Import Config</span>
            </span>
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={handleImportConfig}
            className="hidden"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Docker Connection */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-primary" />
              <span>Docker Connection</span>
            </CardTitle>
            <CardDescription>
              Configure connection to Docker daemon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Docker Host
              </label>
              <Input
                value={dockerHost}
                onChange={(e) => setDockerHost(e.target.value)}
                placeholder="unix:///var/run/docker.sock"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Docker daemon socket path or TCP address
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                API Version
              </label>
              <select
                value={apiVersion}
                onChange={(e) => setApiVersion(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="1.43">1.43</option>
                <option value="1.42">1.42</option>
                <option value="1.41">1.41</option>
                <option value="1.40">1.40</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span>Security</span>
            </CardTitle>
            <CardDescription>
              Security and authentication settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Enable TLS
                </label>
                <p className="text-xs text-muted-foreground">
                  Use TLS for Docker daemon communication
                </p>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Verify TLS Certificate
                </label>
                <p className="text-xs text-muted-foreground">
                  Verify the Docker daemon certificate
                </p>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* User Interface */}
        <Card className="border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-blue-500" />
              <span>User Interface</span>
            </CardTitle>
            <CardDescription>
              Customize the interface behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Auto Refresh
                </label>
                <p className="text-xs text-muted-foreground">
                  Automatically refresh container status
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                {autoRefresh && <Badge variant="default" className="text-xs">On</Badge>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Refresh Interval (seconds)
              </label>
              <Input
                type="number"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                min="1"
                max="60"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Dark Mode
                </label>
                <p className="text-xs text-muted-foreground">
                  Use dark theme for the interface
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <Badge variant={darkMode ? "default" : "outline"} className="text-xs">
                  {darkMode ? "Dark" : "Light"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-orange-500" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>
              Configure system notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Enable Notifications
                </label>
                <p className="text-xs text-muted-foreground">
                  Show system notifications for container events
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                {notifications && <Badge variant="default" className="text-xs">On</Badge>}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Container Start/Stop
                </label>
                <p className="text-xs text-muted-foreground">
                  Notify when containers start or stop
                </p>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Error Notifications
                </label>
                <p className="text-xs text-muted-foreground">
                  Notify when errors occur
                </p>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center space-x-4">
        <Button
          onClick={handleReset}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Reset to Defaults</span>
        </Button>
        
        <Button
          onClick={handleSave}
          className="flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </Button>
      </div>
    </div>
  );
};

export default Settings;