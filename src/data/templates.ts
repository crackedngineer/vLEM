import { LabTemplate } from '../types';

export const labTemplates: LabTemplate[] = [
  {
    id: 'nginx-basic',
    name: 'Nginx Web Server',
    description: 'Basic Nginx web server with custom HTML',
    category: 'Web Servers',
    icon: 'Globe',
    compose: `version: '3.8'
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html
    restart: unless-stopped
    container_name: nginx-web`
  },
  {
    id: 'mysql-db',
    name: 'MySQL Database',
    description: 'MySQL database with phpMyAdmin',
    category: 'Databases',
    icon: 'Database',
    compose: `version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: testdb
      MYSQL_USER: testuser
      MYSQL_PASSWORD: testpass
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
      PMA_USER: root
      PMA_PASSWORD: rootpassword
    ports:
      - "8081:80"
    depends_on:
      - mysql
    restart: unless-stopped

volumes:
  mysql_data:`
  },
  {
    id: 'redis-cache',
    name: 'Redis Cache',
    description: 'Redis cache server with Redis Commander',
    category: 'Caching',
    icon: 'Zap',
    compose: `version: '3.8'
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    command: redis-server --requirepass mypassword
    restart: unless-stopped

  redis-commander:
    image: rediscommander/redis-commander
    environment:
      REDIS_HOSTS: local:redis:6379
      REDIS_PASSWORD: mypassword
    ports:
      - "8082:8081"
    depends_on:
      - redis
    restart: unless-stopped`
  },
  {
    id: 'postgres-db',
    name: 'PostgreSQL Database',
    description: 'PostgreSQL with pgAdmin interface',
    category: 'Databases',
    icon: 'Database',
    compose: `version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: testdb
      POSTGRES_USER: testuser
      POSTGRES_PASSWORD: testpass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "8083:80"
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres_data:`
  },
  {
    id: 'monitoring-stack',
    name: 'Monitoring Stack',
    description: 'Prometheus, Grafana, and Node Exporter',
    category: 'Monitoring',
    icon: 'Activity',
    compose: `version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    restart: unless-stopped

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus
    restart: unless-stopped

  node-exporter:
    image: prom/node-exporter
    ports:
      - "9100:9100"
    restart: unless-stopped

volumes:
  grafana_data:`
  }
];