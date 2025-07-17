import React from "react";
import { useNavigate } from "react-router-dom";
import { DockerLab } from "../types";
import {
  Play,
  Square,
  Trash2,
  Activity,
  Database,
  Container,
  Eye,
  Clock,
  Cpu,
  HardDrive,
  Network,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardProps {
  labs: DockerLab[];
  onStartLab: (labId: string) => void;
  onStopLab: (labId: string) => void;
  onRemoveLab: (labId: string) => void;
  loading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({
  labs,
  onStartLab,
  onStopLab,
  onRemoveLab,
  loading,
}) => {
  const navigator = useNavigate();
  const runningLabs = labs.filter((lab) => lab.status === "running").length;
  // const stoppedLabs = labs.filter(lab => lab.status === 'stopped').length;
  // const totalContainers = labs.reduce((sum, lab) => sum + lab.containers.length, 0);
  const totalContainers = 3;
  // const runningContainers = labs.reduce((sum, lab) =>
  //   sum + lab.containers.filter(c => c.status === 'running').length, 0
  // );
  const runningContainers = 2;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "running":
        return "default";
      case "stopped":
        return "secondary";
      case "error":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Activity className="w-4 h-4" />;
      case "stopped":
        return <Square className="w-4 h-4" />;
      case "error":
        return <Trash2 className="w-4 h-4" />;
      default:
        return <Square className="w-4 h-4" />;
    }
  };

  const handleNavigation = (path: string) => {
    navigator(path);
  };

  const recentLabs = labs
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Installed Labs
            </CardTitle>
            <Container className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{labs.length}</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {runningLabs}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((runningLabs / Math.max(labs.length, 1)) * 100)}%
              uptime
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Containers</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {totalContainers}
            </div>
            <p className="text-xs text-muted-foreground">
              {runningContainers} running
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resource Usage
            </CardTitle>
            <Cpu className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">2.4GB</div>
            <p className="text-xs text-muted-foreground">Memory usage</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>System Overview</span>
            </CardTitle>
            <CardDescription>
              Resource usage and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Cpu className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <div className="text-2xl font-bold text-foreground">45%</div>
                <p className="text-xs text-muted-foreground">CPU Usage</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <HardDrive className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <div className="text-2xl font-bold text-foreground">2.4GB</div>
                <p className="text-xs text-muted-foreground">Memory</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Network className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  1.2MB/s
                </div>
                <p className="text-xs text-muted-foreground">Network</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Database className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                <div className="text-2xl font-bold text-foreground">15GB</div>
                <p className="text-xs text-muted-foreground">Storage</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Docker Engine</span>
                <Badge variant="default">Running</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Container Runtime</span>
                <Badge variant="default">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Network Bridge</span>
                <Badge variant="default">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentLabs.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No recent activity
                </p>
              </div>
            ) : (
              recentLabs.map((lab) => (
                <div
                  key={lab.id}
                  className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                    {getStatusIcon(lab.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {lab.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Installed {new Date(lab.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={getStatusVariant(lab.status)}
                    className="text-xs"
                  >
                    {lab.status}
                  </Badge>
                </div>
              ))
            )}

            <Button
              onClick={() => handleNavigation("/labs")}
              variant="outline"
              className="w-full"
            >
              View All Labs
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Labs List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Container className="w-5 h-5" />
                <span>My Docker Labs</span>
              </CardTitle>
              <CardDescription>
                Quick access to your most recently used labs
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                handleNavigation("/templates");
              }}
              className="flex items-center space-x-2"
            >
              <Container className="w-4 h-4" />
              <span>Install New Lab</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {labs.length === 0 ? (
            <div className="text-center py-12">
              <Container className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Labs Installed
              </h3>
              <p className="text-muted-foreground mb-6">
                Get started by installing your first Docker lab from our
                template collection
              </p>
              <Button onClick={() => handleNavigation("/templates")}>
                Browse Lab Templates
              </Button>
            </div>
          ) : (
            labs.slice(0, 3).map((lab) => (
              <Card
                key={lab.id}
                className="border-muted hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                          {getStatusIcon(lab.status)}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-foreground">
                            {lab.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {lab.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Badge variant={getStatusVariant(lab.status)}>
                          {lab.status}
                        </Badge>
                        <Badge variant="outline">
                          {lab?.containers?.length || 0} containers
                        </Badge>
                        <Badge variant="outline">
                          Installed{" "}
                          {new Date(lab.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleNavigation(`/lab/${lab.id}`)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Details</span>
                      </Button>

                      {lab.status === "stopped" ? (
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
                </CardContent>
              </Card>
            ))
          )}

          {labs.length > 3 && (
            <div className="text-center pt-4">
              <Button
                onClick={() => handleNavigation("/labs")}
                variant="outline"
              >
                View All {labs.length} Labs
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
