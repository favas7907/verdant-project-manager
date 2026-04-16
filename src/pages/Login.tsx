import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { 
  Leaf, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user && !authLoading) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back to your workspace!");
      navigate("/");
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error(error.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Side: Brand & Visuals */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-16">
        <div className="absolute top-0 left-0 w-full h-full opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
            <Leaf className="text-white w-7 h-7" />
          </div>
          <span className="text-2xl font-black text-white tracking-tighter uppercase italic">Verdant</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight mb-8">
            Manage projects <br />
            <span className="text-emerald-400">with precision.</span>
          </h1>
          <div className="space-y-6">
            {[
              "Real-time team collaboration",
              "Advanced Kanban board workflows",
              "Automated project insights & analytics"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 text-slate-300">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="font-semibold">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-slate-500 text-sm font-medium">
            © 2026 Verdant Technologies. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 bg-slate-50/30">
        <div className="w-full max-w-md space-y-10">
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 font-medium text-lg">"Success is the sum of small efforts, repeated day-in and day-out. Let's get back to work."</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 h-14 border-slate-100 bg-white rounded-2xl font-semibold shadow-sm focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-xs font-black text-slate-500 uppercase tracking-widest">Password</Label>
                <a href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Forgot password?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-12 pr-12 h-14 border-slate-100 bg-white rounded-2xl font-semibold shadow-sm focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black text-lg rounded-2xl shadow-2xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          <div className="pt-4 text-center">
            <p className="text-slate-500 font-medium">
              New to Verdant?{" "}
              <Link to="/signup" className="text-emerald-600 font-black hover:text-emerald-700 transition-colors">
                Create your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
