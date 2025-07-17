import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  ArrowRight,
  Terminal,
  Clock,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { LabTemplate } from "@/types";
import { fetchLabTemplates } from "@/services/labService";

interface BuildLogsProps {
  onInstallComplete: (labId: string) => void;
}

interface BuildStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  logs: string[];
  startTime?: Date;
  endTime?: Date;
}

const BuildLogs: React.FC<BuildLogsProps> = ({ onInstallComplete }) => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [labTemplate, setLabTemplate] = useState<LabTemplate>([]);
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [buildStatus, setBuildStatus] = useState<
    "building" | "completed" | "failed"
  >("building");
  const [newLabId, setNewLabId] = useState<string>("");
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!labTemplate) {
      navigate("/templates");
      return;
    }

    // Initialize build steps
    const steps: BuildStep[] = [
      {
        id: "validate",
        name: "Validating Docker Compose",
        status: "pending",
        logs: [],
      },
      {
        id: "pull",
        name: "Pulling Docker Images",
        status: "pending",
        logs: [],
      },
      { id: "network", name: "Creating Networks", status: "pending", logs: [] },
      { id: "volumes", name: "Creating Volumes", status: "pending", logs: [] },
      {
        id: "containers",
        name: "Starting Containers",
        status: "pending",
        logs: [],
      },
      { id: "health", name: "Health Checks", status: "pending", logs: [] },
    ];

    setBuildSteps(steps);
    startBuild(steps);
  }, [labTemplate, templateId, navigate]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [buildSteps]);

  const startBuild = async (steps: BuildStep[]) => {
    const labId = `lab-${Date.now()}`;
    setNewLabId(labId);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);

      // Update step to running
      setBuildSteps((prev) =>
        prev.map((step, index) =>
          index === i
            ? { ...step, status: "running", startTime: new Date() }
            : step
        )
      );

      // Simulate build process with realistic logs
      await simulateStep(steps[i], i);

      // Mark step as completed
      setBuildSteps((prev) =>
        prev.map((step, index) =>
          index === i
            ? { ...step, status: "completed", endTime: new Date() }
            : step
        )
      );

      // Wait before next step
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setBuildStatus("completed");
  };

  const simulateStep = async (step: BuildStep, stepIndex: number) => {
    const stepLogs = getStepLogs(step.id, labTemplate!);

    for (const log of stepLogs) {
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 500 + 200)
      );

      setBuildSteps((prev) =>
        prev.map((s, index) =>
          index === stepIndex ? { ...s, logs: [...s.logs, log] } : s
        )
      );
    }
  };

  const getStepLogs = (stepId: string, template: any): string[] => {
    const commonLogs = {
      validate: [
        "Parsing docker-compose.yml...",
        "Validating service definitions...",
        "Checking for syntax errors...",
        "✓ Docker Compose file is valid",
      ],
      pull: [
        `Pulling ${template.name.toLowerCase().replace(/\s+/g, "-")} images...`,
        "Pulling nginx:alpine... ████████████████ 100%",
        "Pulling mysql:8.0... ████████████████ 100%",
        "✓ All images pulled successfully",
      ],
      network: [
        "Creating default network...",
        `Creating ${template.name
          .toLowerCase()
          .replace(/\s+/g, "-")}_default network`,
        "✓ Networks created successfully",
      ],
      volumes: [
        "Creating named volumes...",
        "Creating volume mysql_data...",
        "✓ Volumes created successfully",
      ],
      containers: [
        "Starting containers...",
        "Container web started",
        "Container database started",
        "✓ All containers started successfully",
      ],
      health: [
        "Performing health checks...",
        "Checking container connectivity...",
        "Verifying service endpoints...",
        "✓ All health checks passed",
      ],
    };

    return commonLogs[stepId as keyof typeof commonLogs] || [];
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "running":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-muted" />;
    }
  };

  const getStepDuration = (step: BuildStep) => {
    if (!step.startTime) return "";
    const endTime = step.endTime || new Date();
    const duration = Math.round(
      (endTime.getTime() - step.startTime.getTime()) / 1000
    );
    return `${duration}s`;
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetchLabTemplates();
        setLabTemplate(
          response.find((t: LabTemplate) => t.name === templateId)
        );
      } catch (error) {
        console.error("Failed to fetch lab templates:", error);
      }
    };
    fetchTemplates();
  }, []);

  if (!labTemplate) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <Container className="w-6 h-6 text-primary" />
          </div>
          <ArrowRight className="w-6 h-6 text-muted-foreground" />
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-500/10">
            {buildStatus === "building" ? (
              <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
            ) : buildStatus === "completed" ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
          </div>
        </div>

        <h2 className="text-3xl font-bold text-foreground">
          {buildStatus === "building"
            ? "Installing"
            : buildStatus === "completed"
            ? "Installation Complete"
            : "Installation Failed"}
        </h2>
        <p className="text-muted-foreground">
          {buildStatus === "building"
            ? `Setting up ${labTemplate.name}...`
            : buildStatus === "completed"
            ? `${labTemplate.name} has been successfully installed`
            : "There was an error during installation"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Build Steps */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Build Steps</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {buildSteps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-3">
                  {getStepIcon(step.status)}
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        step.status === "completed"
                          ? "text-green-600"
                          : step.status === "running"
                          ? "text-blue-600"
                          : step.status === "failed"
                          ? "text-red-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.name}
                    </p>
                    {step.status !== "pending" && (
                      <p className="text-xs text-muted-foreground">
                        {getStepDuration(step)}
                      </p>
                    )}
                  </div>
                  {index === currentStep && step.status === "running" && (
                    <Badge variant="default" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {buildStatus === "completed" && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Ready to Use!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your lab is now available
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate(`/lab/${newLabId}`)}
                    className="w-full"
                  >
                    Open Lab Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Build Logs */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Terminal className="w-5 h-5" />
                <span>Build Logs</span>
                <Badge variant="outline" className="ml-auto">
                  Live
                </Badge>
              </CardTitle>
              <Progress
                value={((currentStep + 1) / buildSteps.length) * 100}
                className="w-full"
              />
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full bg-gray-950 text-gray-100 font-mono text-sm">
                <div className="p-4">
                  {buildSteps.map((step, stepIndex) => (
                    <div key={step.id} className="mb-4">
                      {step.logs.length > 0 && (
                        <>
                          <div className="text-cyan-400 font-bold mb-2">
                            [{new Date().toLocaleTimeString()}] === {step.name}{" "}
                            ===
                          </div>
                          {step.logs.map((log, logIndex) => (
                            <div key={logIndex} className="mb-1 text-gray-300">
                              <span className="text-gray-500 mr-2">
                                [{new Date().toLocaleTimeString()}]
                              </span>
                              {log}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BuildLogs;
