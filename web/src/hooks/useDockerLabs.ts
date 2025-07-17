import { useState, useEffect } from 'react';
import { DockerLab, DockerContainer, LabTemplate } from '../types';
import { fetchLabs } from '@/services/labService';

// Mock data for demonstration
const mockLabs: DockerLab[] = [
  {
    id: 'lab-1',
    name: 'Nginx Web Server',
    description: 'Basic Nginx web server with custom HTML',
    status: 'running',
    compose: `version: '3.8'
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html
    restart: unless-stopped
    container_name: nginx-web`,
    containers: [
      {
        id: 'cont-1',
        name: 'nginx-web',
        image: 'nginx:alpine',
        status: 'running',
        ports: ['8080:80'],
        created: '2024-01-15T10:30:00Z'
      }
    ],
    createdAt: '2024-01-15T10:30:00Z',
    isCustom: false
  },
  {
    id: 'lab-2',
    name: 'MySQL Database',
    description: 'MySQL database with phpMyAdmin interface',
    status: 'stopped',
    compose: `version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: testdb
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    environment:
      PMA_HOST: mysql
      PMA_PORT: 3306
    ports:
      - "8081:80"
    depends_on:
      - mysql
    restart: unless-stopped

volumes:
  mysql_data:`,
    containers: [
      {
        id: 'cont-2',
        name: 'mysql-db',
        image: 'mysql:8.0',
        status: 'stopped',
        ports: ['3306:3306'],
        created: '2024-01-14T15:20:00Z'
      },
      {
        id: 'cont-3',
        name: 'phpmyadmin',
        image: 'phpmyadmin/phpmyadmin',
        status: 'stopped',
        ports: ['8081:80'],
        created: '2024-01-14T15:20:00Z'
      }
    ],
    createdAt: '2024-01-14T15:20:00Z',
    isCustom: false
  }
];

export const useDockerLabs = () => {
  const [labs, setLabs] = useState<DockerLab[]>(mockLabs);
  const [loading, setLoading] = useState(false);

  const installLab = async (template: LabTemplate) => {
    setLoading(true);
  };

  useEffect(() => {
    // Fetch labs from API
    const fetchLabsData = async () => {
      setLoading(true);
      try {
        const fetchedLabs = await fetchLabs();
        setLabs(fetchedLabs);
      } catch (error) {
        console.error("Failed to fetch labs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLabsData();
  }, []);

  const startLab = async (labId: string) => {
    setLoading(true);
    setTimeout(() => {
      setLabs(prev => prev.map(lab => 
        lab.id === labId ? { 
          ...lab, 
          status: 'running' as const,
          containers: lab.containers.map(container => ({
            ...container,
            status: 'running' as const
          }))
        } : lab
      ));
      setLoading(false);
    }, 2000);
  };

  const stopLab = async (labId: string) => {
    setLoading(true);
    setTimeout(() => {
      setLabs(prev => prev.map(lab => 
        lab.id === labId ? { 
          ...lab, 
          status: 'stopped' as const,
          containers: lab.containers.map(container => ({
            ...container,
            status: 'stopped' as const
          }))
        } : lab
      ));
      setLoading(false);
    }, 1500);
  };

  const removeLab = async (labId: string) => {
    setLoading(true);
    setTimeout(() => {
      setLabs(prev => prev.filter(lab => lab.id !== labId));
      setLoading(false);
    }, 1000);
  };

  // Helper function to generate containers from compose file
  const generateContainersFromCompose = (compose: string): DockerContainer[] => {
    const containers: DockerContainer[] = [];
    const lines = compose.split('\n');
    let currentService = '';
    let currentImage = '';
    let currentPorts: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Service name (indented with 2 spaces)
      if (line.match(/^  \w+:$/)) {
        if (currentService && currentImage) {
          containers.push({
            id: `cont-${Date.now()}-${Math.random()}`,
            name: currentService,
            image: currentImage,
            status: 'stopped',
            ports: currentPorts,
            created: new Date().toISOString()
          });
        }
        currentService = trimmed.replace(':', '');
        currentImage = '';
        currentPorts = [];
      }
      
      // Image
      if (trimmed.startsWith('image:')) {
        currentImage = trimmed.replace('image:', '').trim();
      }
      
      // Ports
      if (trimmed.startsWith('- "') && trimmed.includes(':')) {
        const port = trimmed.replace('- "', '').replace('"', '');
        currentPorts.push(port);
      }
    }

    // Add the last service
    if (currentService && currentImage) {
      containers.push({
        id: `cont-${Date.now()}-${Math.random()}`,
        name: currentService,
        image: currentImage,
        status: 'stopped',
        ports: currentPorts,
        created: new Date().toISOString()
      });
    }

    return containers;
  };

  return {
    labs,
    loading,
    installLab,
    startLab,
    stopLab,
    removeLab
  };
};