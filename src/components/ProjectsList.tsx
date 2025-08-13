import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, AlertTriangle, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface ProjectsListProps {
  refresh?: boolean;
  onRefreshComplete?: () => void;
}

const ProjectsList = ({ refresh, onRefreshComplete }: ProjectsListProps) => {
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

  useEffect(() => {
    if (refresh) {
      fetchProjects().then(() => {
        onRefreshComplete?.();
      });
    }
  }, [refresh, onRefreshComplete]);

  const toggleComplete = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_completed: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setProjects(projects.map(p => 
        p.id === id ? { ...p, is_completed: !currentStatus } : p
      ));

      toast({
        title: "Success",
        description: `Project marked as ${!currentStatus ? 'completed' : 'pending'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== id));

      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

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
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </CardContent>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No projects found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Projects ({projects.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`font-semibold ${project.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {project.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {getPriorityIcon(project.priority)}
                  {project.is_completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={getPriorityColor(project.priority)}>
                  {project.priority}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {monthNames[project.target_month - 1]} {project.target_year}
                </Badge>
                {project.is_completed && (
                  <Badge variant="outline">Completed</Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant={project.is_completed ? "outline" : "default"}
                  size="sm"
                  onClick={() => toggleComplete(project.id, project.is_completed)}
                >
                  {project.is_completed ? "Mark Pending" : "Mark Complete"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteProject(project.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectsList;