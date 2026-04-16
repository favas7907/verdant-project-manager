import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { 
  Calendar as CalendarIcon, 
  Paperclip, 
  MessageSquare, 
  Trash2, 
  Send,
  Clock,
  User as UserIcon,
  Download,
  FileText,
  X
} from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { db, storage } from "../lib/firebase";
import { 
  doc, 
  setDoc, 
  addDoc, 
  collection, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  arrayUnion,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "../context/AuthContext";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

const TaskDialog = ({ 
  isOpen, 
  onClose, 
  project, 
  task, 
  onTaskCreated, 
  onTaskUpdated,
  onTaskDeleted
}) => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Todo",
    priority: "Medium",
    assignedToId: "",
    dueDate: null,
  });
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [projectMembers, setProjectMembers] = useState([]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        assignedToId: task.assignedToId || "",
        dueDate: task.dueDate ? (task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate)) : null,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "Todo",
        priority: "Medium",
        assignedToId: "",
        dueDate: null,
      });
    }
  }, [task, isOpen]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (project?.memberIds?.length > 0) {
        try {
          const q = query(collection(db, "users"), where("__name__", "in", project.memberIds));
          const snap = await getDocs(q);
          const members = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setProjectMembers(members);
        } catch (error) {
          console.error("Error fetching members:", error);
        }
      }
    };
    if (isOpen && project) {
      fetchMembers();
    }
  }, [isOpen, project]);

  const canEdit = () => {
    if (!currentUser || !project) return false;
    const member = project.members?.find((m: any) => m.userId === currentUser.uid);
    const role = member?.role;
    if (role === "Admin" || role === "Manager") return true;
    if (task && task.assignedToId === currentUser.uid) return true;
    if (!task) return true;
    return false;
  };

  const canDelete = () => {
    if (!currentUser || !project) return false;
    const member = project.members?.find((m: any) => m.userId === currentUser.uid);
    const role = member?.role;
    if (role === "Admin" || role === "Manager") return true;
    return false;
  };

  const isReadOnly = task && !canEdit();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setLoading(true);
    try {
      const data = {
        ...formData,
        updatedAt: serverTimestamp(),
      };

      if (task) {
        const taskRef = doc(db, "tasks", task.id);
        await updateDoc(taskRef, data);
        
        // Trigger notification if assignee changed
        if (data.assignedToId && data.assignedToId !== task.assignedToId) {
          await addDoc(collection(db, "notifications"), {
            recipientId: data.assignedToId,
            senderId: currentUser.uid,
            message: `You've been assigned to task: ${data.title}`,
            isRead: false,
            createdAt: serverTimestamp()
          });
        }
        
        onTaskUpdated({ ...task, ...data });
        toast.success("Task updated");
      } else {
        const newTaskData = {
          ...data,
          projectId: project.id,
          creatorId: currentUser.uid,
          createdAt: serverTimestamp(),
          comments: [],
          attachments: []
        };
        const docRef = await addDoc(collection(db, "tasks"), newTaskData);
        
        // Trigger notification if assigned
        if (newTaskData.assignedToId) {
          await addDoc(collection(db, "notifications"), {
            recipientId: newTaskData.assignedToId,
            senderId: currentUser.uid,
            message: `You've been assigned to a new task: ${newTaskData.title}`,
            isRead: false,
            createdAt: serverTimestamp()
          });
        }
        
        onTaskCreated({ id: docRef.id, ...newTaskData });
        toast.success("Task created");
      }
      onClose();
    } catch (error: any) {
      console.error("Task operation failed:", error);
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete()) {
      toast.error("You don't have permission to delete this task");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteDoc(doc(db, "tasks", task.id));
      onTaskDeleted(task.id);
      toast.success("Task deleted");
      onClose();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !task) return;
    try {
      const newComment = {
        text: commentText,
        userId: currentUser.uid,
        userName: currentUser.name,
        createdAt: new Date().toISOString()
      };
      const taskRef = doc(db, "tasks", task.id);
      await updateDoc(taskRef, {
        comments: arrayUnion(newComment)
      });
      onTaskUpdated({ ...task, comments: [...(task.comments || []), newComment] });
      setCommentText("");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !task) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `tasks/${task.id}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      const newAttachment = {
        name: file.name,
        url,
        type: file.type,
        uploadedAt: new Date().toISOString()
      };

      const taskRef = doc(db, "tasks", task.id);
      await updateDoc(taskRef, {
        attachments: arrayUnion(newAttachment)
      });
      onTaskUpdated({ ...task, attachments: [...(task.attachments || []), newAttachment] });
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem]">
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-white">
          {/* Left Side: Form */}
          <div className="flex-1 p-10 overflow-y-auto border-r border-slate-50">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                  {task ? "Edit Task" : "Create Task"}
                </h2>
                <p className="text-slate-500 font-medium mt-1">
                  {task ? "Update the details of this task." : "Define a new task for the project."}
                </p>
              </div>
              {task && (
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">
                  {task.status}
                </Badge>
              )}
            </div>

            <form id="task-form" onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-slate-700 font-bold text-xs uppercase tracking-widest">Task Title</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  disabled={isReadOnly}
                  placeholder="What needs to be done?"
                  className="text-xl font-bold border-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 rounded-2xl h-14 transition-all"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-slate-700 font-bold text-xs uppercase tracking-widest">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  disabled={isReadOnly}
                  placeholder="Add more details about this task..."
                  className="min-h-[150px] resize-none border-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 rounded-2xl font-medium transition-all p-4"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-slate-700 font-bold text-xs uppercase tracking-widest">Status</Label>
                  <Select 
                    disabled={isReadOnly}
                    value={formData.status} 
                    onValueChange={(v) => setFormData({...formData, status: v})}
                  >
                    <SelectTrigger className="border-none bg-slate-50 h-12 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl">
                      <SelectItem value="Todo">To Do</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-slate-700 font-bold text-xs uppercase tracking-widest">Priority</Label>
                  <Select 
                    disabled={isReadOnly}
                    value={formData.priority} 
                    onValueChange={(v) => setFormData({...formData, priority: v})}
                  >
                    <SelectTrigger className="border-none bg-slate-50 h-12 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl">
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-slate-700 font-bold text-xs uppercase tracking-widest">Assigned To</Label>
                  <Select 
                    disabled={isReadOnly}
                    value={formData.assignedToId} 
                    onValueChange={(v) => setFormData({...formData, assignedToId: v})}
                  >
                    <SelectTrigger className="border-none bg-slate-50 h-12 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500/20">
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl">
                      {projectMembers.map((member: any) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="text-[8px] font-bold">{member.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-bold">{member.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-slate-700 font-bold text-xs uppercase tracking-widest">Due Date</Label>
                  <Popover>
                    <PopoverTrigger render={
                      <Button
                        disabled={isReadOnly}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-left font-bold border-none bg-slate-50 h-12 rounded-xl hover:bg-slate-100 transition-all",
                          !formData.dueDate && "text-slate-400"
                        )}
                      />
                    }>
                      <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                      {formData.dueDate ? format(formData.dueDate, "PPP") : <span>Pick a date</span>}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-2xl overflow-hidden">
                      <Calendar
                        mode="single"
                        selected={formData.dueDate}
                        onSelect={(date) => setFormData({...formData, dueDate: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Attachments Section */}
              {task && (
                <div className="space-y-4 pt-6 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-700 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-slate-400" />
                      Attachments
                    </Label>
                    <div className="relative">
                      <input 
                        type="file" 
                        id="file-upload" 
                        className="hidden" 
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                      <Label 
                        htmlFor="file-upload" 
                        className={`text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg transition-all ${uploading || isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {uploading ? "Uploading..." : "Add File"}
                      </Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {task.attachments?.map((file: any, i: number) => (
                      <a 
                        key={i} 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-3 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                      >
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate tracking-tight">{file.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{file.type?.split('/')[1] || "file"}</p>
                        </div>
                        <Download className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors mr-1" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Side: Comments & Activity (Only for existing tasks) */}
          {task && (
            <div className="w-full md:w-[380px] bg-slate-50/30 flex flex-col overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center gap-3 font-bold text-slate-900 bg-white/50 backdrop-blur-sm">
                <MessageSquare className="w-5 h-5 text-slate-400" />
                <span className="tracking-tight">Comments</span>
                <Badge variant="secondary" className="ml-auto bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                  {task.comments?.length || 0}
                </Badge>
              </div>
              <ScrollArea className="flex-1 p-8">
                <div className="space-y-6">
                  {task.comments?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                      <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest">No comments yet</p>
                    </div>
                  ) : (
                    task.comments?.map((comment: any, i: number) => (
                      <div key={i} className="flex gap-4 group">
                        <Avatar className="w-9 h-9 border-2 border-white shadow-md ring-1 ring-slate-100">
                          <AvatarFallback className="text-[10px] font-bold bg-emerald-50 text-emerald-600">
                            {comment.userName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 group-hover:shadow-md transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-900 tracking-tight">{comment.userName}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{format(new Date(comment.createdAt), "MMM d, HH:mm")}</span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              <div className="p-8 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
                <div className="relative group">
                  <Textarea 
                    placeholder="Write a comment..." 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[100px] pr-12 resize-none text-sm border-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 rounded-2xl font-medium transition-all p-4 shadow-inner"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="absolute bottom-3 right-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
          {task && canDelete() ? (
            <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-xs uppercase tracking-widest rounded-xl px-6" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Task
            </Button>
          ) : <div />}
          <div className="flex gap-4">
            <Button variant="ghost" onClick={onClose} className="font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 rounded-xl px-6">
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isReadOnly && (
              <Button 
                type="submit" 
                form="task-form" 
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest px-8 h-12 rounded-xl shadow-lg shadow-slate-200 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:-translate-y-0.5"
                disabled={loading}
              >
                {loading ? "Saving..." : task ? "Save Changes" : "Create Task"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
