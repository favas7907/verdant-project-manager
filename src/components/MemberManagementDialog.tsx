import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { 
  Users, 
  UserPlus, 
  X, 
  Shield, 
  ShieldCheck, 
  User,
  Trash2,
  Mail,
  Loader2
} from "lucide-react";
import { db } from "../lib/firebase";
import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  query, 
  collection, 
  where, 
  getDocs 
} from "firebase/firestore";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

interface MemberManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onUpdate: () => void;
}

const MemberManagementDialog = ({ isOpen, onClose, project, onUpdate }: MemberManagementDialogProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [fetchingMembers, setFetchingMembers] = useState(false);

  React.useEffect(() => {
    if (isOpen && project?.memberIds?.length > 0) {
      fetchMembers();
    }
  }, [isOpen, project]);

  const fetchMembers = async () => {
    setFetchingMembers(true);
    try {
      const q = query(collection(db, "users"), where("__name__", "in", project.memberIds));
      const snap = await getDocs(q);
      const membersData = snap.docs.map(doc => {
        const userData = doc.data();
        const projectMember = project.members.find((m: any) => m.userId === doc.id);
        return {
          id: doc.id,
          ...userData,
          projectRole: projectMember?.role || "Member"
        };
      });
      setMembers(membersData);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setFetchingMembers(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      // Find user by email
      const q = query(collection(db, "users"), where("email", "==", email.toLowerCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        toast.error("User not found. They must have an account first.");
        setLoading(false);
        return;
      }

      const newUser = snap.docs[0];
      const userId = newUser.id;

      if (project.memberIds.includes(userId)) {
        toast.error("User is already a member of this project.");
        setLoading(false);
        return;
      }

      const projectRef = doc(db, "projects", project.id);
      await updateDoc(projectRef, {
        memberIds: arrayUnion(userId),
        members: arrayUnion({
          userId,
          role
        })
      });

      toast.success("Member added successfully");
      setEmail("");
      onUpdate();
      fetchMembers();
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (userId === project.createdBy) {
      toast.error("Cannot remove the project creator.");
      return;
    }

    try {
      const projectRef = doc(db, "projects", project.id);
      const memberToRemove = project.members.find((m: any) => m.userId === userId);
      
      await updateDoc(projectRef, {
        memberIds: arrayRemove(userId),
        members: arrayRemove(memberToRemove)
      });

      toast.success("Member removed");
      onUpdate();
      fetchMembers();
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const projectRef = doc(db, "projects", project.id);
      const updatedMembers = project.members.map((m: any) => 
        m.userId === userId ? { ...m, role: newRole } : m
      );
      
      await updateDoc(projectRef, {
        members: updatedMembers
      });

      toast.success("Role updated");
      onUpdate();
      fetchMembers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Admin": return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case "Manager": return <Shield className="w-4 h-4 text-blue-600" />;
      default: return <User className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] border-none shadow-2xl rounded-[2rem] p-0 overflow-hidden bg-white">
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight">Project Members</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 font-medium">
            Manage who has access to this project and their permissions.
          </DialogDescription>
        </div>

        <div className="p-8 space-y-8">
          {/* Add Member Form */}
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="email" className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Member Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="colleague@company.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 rounded-xl font-semibold transition-all"
                  />
                </div>
              </div>
              <div className="w-32 space-y-2">
                <Label htmlFor="role" className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-12 border-slate-100 bg-slate-50 focus:bg-white rounded-xl font-semibold transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]"
              disabled={loading || !email}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5 mr-2" />}
              Invite to Project
            </Button>
          </form>

          {/* Member List */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Current Members ({members.length})</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {fetchingMembers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
                </div>
              ) : members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 font-black text-xs">
                        {member.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{member.name}</p>
                      <p className="text-[10px] font-medium text-slate-400">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {member.id === project.createdBy ? (
                      <Badge className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-tighter px-2 py-0.5 rounded-lg">
                        Creator
                      </Badge>
                    ) : (
                      <Select 
                        value={member.projectRole} 
                        onValueChange={(val) => handleUpdateRole(member.id, val)}
                      >
                        <SelectTrigger className="h-8 w-28 border-none bg-white shadow-sm rounded-lg text-[10px] font-black uppercase tracking-tighter">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    
                    {member.id !== project.createdBy && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveMember(member.id)}
                        className="h-8 w-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 bg-slate-50/50 border-t border-slate-100">
          <Button onClick={onClose} className="w-full h-12 bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 font-black rounded-xl transition-all">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemberManagementDialog;
