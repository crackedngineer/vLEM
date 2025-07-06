import { useState, useEffect } from 'react';
import { DockerLab, DockerContainer } from '../types';

// Mock data for demonstration
const mockLabs: DockerLab[] = [
  {
    id: 'lab-1',
    name: 'Web Development Stack',
    description: 'Nginx + PHP + MySQL development environment',
    status: 'running',
    compose: `version: '3.8'
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html
    restart: unless-stopped`,
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
    name: 'Database Cluster',
    description: 'MySQL master-slave replication setup',
    status: 'stopped',
    compose: `version: '3.8'
services:
  mysql-master:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
    ports:
      - "3306:3306"`,
    containers: [
      {
        id: 'cont-2',
        name: 'mysql-master',
        image: 'mysql:8.0',
        status: 'stopped',
        ports: ['3306:3306'],
        created: '2024-01-14T15:20:00Z'
      }
    ],
    createdAt: '2024-01-14T15:20:00Z',
    isCustom: true
  }
];

export const useDockerLabs = () => {
  const [labs, setLabs] = useState<DockerLab[]>(mockLabs);
  const [loading, setLoading] = useState(false);

  const createLab = async (name: string, description: string, compose: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newLab: DockerLab = {
        id: `lab-${Date.now()}`,
        name,
        description,
        status: 'stopped',
        compose,
        containers: [],
        createdAt: new Date().toISOString(),
        isCustom: true
      };
      setLabs(prev => [...prev, newLab]);
      setLoading(false);
    }, 1000);
  };

  const startLab = async (labId: string) => {
    setLoading(true);
    setTimeout(() => {
      setLabs(prev => prev.map(lab => 
        lab.id === labId ? { ...lab, status: 'running' as const } : lab
      ));
      setLoading(false);
    }, 2000);
  };

  const stopLab = async (labId: string) => {
    setLoading(true);
    setTimeout(() => {
      setLabs(prev => prev.map(lab => 
        lab.id === labId ? { ...lab, status: 'stopped' as const } : lab
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

  const updateLab = async (labId: string, compose: string) => {
    setLoading(true);
    setTimeout(() => {
      setLabs(prev => prev.map(lab => 
        lab.id === labId ? { ...lab, compose } : lab
      ));
      setLoading(false);
    }, 1000);
  };

  return {
    labs,
    loading,
    createLab,
    startLab,
    stopLab,
    removeLab,
    updateLab
  };
};