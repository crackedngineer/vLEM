export interface DockerLab {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'stopped' | 'error';
  compose: string;
  containers: DockerContainer[];
  createdAt: string;
  isCustom: boolean;
}

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'error';
  ports: string[];
  created: string;
}

export interface LabTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  compose: string;
  icon: string;
}