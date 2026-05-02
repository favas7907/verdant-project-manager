import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import KanbanColumn from "../components/KanbanColumn";
import TaskCard from "../components/TaskCard";
import { db } from "../lib/firebase";
import { doc, getDoc, getDocs, collection, query, where, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "../components/ui/button";
import { Plus, Users, Settings } from "lucide-react";
import { Badge } from "../components/ui/badge";
import TaskDialog from "../components/TaskDialog";
import MemberManagementDialog from "../components/MemberManagementDialog";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useAuth } from "../context/AuthContext";
import { useHeader } from "../context/HeaderContext";
import { toast } from "sonner";

import { Skeleton } from "../components/ui/skeleton";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ProjectBoard = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { setTitle, setActions } = useHeader();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [dialogDefaultStatus, setDialogDefaultStatus] = useState("Todo");
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);

  useEffect(() => {
    if (project) {
      setTitle(project.name);
      setActions(
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex -space-x-3">
            {projectMembers.slice(0, 5).map((member) => (
              <Avatar key={member.id} className="w-9 h-9 border-2 border-white shadow-sm ring-1 ring-slate-100">
                <AvatarImage src={member.avatar} />
                <AvatarFallback className="bg-emerald-50 text-emerald-600 font-black text-[10px]">
                  {member.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
            {projectMembers.length > 5 && (
              <div className="w-9 h-9 rounded-full border-2 border-white bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black shadow-sm ring-1 ring-slate-100">
                +{projectMembers.length - 5}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsMemberDialogOpen(true)}
              className="h-11 rounded-xl border-slate-200 bg-white font-bold shadow-sm hover:shadow-md transition-all"
            >
              <Users className="w-4 h-4 mr-2 text-slate-400" />
              Team
            </Button>
            <Button 
              onClick={() => {
                setSelectedTask(null);
                setDialogDefaultStatus("Todo");
                setIsTaskDialogOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 h-11 rounded-xl shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      );
    } else {
      setTitle("Project Board");
    }

    return () => {
      setTitle("");
      setActions(null);
    };
  }, [project, projectMembers, setTitle, setActions]);

  const getProjectRole = () => {
    if (!user || !project) return null;
    const member = project.members?.find((m: any) => m.userId === user.uid);
    return member?.role || null;
  };

  const canEditTask = (task: any) => {
    if (!user || !project) return false;
    const role = getProjectRole();
    if (role === "Admin" || role === "Manager") return true;
    if (task.assignedToId === user.uid) return true;
    return false;
  };

  const canManageMembers = () => {
    const role = getProjectRole();
    return role === "Admin";
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        const projectDoc = await getDoc(doc(db, "projects", id));
        if (projectDoc.exists()) {
          const projectData = { id: projectDoc.id, ...projectDoc.data() } as any;
          setProject(projectData);
          
          if (projectData.memberIds?.length > 0) {
            const q = query(collection(db, "users"), where("__name__", "in", projectData.memberIds));
            const snap = await getDocs(q);
            setProjectMembers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
          }
        } else {
          setError("Project not found.");
        }
      } catch (err: any) {
        console.error("Error fetching project:", err);
        if (err.code === 'permission-denied') {
          setError("You don't have permission to access this project board.");
        } else {
          setError("Failed to load project details.");
        }
      }
    };

    fetchProject();

    const q = query(collection(db, "tasks"), where("projectId", "==", id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData);
      setLoading(false);
    }, (err: any) => {
      console.error("Error fetching tasks:", err);
      if (err.code === 'permission-denied') {
        setError("You don't have permission to view tasks on this board.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const onDragStart = (event: any) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    
    if (task && !canEditTask(task)) {
      toast.error("You don't have permission to move this task");
      return;
    }
    
    setActiveTask(task);
  };

  const onDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";
    const isOverAColumn = over.data.current?.type === "Column";

    if (!isActiveATask) return;

    // Dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((prevTasks) => {
        const activeIndex = prevTasks.findIndex((t) => t.id === activeId);
        const overIndex = prevTasks.findIndex((t) => t.id === overId);

        if (prevTasks[activeIndex].status !== prevTasks[overIndex].status) {
          const newTasks = [...prevTasks];
          newTasks[activeIndex] = { ...newTasks[activeIndex], status: prevTasks[overIndex].status };
          return arrayMove(newTasks, activeIndex, overIndex);
        }

        return arrayMove(prevTasks, activeIndex, overIndex);
      });
    }

    // Dropping a Task over a Column
    if (isActiveATask && isOverAColumn) {
      setTasks((prevTasks) => {
        const activeIndex = prevTasks.findIndex((t) => t.id === activeId);
        if (prevTasks[activeIndex].status !== overId) {
          const newTasks = [...prevTasks];
          newTasks[activeIndex] = { ...newTasks[activeIndex], status: overId as any };
          return arrayMove(newTasks, activeIndex, activeIndex);
        }
        return prevTasks;
      });
    }
  };

  const onDragEnd = async (event: any) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;
    
    const activeTask = tasks.find(t => t.id === activeId);
    
    if (activeTask) {
      try {
        const taskRef = doc(db, "tasks", activeId);
        // We only update if the status actually changed or position in list (though we don't store order yet)
        await updateDoc(taskRef, { 
          status: activeTask.status,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        console.error("Failed to update task status:", error);
        toast.error("Failed to sync task status with server");
        // Re-fetch tasks to sync state back
        window.location.reload();
      }
    }

    setActiveTask(null);
  };

  const columns = [
    { id: "Todo", title: "To Do" },
    { id: "In Progress", title: "Ongoing" },
    { id: "Done", title: "Completed" }
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-8 max-w-7xl mx-auto h-full flex flex-col">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-lg" />
            <Skeleton className="h-4 w-96 rounded-lg" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-11 w-32 rounded-xl" />
            <Skeleton className="h-11 w-32 rounded-xl" />
          </div>
        </div>
        <div className="flex-1 flex gap-6 mt-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 bg-slate-100/50 rounded-3xl p-4 space-y-4">
              <Skeleton className="h-8 w-32 rounded-lg" />
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
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
        <h2 className="text-2xl font-black text-slate-900 mb-2">Board Error</h2>
        <p className="text-slate-500 text-center max-w-md mb-8">
          {error}
        </p>
        <div className="flex gap-4">
          <Link to="/projects">
            <Button variant="outline" className="h-12 px-8 rounded-xl font-bold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-12 rounded-xl shadow-lg shadow-slate-200 transition-all"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col gap-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-4 flex items-center gap-3">
        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">
          {project?.status || "Active"}
        </Badge>
        <p className="text-slate-500 font-medium">{project?.description}</p>
      </div>

      <div className="flex-1 overflow-x-auto min-h-0 -mx-8 px-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div className="flex gap-8 h-full min-w-max pb-8">
            {columns.map((col) => (
              <KanbanColumn 
                key={col.id} 
                column={col} 
                tasks={tasks.filter(t => t.status === col.id).map(t => ({
                  ...t,
                  assignedTo: projectMembers.find(m => m.id === t.assignedToId)
                }))}
                onTaskClick={(task) => {
                  setSelectedTask(task);
                  setIsTaskDialogOpen(true);
                }}
                onAddTask={() => {
                  setSelectedTask(null);
                  setDialogDefaultStatus(col.id);
                  setIsTaskDialogOpen(true);
                }}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: "0.5",
                },
              },
            }),
          }}>
            {activeTask ? (
              <TaskCard task={{
                ...activeTask,
                assignedTo: projectMembers.find(m => m.id === activeTask.assignedToId)
              }} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <TaskDialog 
        isOpen={isTaskDialogOpen} 
        onClose={() => setIsTaskDialogOpen(false)} 
        project={project}
        task={selectedTask}
        defaultStatus={dialogDefaultStatus}
        onTaskCreated={(newTask) => setTasks([...tasks, newTask])}
        onTaskUpdated={(updatedTask) => setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))}
        onTaskDeleted={(taskId) => setTasks(tasks.filter(t => t.id !== taskId))}
      />

      <MemberManagementDialog 
        isOpen={isMemberDialogOpen}
        onClose={() => setIsMemberDialogOpen(false)}
        project={project}
        onUpdate={() => {
          // Re-fetch project to get updated member list
          const fetchProject = async () => {
            const projectDoc = await getDoc(doc(db, "projects", id!));
            if (projectDoc.exists()) {
              setProject({ id: projectDoc.id, ...projectDoc.data() });
            }
          };
          fetchProject();
        }}
      />
    </div>
  );
};

export default ProjectBoard;
