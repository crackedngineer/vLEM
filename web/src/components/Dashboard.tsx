import React from 'react';
import { DockerLab } from '../types';
import { 
  Play, 
  Square, 
  Trash2, 
  Activity,
  Database,
  Container,
  Terminal,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface DashboardProps {
  labs: DockerLab[];
  onStartLab: (labId: string) => void;
  onStopLab: (labId: string) => void;
  onRemoveLab: (labId: string) => void;
  onViewLogs: (labId: string) => void;
  onExecContainer: (labId: string, containerId: string) => void;
  loading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({
  labs,
  onStartLab,
  onStopLab,
  onRemoveLab,
  onViewLogs,
  onExecContainer,
  loading
}) => {
  const runningLabs = labs.filter(lab => lab.status === 'running').length;
  const stoppedLabs = labs.filter(lab => lab.status === 'stopped').length;
  const totalContainers = labs.reduce((sum, lab) => sum + lab.containers.length, 0);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'running': return 'default';
      case 'stopped': return 'secondary';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="w-4 h-4" />;
      case 'stopped': return <Square className="w-4 h-4" />;
      case 'error': return <Trash2 className="w-4 h-4" />;
      default: return <Square className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Labs</CardTitle>
            <Container className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{labs.length}</div>
            <p className="text-xs text-muted-foreground">
              Active environments
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{runningLabs}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stopped</CardTitle>
            <Square className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stoppedLabs}</div>
            <p className="text-xs text-muted-foreground">
              Inactive labs
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Containers</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{totalContainers}</div>
            <p className="text-xs text-muted-foreground">
              Total containers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Labs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Container className="w-5 h-5" />
            <span>Docker Labs</span>
          </CardTitle>
          <CardDescription>
            Manage your Docker environments and containers
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {labs.map(lab => (
            <Card key={lab.id} className="border-muted hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                        {getStatusIcon(lab.status)}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">{lab.name}</h4>
                        <p className="text-sm text-muted-foreground">{lab.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge variant={getStatusVariant(lab.status)}>
                        {lab.status}
                      </Badge>
                      <Badge variant="outline">
                        {lab.containers.length} containers
                      </Badge>
                      <Badge variant="outline">
                        {lab.isCustom ? 'Custom' : 'Template'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {lab.status === 'stopped' ? (
                      <Button
                        onClick={() => onStartLab(lab.id)}
                        disabled={loading}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                    ) : (
                      <Button
                        onClick={() => onStopLab(lab.id)}
                        disabled={loading}
                        variant="destructive"
                        size="sm"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => onViewLogs(lab.id)}
                      variant="outline"
                      size="sm"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Logs
                    </Button>
                    
                    <Button
                      onClick={() => onRemoveLab(lab.id)}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
                
                {/* Container Details */}
                {lab.containers.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <h5 className="text-sm font-medium text-foreground mb-3">Containers:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {lab.containers.map(container => (
                        <Card key={container.id} className="bg-muted/50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Container className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <span className="text-sm font-medium">{container.name}</span>
                                  <p className="text-xs text-muted-foreground">{container.image}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={getStatusVariant(container.status)} className="text-xs">
                                  {container.status}
                                </Badge>
                                <Button
                                  onClick={() => onExecContainer(lab.id, container.id)}
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2"
                                >
                                  <Terminal className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;