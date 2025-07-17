import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Globe,
  Database,
  Zap,
  Activity,
  Download,
  Code,
  Search,
  Filter,
  SortAsc,
  Grid,
  List as ListIcon,
  Star,
  Clock,
  Users,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchLabTemplates } from "@/services/labService";
import { LabTemplate } from "@/types";

interface LabTemplatesProps {
  onInstallLab: (template: LabTemplate) => void;
  loading: boolean;
}

const LabTemplates: React.FC<LabTemplatesProps> = ({
  onInstallLab,
  loading,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [labTemplates, setLabTemplates] = useState<any[]>([]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Globe":
        return Globe;
      case "Database":
        return Database;
      case "Zap":
        return Zap;
      case "Activity":
        return Activity;
      default:
        return Code;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Web Servers":
        return "default";
      case "Databases":
        return "secondary";
      case "Caching":
        return "outline";
      case "Monitoring":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleInstall = (template: LabTemplate) => {
    navigate(`/build/${template.name}`);
  };

  const categories = [
    ...new Set(labTemplates.map((template) => template.category)),
  ];

  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = labTemplates;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          template.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (template) => template.category === selectedCategory
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, sortBy, labTemplates]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templates = await fetchLabTemplates();
        setLabTemplates(templates);
      } catch (error) {
        console.error("Failed to fetch lab templates:", error);
      }
    };
    fetchTemplates();
  }, []);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search labs by name, description, or category..."
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SortAsc className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="category">Sort by Category</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "grid" | "list")}
            >
              <TabsList>
                <TabsTrigger value="grid">
                  <Grid className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="list">
                  <ListIcon className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredAndSortedTemplates.length} of{" "}
              {labTemplates.length} labs
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {categories.length} Categories
              </Badge>
              <Badge variant="outline" className="text-xs">
                Production Ready
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Templates Grid/List */}
      {filteredAndSortedTemplates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Labs Found
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters to find the labs you're
              looking for.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredAndSortedTemplates.map((template) => {
            const Icon = getIcon(template.icon);

            return viewMode === "grid" ? (
              <Card
                key={template.name}
                className="group hover:border-primary/50 transition-all duration-200 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {template.name}
                        </CardTitle>
                        <Badge
                          variant={getCategoryColor(template.category)}
                          className="mt-1"
                        >
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

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>4.8</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>1.2k</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>~2 min</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Ready
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Installation Status</span>
                      <Badge variant="outline" className="text-xs">
                        Ready to Install
                      </Badge>
                    </div>

                    <Button
                      onClick={() => handleInstall(template)}
                      disabled={loading}
                      className="w-full group-hover:bg-primary/90 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Install Lab
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card
                key={template.id}
                className="hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {template.name}
                          </h3>
                          <Badge variant={getCategoryColor(template.category)}>
                            {template.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {template.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3" />
                            <span>4.8 rating</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>1.2k installs</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>~2 min setup</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleInstall(template)}
                      disabled={loading}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Install
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LabTemplates;
