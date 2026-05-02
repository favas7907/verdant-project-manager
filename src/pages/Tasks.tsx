import React, { useEffect, useState } from "react";
import { CheckSquare, Filter, Plus, Search, Clock, AlertCircle, CheckCircle2, MoreVertical, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { useHeader } from "../context/HeaderContext";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import TaskDialog from "../components/TaskDialog";

const Tasks = () => {
  const { user } = useAuth();
  const { setTitle, setActions } = useHeader();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  useEffect(() => {
    setTitle("Personal Workspace");
    setActions(
      <div className="flex gap-3">
        <Button variant="outline" className="h-11 rounded-xl border-slate-200 bg-white font-bold shadow-sm hover:shadow-md transition-all">
          <Filter className="w-4 h-4 mr-2 text-slate-400" />
          Filter
        </Button>
      </div>
    );

    return () => {
      setTitle("");
      setActions(null);
    };
  }, [setTitle, setActions]);

  const fetchTasks = async () => {
    if (!user?.uid) return;
    try {
      const q = query(
        collection(db, "tasks"),
        where("assignedToId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const tasksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user?.uid]);

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "Done": return "Completed";
      case "In Progress": return "Ongoing";
      case "Todo": return "To Do";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "In Progress": return "bg-blue-50 text-blue-600 border-blue-100";
      case "Todo": return "bg-slate-50 text-slate-600 border-slate-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-500 bg-red-50 border-red-100";
      case "Medium": return "text-amber-500 bg-amber-50 border-amber-100";
      case "Low": return "text-emerald-500 bg-emerald-50 border-emerald-100";
      default: return "text-slate-500 bg-slate-50 border-slate-100";
    }
  };

  const handleOpenTask = (task: any) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10">
        <p className="text-slate-500 font-medium">A focused view of your individual contributions and upcoming milestones.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden ring-1 ring-black/5">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30">
          <div className="relative group max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 bg-white border-slate-200 rounded-xl font-medium focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {filteredTasks.map((task) => (
              <div 
                key={task.id} 
                onClick={() => handleOpenTask(task)}
                className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300",
                    task.status === "Done" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                  )}>
                    {task.status === "Done" ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{task.title}</h3>
                    <div className="flex items-center gap-4 mt-1.5">
                      <Badge className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border", getPriorityColor(task.priority))}>
                        {task.priority}
                      </Badge>
                      <div className="flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        <CalendarIcon className="w-3 h-3 mr-1.5" />
                        Due {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No date"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <Badge className={cn("font-bold px-4 py-1.5 rounded-xl border", getStatusColor(task.status))}>
                    {getStatusDisplay(task.status)}
                  </Badge>
                  <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-md transition-all">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-slate-300">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
              <CheckSquare className="w-10 h-10 opacity-20" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-1">No tasks found</h3>
            <p className="text-sm text-slate-400 font-medium">You're all caught up! Enjoy your day.</p>
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskDialog
          task={selectedTask}
          isOpen={isTaskDialogOpen}
          onClose={() => {
            setIsTaskDialogOpen(false);
            setSelectedTask(null);
          }}
          project={{ id: selectedTask.projectId }}
          onTaskCreated={() => fetchTasks()}
          onTaskUpdated={() => fetchTasks()}
          onTaskDeleted={() => fetchTasks()}
        />
      )}
    </div>
  );
};

export default Tasks;
