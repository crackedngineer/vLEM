import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DockerLab } from '../types';
import { 
  ArrowLeft, 
  Terminal, 
  Copy, 
  Trash2, 
  Send, 
  Container,
  Activity,
  Clock,
  User,
  Server
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ContainerExecPageProps {
  labs: DockerLab[];
}

interface CommandHistory {
  id: string;
  command: string;
  output: string;
  timestamp: Date;
  exitCode: number;
}

const ContainerExecPage: React.FC<ContainerExecPageProps> = ({ labs }) => {
  const { labId, containerId } = useParams<{ labId: string; containerId: string }>();
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<CommandHistory[]>([]);
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isConnected, setIsConnected] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const lab = labs.find(l => l.id === labId);
  const container = lab?.containers.find(c => c.id === containerId);

  const mockCommands: { [key: string]: { output: string; exitCode: number } } = {
    'ls': { 
      output: 'bin  boot  dev  etc  home  lib  lib64  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var', 
      exitCode: 0 
    },
    'pwd': { output: '/usr/share/nginx/html', exitCode: 0 },
    'whoami': { output: 'root', exitCode: 0 },
    'ps aux': { 
      output: 'PID   USER     COMMAND\n1     root     nginx: master process nginx -g daemon off;\n7     nginx    nginx: worker process', 
      exitCode: 0 
    },
    'cat /etc/os-release': { 
      output: 'NAME="Alpine Linux"\nID=alpine\nVERSION_ID=3.18.4\nPRETTY_NAME="Alpine Linux v3.18"', 
      exitCode: 0 
    },
    'df -h': { 
      output: 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        20G  2.1G   17G  11% /', 
      exitCode: 0 
    },
    'free -h': { 
      output: '              total        used        free      shared  buff/cache   available\nMem:          2.0Gi       145Mi       1.7Gi       0.0Ki        89Mi       1.7Gi\nSwap:            0B          0B          0B', 
      exitCode: 0 
    },
    'uname -a': { 
      output: 'Linux container-name 5.15.0-56-generic #62-Ubuntu x86_64 GNU/Linux', 
      exitCode: 0 
    },
    'env': { 
      output: 'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nHOSTNAME=container-name\nNGINX_VERSION=1.24.0', 
      exitCode: 0 
    },
    'date': { output: new Date().toString(), exitCode: 0 },
    'help': { 
      output: 'Available commands: ls, pwd, whoami, ps aux, cat, df -h, free -h, uname -a, env, date, clear, exit, help', 
      exitCode: 0 
    }
  };

  useEffect(() => {
    if (!lab || !container) return;

    // Add welcome message
    const welcomeCommand: CommandHistory = {
      id: `cmd-${Date.now()}`,
      command: 'system',
      output: `Connected to container: ${container.name}\nContainer ID: ${container.id}\nImage: ${container.image}\nType 'help' for available commands, 'exit' to return to lab details\n`,
      timestamp: new Date(),
      exitCode: 0
    };
    setCommandHistory([welcomeCommand]);

    // Focus input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [lab, container]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  const executeCommand = (cmd: string) => {
    if (!cmd.trim()) return;

    const trimmedCmd = cmd.trim();
    
    if (trimmedCmd === 'clear') {
      setCommandHistory([]);
      return;
    }
    
    if (trimmedCmd === 'exit') {
      window.history.back();
      return;
    }

    // Add to input history
    setInputHistory(prev => [...prev, trimmedCmd]);
    setHistoryIndex(-1);

    // Execute command
    const result = mockCommands[trimmedCmd] || { 
      output: `bash: ${trimmedCmd}: command not found`, 
      exitCode: 127 
    };

    const newCommand: CommandHistory = {
      id: `cmd-${Date.now()}`,
      command: trimmedCmd,
      output: result.output,
      timestamp: new Date(),
      exitCode: result.exitCode
    };

    setCommandHistory(prev => [...prev, newCommand]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(command);
    setCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (inputHistory.length > 0) {
        const newIndex = historyIndex === -1 ? inputHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(inputHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= inputHistory.length) {
          setHistoryIndex(-1);
          setCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCommand(inputHistory[newIndex]);
        }
      }
    }
  };

  const copyCommand = (cmd: CommandHistory) => {
    navigator.clipboard.writeText(`$ ${cmd.command}\n${cmd.output}`);
  };

  const clearTerminal = () => {
    setCommandHistory([]);
  };

  if (!lab || !container) {
    return (
      <div className="text-center py-12">
        <Container className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Container Not Found</h3>
        <p className="text-muted-foreground mb-6">
          The requested container could not be found or may have been removed.
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
            <h1 className="text-2xl font-bold text-foreground">Container Terminal</h1>
            <p className="text-muted-foreground">{container.name} • {container.image}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center space-x-1">
            <Activity className="w-3 h-3" />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Terminal */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <Terminal className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Interactive Shell</CardTitle>
                  <p className="text-sm text-muted-foreground">Execute commands in {container.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={clearTerminal}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 bg-gray-950 text-gray-100 font-mono text-sm">
                <div ref={terminalRef} className="p-4">
                {commandHistory.map((cmd) => (
                  <div key={cmd.id} className="mb-4 group">
                    {cmd.command !== 'system' && (
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-green-400">$</span>
                          <span className="text-cyan-300">{cmd.command}</span>
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-gray-500">
                            {cmd.timestamp.toLocaleTimeString()}
                          </span>
                          <Button
                            onClick={() => copyCommand(cmd)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className={`whitespace-pre-wrap ${
                      cmd.exitCode === 0 ? 'text-gray-300' : 'text-red-300'
                    }`}>
                      {cmd.output}
                    </div>
                  </div>
                ))}
                </div>
              </ScrollArea>
              
              <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-900">
                <div className="flex items-center space-x-3">
                  <span className="text-green-400 font-mono font-bold">$</span>
                  <Input
                    ref={inputRef}
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 font-mono bg-gray-800 border-gray-700 text-gray-100"
                    placeholder="Enter command..."
                    disabled={!isConnected}
                  />
                  <Button type="submit" size="sm" disabled={!isConnected}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Use ↑/↓ arrow keys for command history. Type 'help' for available commands.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Container Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Container Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Container className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{container.name}</p>
                  <p className="text-sm text-muted-foreground">{container.image}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={container.status === 'running' ? 'default' : 'secondary'}>
                    {container.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">{new Date(container.created).toLocaleDateString()}</span>
                </div>
                
                {container.ports.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">Ports</span>
                    <div className="mt-1 space-y-1">
                      {container.ports.map(port => (
                        <Badge key={port} variant="outline" className="text-xs">
                          {port}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Commands */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Commands</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { cmd: 'ls -la', desc: 'List files' },
                { cmd: 'ps aux', desc: 'Show processes' },
                { cmd: 'df -h', desc: 'Disk usage' },
                { cmd: 'free -h', desc: 'Memory usage' },
                { cmd: 'env', desc: 'Environment vars' }
              ].map(({ cmd, desc }) => (
                <TooltipProvider key={cmd}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        key={cmd}
                        onClick={() => {
                          setCommand(cmd);
                          if (inputRef.current) inputRef.current.focus();
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left"
                      >
                        <div className="font-mono text-xs">{cmd}</div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{desc}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </CardContent>
          </Card>

          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Commands</span>
                <span className="text-sm">{inputHistory.length}</span>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Connected</span>
                <span className="text-sm">{new Date().toLocaleTimeString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Shell</span>
                <span className="text-sm font-mono">/bin/bash</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContainerExecPage;