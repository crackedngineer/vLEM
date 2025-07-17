import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DockerLab } from '../types';
import { 
  ArrowLeft, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Play, 
  Pause, 
  Trash2,
  Container,
  Clock,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Copy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface LogsPageProps {
  labs: DockerLab[];
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  container: string;
  source?: string;
}

const LogsPage: React.FC<LogsPageProps> = ({ labs }) => {
  const { labId } = useParams<{ labId: string }>();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedContainer, setSelectedContainer] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const logsRef = useRef<HTMLDivElement>(null);

  const lab = labs.find(l => l.id === labId);

  const logLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'error', label: 'Error' },
    { value: 'warn', label: 'Warning' },
    { value: 'info', label: 'Info' },
    { value: 'debug', label: 'Debug' }
  ];

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warn': return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'info': return <Info className="w-4 h-4 text-cyan-400" />;
      case 'debug': return <CheckCircle className="w-4 h-4 text-gray-400" />;
      default: return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLogTextColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-300';
      case 'warn': return 'text-amber-300';
      case 'info': return 'text-cyan-300';
      case 'debug': return 'text-gray-400';
      default: return 'text-gray-300';
    }
  };

  const generateMockLogs = () => {
    if (!lab) return;

    const levels: Array<'info' | 'warn' | 'error' | 'debug'> = ['info', 'warn', 'error', 'debug'];
    const messages = [
      'Container started successfully',
      'Health check passed - all systems operational',
      'Processing HTTP request from 192.168.1.100',
      'Database connection pool initialized (10 connections)',
      'Memory usage: 245MB / 512MB (47.8%)',
      'Cache hit ratio: 95.2% (excellent performance)',
      'SSL certificate validation successful',
      'Backup operation completed in 2.3 seconds',
      'User authentication successful for user@example.com',
      'API rate limit exceeded for client 192.168.1.50',
      'Connection timeout occurred after 30 seconds',
      'Invalid JSON payload in request body',
      'Service temporarily unavailable - retrying in 5s',
      'Configuration file reloaded successfully',
      'Metrics collection completed - 1,247 data points',
      'Docker image pull completed',
      'Port is now listening for connections',
      'Environment variables loaded from .env file',
      'Worker process spawned with PID 1234',
      'Graceful shutdown initiated by SIGTERM'
    ];

    const newLogs: LogEntry[] = Array.from({ length: 200 }, (_, i) => ({
      id: `log-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - (200 - i) * 30000).toISOString(),
      level: levels[Math.floor(Math.random() * levels.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      container: lab.containers[Math.floor(Math.random() * lab.containers.length)]?.name || 'unknown',
      source: Math.random() > 0.5 ? 'docker' : 'application'
    }));

    setLogs(newLogs);
  };

  const refreshLogs = () => {
    setIsLoading(true);
    setTimeout(() => {
      generateMockLogs();
      setIsLoading(false);
    }, 1000);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const downloadLogs = () => {
    const logContent = filteredLogs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase().padEnd(5)} [${log.container.padEnd(12)}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lab?.name}-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyLogs = () => {
    const logContent = filteredLogs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase().padEnd(5)} [${log.container.padEnd(12)}] ${log.message}`
    ).join('\n');
    navigator.clipboard.writeText(logContent);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  // Filter logs
  useEffect(() => {
    let filtered = logs;
    
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }
    
    if (selectedContainer !== 'all') {
      filtered = filtered.filter(log => log.container === selectedContainer);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.container.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredLogs(filtered);
  }, [logs, searchTerm, selectedLevel, selectedContainer]);

  // Auto-refresh
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        if (lab && lab.containers.length > 0) {
          const levels: Array<'info' | 'warn' | 'error' | 'debug'> = ['info', 'warn', 'error', 'debug'];
          const messages = [
            'New request processed successfully',
            'Background task completed',
            'Cache entry expired and refreshed',
            'Health check ping received',
            'Session cleanup completed'
          ];
          
          const newLog: LogEntry = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            level: levels[Math.floor(Math.random() * levels.length)],
            message: messages[Math.floor(Math.random() * messages.length)],
            container: lab.containers[Math.floor(Math.random() * lab.containers.length)].name,
            source: 'application'
          };
          setLogs(prev => [...prev, newLog]);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, lab]);

  useEffect(() => {
    if (lab) {
      generateMockLogs();
    }
  }, [lab]);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [filteredLogs]);

  if (!lab) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Lab Not Found</h3>
        <p className="text-muted-foreground mb-6">
          The requested lab could not be found or may have been removed.
        </p>
        <Button asChild>
          <Link to="/labs">Back to Labs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/lab/${labId}`} className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Lab</span>
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Container Logs</h1>
            <p className="text-muted-foreground">{lab.name} • {filteredLogs.length} of {logs.length} entries</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {autoRefresh && (
            <Badge variant="default" className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>Live</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs..."
                className="pl-10"
              />
            </div>
            
            {/* Level Filter */}
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {logLevels.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Container Filter */}
            <Select value={selectedContainer} onValueChange={setSelectedContainer}>
              <SelectTrigger className="w-[160px]">
                <Container className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Containers</SelectItem>
                {lab.containers.map(container => (
                  <SelectItem key={container.id} value={container.name}>
                    {container.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Button
                onClick={refreshLogs}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
                <span className="text-sm">Auto Refresh</span>
              </div>
              
              <Button
                onClick={copyLogs}
                variant="outline"
                size="sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              
              <Button
                onClick={downloadLogs}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              <Button
                onClick={clearLogs}
                variant="outline"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {logs.length} log entries
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Display */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Log Stream</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full bg-gray-950 text-gray-100 font-mono text-sm">
            <div ref={logsRef} className="p-4">
            {filteredLogs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center space-y-3">
                  <FileText className="w-16 h-16 mx-auto opacity-30" />
                  <div>
                    <p className="text-lg font-medium">No logs available</p>
                    <p className="text-sm opacity-70">
                      {logs.length === 0 ? 'No logs have been generated yet' : 'No logs match your current filters'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {filteredLogs.map((log, index) => (
                  <div 
                    key={log.id}
                    className="group flex items-start space-x-3 py-1.5 px-3 rounded-sm hover:bg-gray-900/50 transition-colors border-l-2 border-transparent hover:border-gray-600"
                  >
                    <div className="flex items-center space-x-2 min-w-0 flex-shrink-0 text-gray-500">
                      <span className="text-xs font-mono w-12 text-right">
                        {String(index + 1).padStart(4, '0')}
                      </span>
                      <div className="w-px h-4 bg-gray-700" />
                    </div>
                    
                    <div className="flex items-center space-x-2 min-w-0 flex-shrink-0">
                      <div className="flex items-center justify-center w-5 h-5">
                        {getLogIcon(log.level)}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span className="font-mono text-gray-500 w-12">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 min-w-0 flex-shrink-0">
                      <Badge variant="outline" className={`text-xs font-mono ${getLogTextColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-mono text-purple-300 bg-purple-950/50 border-purple-800/50">
                        {log.container}
                      </Badge>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <span className={`break-words font-mono ${getLogTextColor(log.level)}`}>
                        {log.message}
                      </span>
                    </div>
                    
                    <Button
                      onClick={() => navigator.clipboard.writeText(`[${log.timestamp}] ${log.level.toUpperCase().padEnd(5)} [${log.container.padEnd(12)}] ${log.message}`)}
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            </div>
          </ScrollArea>
        </CardContent>
        
        {/* Status Bar */}
        <div className="px-6 py-3 border-t bg-gray-900/50 flex items-center justify-between text-xs text-gray-400 font-mono flex-shrink-0">
          <div className="flex items-center space-x-6">
            <span>Total: {logs.length}</span>
            <span>Filtered: {filteredLogs.length}</span>
            {searchTerm && <span className="text-cyan-400">Search: "{searchTerm}"</span>}
            {selectedLevel !== 'all' && <span className="text-purple-400">Level: {selectedLevel}</span>}
            {selectedContainer !== 'all' && <span className="text-green-400">Container: {selectedContainer}</span>}
          </div>
          
          <div className="flex items-center space-x-6">
            <span>Lab: {lab.name}</span>
            <span>Updated: {new Date().toLocaleTimeString()}</span>
            {autoRefresh && (
              <span className="text-green-400 flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Live</span>
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LogsPage;