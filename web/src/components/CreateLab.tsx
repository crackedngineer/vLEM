import React, { useState } from 'react';
import { Save, Code, FileText, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

interface CreateLabProps {
  onCreateLab: (name: string, description: string, compose: string) => void;
  initialTemplate?: any;
  loading: boolean;
}

const CreateLab: React.FC<CreateLabProps> = ({ onCreateLab, initialTemplate, loading }) => {
  const [name, setName] = useState(initialTemplate?.name || '');
  const [description, setDescription] = useState(initialTemplate?.description || '');
  const [compose, setCompose] = useState(initialTemplate?.compose || `version: '3.8'
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    restart: unless-stopped`);
  const [useForm, setUseForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Form-based service configuration
  const [services, setServices] = useState([
    { name: 'web', image: 'nginx:alpine', ports: '8080:80', environment: '', volumes: '' }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && description.trim() && compose.trim()) {
      onCreateLab(name.trim(), description.trim(), compose.trim());
    }
  };

  const addService = () => {
    setServices([...services, { name: '', image: '', ports: '', environment: '', volumes: '' }]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: string, value: string) => {
    const updated = services.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    );
    setServices(updated);
    generateComposeFromForm(updated);
  };

  const generateComposeFromForm = (servicesData: any[]) => {
    const validServices = servicesData.filter(s => s.name && s.image);
    
    if (validServices.length === 0) return;

    let composeContent = `version: '3.8'\nservices:\n`;
    
    validServices.forEach(service => {
      composeContent += `  ${service.name}:\n`;
      composeContent += `    image: ${service.image}\n`;
      
      if (service.ports) {
        composeContent += `    ports:\n`;
        service.ports.split(',').forEach((port: string) => {
          composeContent += `      - "${port.trim()}"\n`;
        });
      }
      
      if (service.environment) {
        composeContent += `    environment:\n`;
        service.environment.split('\n').forEach((env: string) => {
          const [key, value] = env.split('=');
          if (key && value) {
            composeContent += `      ${key.trim()}: ${value.trim()}\n`;
          }
        });
      }
      
      if (service.volumes) {
        composeContent += `    volumes:\n`;
        service.volumes.split(',').forEach((volume: string) => {
          composeContent += `      - ${volume.trim()}\n`;
        });
      }
      
      composeContent += `    restart: unless-stopped\n\n`;
    });
    
    setCompose(composeContent);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCompose(`version: '3.8'
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    restart: unless-stopped`);
    setServices([{ name: 'web', image: 'nginx:alpine', ports: '8080:80', environment: '', volumes: '' }]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Create New Lab</h2>
        <p className="text-muted-foreground">
          Build your custom Docker environment using our visual form builder or raw Docker Compose
        </p>
      </div>

      <div className="flex justify-center space-x-2">
        <Button
          onClick={() => setUseForm(!useForm)}
          variant={useForm ? "default" : "outline"}
          className="flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>Form Builder</span>
        </Button>
        
        <Button
          onClick={() => setShowPreview(!showPreview)}
          variant={showPreview ? "default" : "outline"}
          className="flex items-center space-x-2"
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>Preview</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lab Information</CardTitle>
              <CardDescription>Basic details about your Docker lab</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Lab Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter lab name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the lab"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration Mode</CardTitle>
              <CardDescription>Choose how you want to configure your services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${useForm ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Visual Form Builder</span>
                  <Badge variant={useForm ? "default" : "outline"}>
                    {useForm ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${!useForm ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Raw Docker Compose</span>
                  <Badge variant={!useForm ? "default" : "outline"}>
                    {!useForm ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {useForm ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Services Configuration</CardTitle>
                  <CardDescription>Configure your Docker services using the visual form</CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={addService}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {services.map((service, index) => (
                <Card key={index} className="bg-muted/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Service {index + 1}</CardTitle>
                      {services.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeService(index)}
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Service Name
                        </label>
                        <Input
                          value={service.name}
                          onChange={(e) => updateService(index, 'name', e.target.value)}
                          placeholder="web, db, cache..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Docker Image
                        </label>
                        <Input
                          value={service.image}
                          onChange={(e) => updateService(index, 'image', e.target.value)}
                          placeholder="nginx:alpine, mysql:8.0..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Ports (comma-separated)
                        </label>
                        <Input
                          value={service.ports}
                          onChange={(e) => updateService(index, 'ports', e.target.value)}
                          placeholder="8080:80, 3306:3306"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Volumes (comma-separated)
                        </label>
                        <Input
                          value={service.volumes}
                          onChange={(e) => updateService(index, 'volumes', e.target.value)}
                          placeholder="./data:/var/lib/mysql"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Environment Variables (one per line: KEY=value)
                      </label>
                      <Textarea
                        value={service.environment}
                        onChange={(e) => updateService(index, 'environment', e.target.value)}
                        rows={3}
                        placeholder="MYSQL_ROOT_PASSWORD=secret&#10;MYSQL_DATABASE=mydb"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="w-5 h-5" />
                <span>Docker Compose Configuration</span>
              </CardTitle>
              <CardDescription>
                Write your Docker Compose configuration directly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={compose}
                onChange={(e) => setCompose(e.target.value)}
                className="font-mono text-sm min-h-[400px]"
                placeholder="version: '3.8'&#10;services:&#10;  web:&#10;    image: nginx:alpine&#10;    ports:&#10;      - '8080:80'"
                required
              />
            </CardContent>
          </Card>
        )}

        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compose Preview</CardTitle>
              <CardDescription>Preview of your Docker Compose configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <pre className="text-sm text-foreground overflow-x-auto whitespace-pre-wrap">
                    {compose}
                  </pre>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            onClick={resetForm}
            variant="outline"
          >
            Reset
          </Button>
          
          <Button
            type="submit"
            disabled={loading || !name.trim() || !description.trim() || !compose.trim()}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Creating...' : 'Create Lab'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateLab;