import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, AlertTriangle, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Project {
  id: string;
  title: string;
  description: string | null;
  target_month: number;
  target_year: number;
  is_completed: boolean;
  priority: string;
  created_at: string;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('target_year', { ascending: true })
        .order('target_month', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Calendar className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  const upcomingProjects = projects.filter(p => !p.is_completed);
  const completedProjects = projects.filter(p => p.is_completed);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Cabin Projects</h1>
          <p className="text-xl text-muted-foreground mb-4">
            Upcoming maintenance and improvement projects
          </p>
          <Link to="/">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>

        {/* Upcoming Projects */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Upcoming Projects ({upcomingProjects.length})
          </h2>
          
          {upcomingProjects.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No upcoming projects scheduled</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      {getPriorityIcon(project.priority)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {monthNames[project.target_month - 1]} {project.target_year}
                      </Badge>
                    </div>
                  </CardHeader>
                  {project.description && (
                    <CardContent>
                      <p className="text-muted-foreground">{project.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Completed Projects */}
        {completedProjects.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Completed Projects ({completedProjects.length})
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedProjects.map((project) => (
                <Card key={project.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-through">{project.title}</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {monthNames[project.target_month - 1]} {project.target_year}
                      </Badge>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                  </CardHeader>
                  {project.description && (
                    <CardContent>
                      <p className="text-muted-foreground">{project.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;