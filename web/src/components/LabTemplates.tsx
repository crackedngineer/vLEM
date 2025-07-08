import React from 'react';
import { labTemplates } from '../data/templates';
import { 
  Globe, 
  Database, 
  Zap, 
  Activity,
  Download,
  Code
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface LabTemplatesProps {
  onUseTemplate: (template: any) => void;
}

const LabTemplates: React.FC<LabTemplatesProps> = ({ onUseTemplate }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Globe': return Globe;
      case 'Database': return Database;
      case 'Zap': return Zap;
      case 'Activity': return Activity;
      default: return Code;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Web Servers': return 'default';
      case 'Databases': return 'secondary';
      case 'Caching': return 'outline';
      case 'Monitoring': return 'destructive';
      default: return 'outline';
    }
  };

  const categories = [...new Set(labTemplates.map(template => template.category))];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Lab Templates</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose from our curated collection of pre-configured Docker environments. 
          Each template is production-ready and follows best practices.
        </p>
      </div>

      {categories.map(category => (
        <div key={category} className="space-y-6">
          <div className="flex items-center space-x-2">
            <div className="h-px bg-border flex-1" />
            <h3 className="text-xl font-semibold text-foreground px-4">
              {category}
            </h3>
            <div className="h-px bg-border flex-1" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labTemplates
              .filter(template => template.category === category)
              .map(template => {
                const Icon = getIcon(template.icon);
                return (
                  <Card key={template.id} className="group hover:border-primary/50 transition-all duration-200 hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <Badge variant={getCategoryColor(template.category)} className="mt-1">
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm leading-relaxed">
                        {template.description}
                      </CardDescription>
                      
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <p className="text-xs text-muted-foreground mb-2 font-medium">Docker Compose Preview:</p>
                          <pre className="text-xs text-foreground/80 overflow-hidden">
                            {template.compose.split('\n').slice(0, 4).join('\n')}
                            {template.compose.split('\n').length > 4 && '\n...'}
                          </pre>
                        </CardContent>
                      </Card>
                      
                      <Button
                        onClick={() => onUseTemplate(template)}
                        className="w-full group-hover:bg-primary/90 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LabTemplates;