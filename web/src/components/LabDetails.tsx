import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DockerLab } from '../types';
import { 
  Play, 
  Square, 
  Trash2, 
  Activity,
  Container,
  Terminal,
  FileText,
  ArrowLeft,
  ExternalLink,
  Copy,
  RefreshCw,
  Settings,
  Globe,
  Database
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LabDetailsProps {
  labs: DockerLab[];
  onStartLab: (labId: string) => void;
  onStopLab: (labId: string) => void;
  onRemoveLab: (labId: string) => void;
  loading: boolean;
}

const LabDetails: React.FC<LabDetailsProps> = ({
  labs,
  onStartLab,
  onStopLab,
  onRemoveLab,
  loading
}) => {
  const { labId } = useParams<{ labId: string }>();
  const navigate = useNavigate();
  
  const lab = labs.find(l => l.id === labId);

  if (!lab) {
    return (
      <div className="text-center py-12">
        <Container className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
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

  const handleRemove = async () => {
    if (confirm('Are you sure you want to remove this lab? This action cannot be undone.')) {
      await onRemoveLab(lab.id);
      navigate('/labs');
    }
  };

  const copyCompose = () => {
    navigator.clipboard.writeText(lab.compose);
  };

  const getPortUrl = (port: string) => {
    const [hostPort] = port.split(':');
    return `http://localhost:${hostPort}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/labs" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Labs</span>
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{lab.name}</h1>
            <p className="text-muted-foreground">{lab.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusVariant(lab.status)} className="flex items-center space-x-1">
            {getStatusIcon(lab.status)}
            <span>{lab.status}</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lab Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Lab Controls</span>
              </CardTitle>
              <CardDescription>
                Manage your Docker lab environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    {getStatusIcon(lab.status)}
                  </div>
                  <div>
                    <p className="font-medium">Current Status</p>
                    <p className="text-sm text-muted-foreground">
                      Lab is currently {lab.status}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {lab.status === 'stopped' ? (
                    <Button
                      onClick={() => onStartLab(lab.id)}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Lab
                    </Button>
                  ) : (
                    <Button
                      onClick={() => onStopLab(lab.id)}
                      disabled={loading}
                      variant="destructive"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop Lab
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1"
                >
                  <Link to={`/lab/${lab.id}/logs`} className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>View Logs</span>
                  </Link>
                </Button>
                
                <Button
                  onClick={handleRemove}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Lab
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Containers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Container className="w-5 h-5" />
                <span>Containers ({lab.containers.length})</span>
              </CardTitle>
              <CardDescription>
                Manage individual containers in this lab
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lab.containers.length === 0 ? (
                <div className="text-center py-8">
                  <Container className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No containers found</p>
                </div>
              ) : (
                lab.containers.map(container => (
                  <Card key={container.id} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                            <Container className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{container.name}</h4>
                            <p className="text-sm text-muted-foreground">{container.image}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusVariant(container.status)}>
                            {container.status}
                          </Badge>
                          
                          {container.status === 'running' && (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                            >
                              <Link to={`/lab/${lab.id}/exec/${container.id}`} className="flex items-center space-x-2">
                                <Terminal className="w-4 h-4" />
                                <span>Exec</span>
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {container.ports.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground mb-2">Exposed Ports:</p>
                          <div className="flex flex-wrap gap-2">
                            {container.ports.map(port => (
                              <div key={port} className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {port}
                                </Badge>
                                {container.status === 'running' && (
                                  <Button
                                    onClick={() => window.open(getPortUrl(port), '_blank')}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lab Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lab Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-sm">{new Date(lab.createdAt).toLocaleString()}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Containers</p>
                <p className="text-sm">{lab.containers.length} containers</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <Badge variant="outline">
                  {lab.isCustom ? 'Custom Lab' : 'Template Lab'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Docker Compose */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Docker Compose</CardTitle>
                <Button
                  onClick={copyCompose}
                  variant="ghost"
                  size="sm"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <pre className="text-xs text-foreground overflow-x-auto whitespace-pre-wrap">
                    {lab.compose}
                  </pre>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LabDetails;