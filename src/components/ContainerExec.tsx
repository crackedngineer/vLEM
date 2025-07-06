import React, { useState, useEffect, useRef } from 'react';
import { X, Terminal, Copy, Trash2, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface ContainerExecProps {
  labId: string;
  containerId: string;
  containerName: string;
  onClose: () => void;
}

const ContainerExec: React.FC<ContainerExecProps> = ({ 
  labId, 
  containerId, 
  containerName, 
  onClose 
}) => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);

  const mockCommands: { [key: string]: string } = {
    'ls': 'bin  boot  dev  etc  home  lib  lib64  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var',
    'pwd': '/usr/share/nginx/html',
    'whoami': 'root',
    'ps aux': 'PID   USER     COMMAND\n1     root     nginx: master process nginx -g daemon off;\n7     nginx    nginx: worker process',
    'cat /etc/os-release': 'NAME="Alpine Linux"\nID=alpine\nVERSION_ID=3.18.4\nPRETTY_NAME="Alpine Linux v3.18"',
    'df -h': 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        20G  2.1G   17G  11% /',
    'free -h': '              total        used        free      shared  buff/cache   available\nMem:          2.0Gi       145Mi       1.7Gi       0.0Ki        89Mi       1.7Gi\nSwap:            0B          0B          0B',
    'uname -a': 'Linux container-name 5.15.0-56-generic #62-Ubuntu x86_64 GNU/Linux',
    'env': 'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nHOSTNAME=container-name\nNGINX_VERSION=1.24.0',
    'date': new Date().toString(),
    'help': 'Available commands: ls, pwd, whoami, ps aux, cat, df -h, free -h, uname -a, env, date, clear, exit'
  };

  const executeCommand = (cmd: string) => {
    if (!cmd.trim()) return;

    const trimmedCmd = cmd.trim();
    setOutput(prev => [...prev, `$ ${trimmedCmd}`]);
    
    if (trimmedCmd === 'clear') {
      setOutput([]);
      return;
    }
    
    if (trimmedCmd === 'exit') {
      onClose();
      return;
    }

    // Add to history
    setHistory(prev => [...prev, trimmedCmd]);
    setHistoryIndex(-1);

    // Simulate command execution
    setTimeout(() => {
      const result = mockCommands[trimmedCmd] || `bash: ${trimmedCmd}: command not found`;
      setOutput(prev => [...prev, result]);
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(command);
    setCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCommand(history[newIndex]);
        }
      }
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output.join('\n'));
  };

  const clearOutput = () => {
    setOutput([]);
  };

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    setOutput([
      `Connected to container: ${containerName}`,
      `Container ID: ${containerId}`,
      `Type 'help' for available commands, 'exit' to close terminal`,
      ''
    ]);
  }, [containerId, containerName]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Terminal className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Container Terminal</CardTitle>
              <p className="text-sm text-muted-foreground">{containerName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Connected
            </Badge>
            
            <Button
              onClick={copyOutput}
              variant="outline"
              size="sm"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            
            <Button
              onClick={clearOutput}
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
        
        <CardContent className="flex-1 flex flex-col p-0">
          <div 
            ref={outputRef}
            className="flex-1 overflow-auto terminal-purple p-4 font-mono text-sm"
          >
            {output.map((line, index) => (
              <div key={index} className="mb-1 whitespace-pre-wrap hover:bg-primary/10 px-2 py-1 rounded transition-colors">
                {line}
              </div>
            ))}
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 border-t bg-muted/50">
            <div className="flex items-center space-x-3">
              <span className="text-primary font-mono font-bold">$</span>
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 font-mono bg-background"
                placeholder="Enter command..."
                autoFocus
              />
              <Button type="submit" size="sm">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use ↑/↓ arrow keys for command history. Type 'help' for available commands.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContainerExec;