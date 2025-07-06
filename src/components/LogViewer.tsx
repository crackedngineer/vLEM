import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  Trash2, 
  RefreshCw, 
  Play, 
  Pause, 
  Search,
  Filter,
  Copy,
  Terminal,
  Clock,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Maximize2,
  Minimize2,
  ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface LogViewerProps {
  labId: string;
  labName: string;
  onClose: () => void;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source?: string;
}

const LogViewer: React.FC<LogViewerProps> = ({ labId, labName, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [followLogs, setFollowLogs] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const endOfLogsRef = useRef<HTMLDivElement>(null);

  const logLevels = [
    { value: 'all', label: 'All Levels', count: filteredLogs.length },
    { value: 'error', label: 'Error', count: logs.filter(l => l.level === 'error').length },
    { value: 'warn', label: 'Warning', count: logs.filter(l => l.level === 'warn').length },
    { value: 'info', label: 'Info', count: logs.filter(l => l.level === 'info').length },
    { value: 'debug', label: 'Debug', count: logs.filter(l => l.level === 'debug').length },
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

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-300 bg-red-950/50 border-red-800/50';
      case 'warn': return 'text-amber-300 bg-amber-950/50 border-amber-800/50';
      case 'info': return 'text-cyan-300 bg-cyan-950/50 border-cyan-800/50';
      case 'debug': return 'text-gray-300 bg-gray-800/50 border-gray-700/50';
      default: return 'text-gray-300 bg-gray-800/50 border-gray-700/50';
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
    const levels: Array<'info' | 'warn' | 'error' | 'debug'> = ['info', 'warn', 'error', 'debug'];
    const sources = ['nginx', 'app', 'database', 'cache', 'auth', 'api'];
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
      'Docker image pull completed: nginx:alpine',
      'Port 8080 is now listening for connections',
      'Environment variables loaded from .env file',
      'Worker process spawned with PID 1234',
      'Graceful shutdown initiated by SIGTERM'
    ];

    const newLogs: LogEntry[] = Array.from({ length: 100 }, (_, i) => ({
      id: `log-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - (100 - i) * 30000).toISOString(),
      level: levels[Math.floor(Math.random() * levels.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      source: sources[Math.floor(Math.random() * sources.length)]
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
    setFilteredLogs([]);
  };

  const downloadLogs = () => {
    const logContent = filteredLogs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase().padEnd(5)} [${log.source?.padEnd(8)}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${labName}-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyLogs = () => {
    const logContent = filteredLogs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase().padEnd(5)} [${log.source?.padEnd(8)}] ${log.message}`
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

  const scrollToBottom = () => {
    if (endOfLogsRef.current) {
      endOfLogsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (logContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
      setFollowLogs(isNearBottom);
    }
  };

  // Filter logs based on search term and level
  useEffect(() => {
    let filtered = logs;
    
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredLogs(filtered);
  }, [logs, searchTerm, selectedLevel]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (followLogs && endOfLogsRef.current) {
      endOfLogsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, followLogs]);

  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        const levels: Array<'info' | 'warn' | 'error' | 'debug'> = ['info', 'warn', 'error', 'debug'];
        const sources = ['nginx', 'app', 'database', 'cache', 'auth', 'api'];
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
          source: sources[Math.floor(Math.random() * sources.length)]
        };
        setLogs(prev => [...prev, newLog]);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  useEffect(() => {
    generateMockLogs();
  }, [labId]);

  const containerClasses = isFullscreen 
    ? "fixed inset-0 z-50 bg-background" 
    : "fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4";

  const cardClasses = isFullscreen 
    ? "w-full h-full flex flex-col border-0 rounded-none" 
    : "w-full max-w-7xl max-h-[90vh] flex flex-col";

  return (
    <div className={containerClasses}>
      <Card className={cardClasses}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Terminal className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl flex items-center space-x-2">
                <span>Container Logs</span>
                {autoRefresh && (
                  <Badge variant="default" className="text-xs bg-green-600">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1" />
                    Live
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {labName} • {filteredLogs.length} of {logs.length} entries
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setIsFullscreen(!isFullscreen)}
              variant="outline"
              size="sm"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            
            <Button
              onClick={refreshLogs}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
            >
              {autoRefresh ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              Auto
            </Button>
            
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
            
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        {/* Filters and Search */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search logs..."
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {logLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label} ({level.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="follow-logs"
                  checked={followLogs}
                  onChange={(e) => setFollowLogs(e.target.checked)}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <label htmlFor="follow-logs" className="text-sm text-muted-foreground">
                  Follow logs
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <CardContent className="flex-1 overflow-hidden p-0 relative">
          <div 
            ref={logContainerRef}
            onScroll={handleScroll}
            className="h-full overflow-auto bg-gray-950 text-gray-100 font-mono text-sm modal-smooth-scroll"
          >
            {filteredLogs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center space-y-3">
                  <Terminal className="w-16 h-16 mx-auto opacity-30" />
                  <div>
                    <p className="text-lg font-medium">No logs available</p>
                    <p className="text-sm opacity-70">Logs will appear here when containers generate output</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-0">
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
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-mono ${getLogLevelColor(log.level)}`}
                      >
                        {log.level.toUpperCase()}
                      </Badge>
                      {log.source && (
                        <Badge variant="outline" className="text-xs font-mono text-purple-300 bg-purple-950/50 border-purple-800/50">
                          {log.source}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <span className={`break-words font-mono ${getLogTextColor(log.level)}`}>
                        {log.message}
                      </span>
                    </div>
                    
                    <Button
                      onClick={() => navigator.clipboard.writeText(`[${log.timestamp}] ${log.level.toUpperCase().padEnd(5)} [${log.source?.padEnd(8)}] ${log.message}`)}
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <div ref={endOfLogsRef} />
              </div>
            )}
          </div>
          
          {/* Scroll to bottom button */}
          {showScrollButton && (
            <Button
              onClick={scrollToBottom}
              className="absolute bottom-4 right-4 rounded-full w-10 h-10 p-0 bg-primary/90 hover:bg-primary shadow-lg"
              size="sm"
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
          )}
        </CardContent>
        
        {/* Status Bar */}
        <div className="px-6 py-3 border-t bg-gray-900/50 flex items-center justify-between text-xs text-gray-400 font-mono flex-shrink-0">
          <div className="flex items-center space-x-6">
            <span>Total: {logs.length}</span>
            <span>Filtered: {filteredLogs.length}</span>
            {searchTerm && <span className="text-cyan-400">Search: "{searchTerm}"</span>}
            {selectedLevel !== 'all' && <span className="text-purple-400">Level: {selectedLevel}</span>}
          </div>
          
          <div className="flex items-center space-x-6">
            <span>Container: {labName}</span>
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

export default LogViewer;