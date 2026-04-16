import React, { useState, useEffect } from "react";
import { Users, Search, Plus, Mail, Shield, MoreVertical, UserPlus, Check, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { useHeader } from "../context/HeaderContext";
import { db } from "../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { toast } from "sonner";
import { cn } from "../lib/utils";

const Team = () => {
  const { setTitle, setActions } = useHeader();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    setTitle("Workspace Network");
    setActions(
      <Button 
        onClick={() => setIsInviteOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 h-11 rounded-xl shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Invite Member
      </Button>
    );

    return () => {
      setTitle("");
      setActions(null);
    };
  }, [setTitle, setActions]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("name", "asc"));
        const querySnapshot = await getDocs(q);
        const membersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMembers(membersData);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter(member => 
    member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setIsInviting(true);
    // Simulate invitation
    setTimeout(() => {
      toast.success(`Invitation sent to ${inviteEmail}`);
      setIsInviting(false);
      setIsInviteOpen(false);
      setInviteEmail("");
    }, 1500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10">
        <p className="text-slate-500 font-medium">A comprehensive directory of the minds driving your projects forward.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden ring-1 ring-black/5 mb-8">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30">
          <div className="relative group max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input 
              placeholder="Search members by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 bg-white border-slate-200 rounded-xl font-medium focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 w-full bg-slate-50 rounded-3xl animate-pulse" />
            ))
          ) : filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <Card key={member.id} className="border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group bg-white ring-1 ring-black/5 rounded-3xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <Avatar className="w-16 h-16 border-4 border-white shadow-xl ring-1 ring-slate-100 group-hover:ring-emerald-200 transition-all duration-300">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-emerald-50 text-emerald-600 font-black text-xl">
                        {member.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{member.name}</h3>
                    <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {member.email}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                    <Badge variant="secondary" className="bg-slate-50 text-slate-600 border-slate-100 font-bold px-3 py-1 rounded-lg">
                      {member.role || "Member"}
                    </Badge>
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-32 text-slate-300">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                <Users className="w-10 h-10 opacity-20" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-1">No members found</h3>
              <p className="text-sm text-slate-400 font-medium">Try adjusting your search or invite someone new.</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-3xl shadow-2xl">
          <div className="bg-emerald-600 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-8 -mt-8" />
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">Invite Team Member</DialogTitle>
              <DialogDescription className="text-emerald-50 font-medium mt-2">
                Expand your workspace and collaborate with your team.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6 bg-white">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-bold text-xs uppercase tracking-widest ml-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input 
                  id="email"
                  type="email"
                  placeholder="colleague@company.com" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="pl-11 h-12 bg-slate-50 border-slate-100 rounded-xl font-bold text-slate-900 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-4">
              <Shield className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                Invited members will have access to all public projects in this workspace by default.
              </p>
            </div>
          </div>
          <DialogFooter className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-3">
            <Button variant="ghost" onClick={() => setIsInviteOpen(false)} className="rounded-xl font-bold h-12 px-6">Cancel</Button>
            <Button 
              onClick={handleInvite}
              disabled={isInviting || !inviteEmail}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isInviting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Team;
