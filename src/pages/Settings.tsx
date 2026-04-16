import React, { useState } from "react";
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, Camera, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { useHeader } from "../context/HeaderContext";
import { toast } from "sonner";
import { cn } from "../lib/utils";

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { setTitle, setActions } = useHeader();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  React.useEffect(() => {
    setTitle("Workspace Preferences");
    setActions(
      <Button 
        onClick={handleSave}
        disabled={isSaving}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 h-11 rounded-xl shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    );

    return () => {
      setTitle("");
      setActions(null);
    };
  }, [setTitle, setActions, isSaving, name]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ name });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "profile", icon: User, label: "Profile" },
    { id: "notifications", icon: Bell, label: "Notifications" },
    { id: "security", icon: Shield, label: "Security" },
    { id: "appearance", icon: Palette, label: "Appearance" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10">
        <p className="text-slate-500 font-medium text-lg">Tailor your environment to match your workflow and personal style.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <Button 
              key={tab.id}
              variant="ghost" 
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full justify-start h-12 rounded-xl font-bold text-sm transition-all duration-200",
                activeTab === tab.id 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <tab.icon className={cn("w-4 h-4 mr-3", activeTab === tab.id ? "text-white" : "text-slate-400")} />
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 ring-1 ring-black/5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-8">Profile Information</h2>
            
            <div className="space-y-8">
              <div className="flex items-center gap-8">
                <div className="relative group">
                  <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center border-2 border-white shadow-xl ring-1 ring-slate-100 overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-emerald-600 uppercase">{user?.name?.charAt(0)}</span>
                    )}
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:scale-110 transition-all">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Profile Picture</h3>
                  <p className="text-sm text-slate-500 mt-1">PNG, JPG or GIF. Max size 2MB.</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="rounded-lg h-8 text-[10px] uppercase font-black tracking-widest border-slate-200">Upload New</Button>
                    <Button variant="ghost" size="sm" className="rounded-lg h-8 text-[10px] uppercase font-black tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50">Remove</Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold text-xs uppercase tracking-widest ml-1">Full Name</Label>
                  <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 px-4 bg-slate-50 border-slate-100 rounded-xl font-bold text-slate-900 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold text-xs uppercase tracking-widest ml-1">Email Address</Label>
                  <Input 
                    value={email}
                    disabled
                    className="h-12 px-4 bg-slate-50 border-slate-100 rounded-xl font-bold text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400 ml-1">Email cannot be changed</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex justify-end">
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 ring-1 ring-black/5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-4">Workspace Settings</h2>
            <p className="text-sm text-slate-500 mb-6">Manage your workspace preferences and visibility.</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Public Profile</p>
                    <p className="text-xs text-slate-500">Allow others to see your profile details</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-emerald-600 rounded-full relative cursor-pointer shadow-inner">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
