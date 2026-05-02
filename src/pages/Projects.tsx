import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Users, 
  Calendar,
  LayoutGrid,
  List as ListIcon,
  ArrowRight,
  FolderKanban,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "../components/ui/dropdown-menu";
import { cn } from "../lib/utils";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Skeleton } from "../components/ui/skeleton";

import { useAuth } from "../context/AuthContext";
import { useHeader } from "../context/HeaderContext";

const Projects = () => {
  const { user } = useAuth();
  const { setTitle, setActions } = useHeader();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [editProject, setEditProject] = useState({ id: "", name: "", description: "" });
  const [isEditOpen, setIsEditOpen] = useState(false);

  const canCreateProject = !!user?.uid;

  useEffect(() => {
    setTitle("Active Workspaces");
    setActions(
      canCreateProject && (
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 h-11 px-6 rounded-xl font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Project
        </Button>
      )
    );

    return () => {
      setTitle("");
      setActions(null);
    };
  }, [setTitle, setActions, canCreateProject]);

  const fetchProjects = async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, "projects"), 
        where("memberIds", "array-contains", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      }));
      setProjects(projectsData);
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      if (err.code === 'permission-denied') {
        setError("You don't have permission to view projects. Please contact your administrator.");
      } else {
        setError("Failed to load projects. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user?.uid]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    try {
      await addDoc(collection(db, "projects"), {
        ...newProject,
        createdBy: user.uid,
        memberIds: [user.uid],
        members: [
          {
            userId: user.uid,
            role: "Admin"
          }
        ],
        status: "Active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success("Project created successfully");
      setIsCreateOpen(false);
      setNewProject({ name: "", description: "" });
      fetchProjects();
    } catch (err) {
      console.error("Error creating project:", err);
      toast.error("Failed to create project");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid || !editProject.id) return;
    try {
      const projectRef = doc(db, "projects", editProject.id);
      await updateDoc(projectRef, {
        name: editProject.name,
        description: editProject.description,
        updatedAt: serverTimestamp()
      });
      toast.success("Project updated successfully");
      setIsEditOpen(false);
      setEditProject({ id: "", name: "", description: "" });
      fetchProjects();
    } catch (err) {
      console.error("Error updating project:", err);
      toast.error("Failed to update project");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "projects", projectId));
      toast.success("Project deleted successfully");
      fetchProjects();
    } catch (err) {
      console.error("Error deleting project:", err);
      toast.error("Failed to delete project");
    }
  };

  const filteredProjects = projects.filter((p: any) => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded-lg" />
          </div>
          <Skeleton className="h-11 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="border-none shadow-sm overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-6 w-3/4 mt-4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent className="pb-6">
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-slate-50">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] max-w-7xl mx-auto">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mb-6 shadow-sm">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-slate-500 text-center max-w-md mb-8">
          {error}
        </p>
        <Button 
          onClick={() => fetchProjects()}
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-12 rounded-xl shadow-lg shadow-slate-200 transition-all"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <p className="text-slate-500 font-medium">Orchestrate your team's momentum across all active initiatives.</p>
      </div>

      {canCreateProject && (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[450px] border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
              <div className="bg-emerald-600 p-8 text-white">
                <DialogTitle className="text-2xl font-black">Create Project</DialogTitle>
                <p className="text-emerald-100 text-sm mt-1 font-medium opacity-80">Start a new workspace for your team.</p>
              </div>
              <form onSubmit={handleCreate} className="p-8 space-y-6 bg-white">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-bold text-sm uppercase tracking-wider">Project Name</Label>
                  <Input 
                    id="name" 
                    value={newProject.name} 
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    required
                    placeholder="e.g. Website Redesign"
                    className="h-12 border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 rounded-xl font-medium transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-700 font-bold text-sm uppercase tracking-wider">Description</Label>
                  <Textarea 
                    id="description" 
                    value={newProject.description} 
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    placeholder="What is this project about?"
                    className="min-h-[120px] resize-none border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 rounded-xl font-medium transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} className="flex-1 h-12 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Cancel</Button>
                  <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-xl font-bold shadow-lg shadow-emerald-100">Create Project</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}

      {canCreateProject && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[450px] border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
              <div className="bg-emerald-600 p-8 text-white">
                <DialogTitle className="text-2xl font-black">Edit Project</DialogTitle>
                <p className="text-emerald-100 text-sm mt-1 font-medium opacity-80">Update your workspace details.</p>
              </div>
              <form onSubmit={handleEditSubmit} className="p-8 space-y-6 bg-white">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-slate-700 font-bold text-sm uppercase tracking-wider">Project Name</Label>
                  <Input 
                    id="edit-name" 
                    value={editProject.name} 
                    onChange={(e) => setEditProject({...editProject, name: e.target.value})}
                    required
                    placeholder="e.g. Website Redesign"
                    className="h-12 border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 rounded-xl font-medium transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description" className="text-slate-700 font-bold text-sm uppercase tracking-wider">Description</Label>
                  <Textarea 
                    id="edit-description" 
                    value={editProject.description} 
                    onChange={(e) => setEditProject({...editProject, description: e.target.value})}
                    placeholder="What is this project about?"
                    className="min-h-[120px] resize-none border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 rounded-xl font-medium transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="flex-1 h-12 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Cancel</Button>
                  <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-xl font-bold shadow-lg shadow-emerald-100">Save Changes</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white/50 backdrop-blur-md p-2 rounded-3xl border border-slate-200/50 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            placeholder="Search projects..." 
            className="pl-12 h-14 border-none bg-transparent focus:ring-0 rounded-2xl font-medium text-slate-600 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-14 px-6 border-none bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] rounded-2xl text-slate-600 font-bold">
            <Filter className="w-5 h-5 mr-2 text-slate-400" />
            Filter
          </Button>
          <div className="flex bg-white shadow-sm rounded-2xl p-1.5 gap-1 border border-slate-100">
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 shadow-inner">
              <LayoutGrid className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-slate-400 hover:bg-slate-50 transition-all duration-200 hover:scale-[1.05]">
              <ListIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 shadow-inner">
          <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6">
            <FolderKanban className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">No projects found</h3>
          <p className="text-slate-400 mt-2 font-medium">Try a different search or create a new project.</p>
          <Button 
            variant="ghost" 
            className="text-emerald-600 font-black mt-6 hover:bg-emerald-50 rounded-xl px-6"
            onClick={() => setSearch("")}
          >
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project: any) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <Card className="group border-none shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-[2rem] overflow-hidden bg-white ring-1 ring-black/5">
                <CardHeader className="p-8 pb-4">
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-2xl group-hover:bg-emerald-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-sm">
                      {project.name.charAt(0)}
                    </div>
                    <Badge variant="secondary" className={cn(
                      "font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg",
                      project.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      project.status === "Completed" ? "bg-blue-50 text-blue-700 border-blue-100" :
                      "bg-slate-50 text-slate-700 border-slate-100"
                    )}>
                      {project.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900 mt-6 group-hover:text-emerald-600 transition-colors tracking-tight flex items-center justify-between">
                    {project.name}
                    <div onClick={(e) => e.preventDefault()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600" />}>
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl border-none shadow-2xl">
                          <DropdownMenuItem 
                            className="font-bold text-xs uppercase tracking-widest text-slate-600 focus:text-emerald-600 focus:bg-emerald-50 cursor-pointer"
                            onClick={() => {
                              setEditProject({ id: project.id, name: project.name, description: project.description || "" });
                              setIsEditOpen(true);
                            }}
                          >
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="font-bold text-xs uppercase tracking-widest text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[48px] text-slate-500 font-medium leading-relaxed mt-2">
                    {project.description || "No description provided for this project."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="flex items-center gap-6 text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-600">{project.memberIds?.length || 0} Members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-600">
                        {project.createdAt ? format(project.createdAt.toDate ? project.createdAt.toDate() : new Date(project.createdAt), "MMM d, yyyy") : "N/A"}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 px-8 flex items-center justify-between border-t border-slate-50 bg-slate-50/30">
                  <div className="flex -space-x-3">
                    {(project.memberIds || []).slice(0, 4).map((mId: string) => (
                      <div key={mId} className="w-9 h-9 rounded-full border-4 border-white bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shadow-sm ring-1 ring-slate-100">
                        ?
                      </div>
                    ))}
                    {(project.memberIds || []).length > 4 && (
                      <div className="w-9 h-9 rounded-full border-4 border-white bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold shadow-sm ring-1 ring-slate-100">
                        +{(project.memberIds || []).length - 4}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-emerald-600 font-bold text-sm group-hover:translate-x-2 transition-transform duration-300">
                    Open Board
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
