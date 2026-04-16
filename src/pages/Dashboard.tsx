import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Users,
  Briefcase,
  Calendar,
  ArrowRight
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { useAuth } from "../context/AuthContext";
import { useHeader } from "../context/HeaderContext";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { format, subDays, isSameDay } from "date-fns";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

const Dashboard = () => {
  const { user } = useAuth();
  const { setTitle, setActions } = useHeader();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    setTitle(`${getGreeting()}, ${user?.name?.split(' ')[0]}`);
    setActions(
      <div className="flex gap-3">
        <Button variant="outline" className="border-slate-200 bg-white h-11 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
          <Calendar className="w-4 h-4 mr-2 text-slate-400" />
          {format(new Date(), "MMMM d, yyyy")}
        </Button>
        <Button 
          onClick={() => toast.info("Generating workspace reports...")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 h-11 rounded-xl shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          View Reports
        </Button>
      </div>
    );

    return () => {
      setTitle("");
      setActions(null);
    };
  }, [user, setTitle, setActions]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.uid) return;
      setLoading(true);
      setError(null);
      
      try {
        // Fetch Projects
        const projectsQuery = query(
          collection(db, "projects"), 
          where("memberIds", "array-contains", user.uid),
          orderBy("createdAt", "desc")
        );
        const projectsSnap = await getDocs(projectsQuery);
        const projects = projectsSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));

        // Fetch Tasks
        // We fetch tasks only for the projects the user has access to
        const projectIds = projects.map((p: any) => p.id);
        let tasks: any[] = [];
        
        if (projectIds.length > 0) {
          // Firestore 'in' query is limited to 10 items
          // If the user has many projects, we fetch in batches
          const batches = [];
          for (let i = 0; i < projectIds.length; i += 10) {
            batches.push(projectIds.slice(i, i + 10));
          }
          
          const taskPromises = batches.map(batch => {
            const q = query(collection(db, "tasks"), where("projectId", "in", batch));
            return getDocs(q);
          });
          
          const taskSnaps = await Promise.all(taskPromises);
          tasks = taskSnaps.flatMap(snap => snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })));
        }

        // Calculate Stats
        const totalProjects = projects.length;
        const completedProjects = projects.filter((p: any) => p.status === "Completed").length;
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t: any) => t.status === "Done").length;
        const ongoingWork = tasks.filter((t: any) => t.status === "In Progress").length;
        const todoTasks = tasks.filter((t: any) => t.status === "Todo").length;

        // Task Distribution for Pie Chart
        const taskDistribution = [
          { name: "Completed", value: completedTasks },
          { name: "Ongoing", value: ongoingWork },
          { name: "To Do", value: todoTasks },
        ].filter(d => d.value > 0);

        // If no tasks, provide a default empty state for the chart
        const finalTaskDistribution = taskDistribution.length > 0 
          ? taskDistribution 
          : [{ name: "No Tasks", value: 1 }];

        // Productivity Data (Tasks completed in last 7 days)
        const productivityData = Array.from({ length: 7 }).map((_, i) => {
          const date = subDays(new Date(), 6 - i);
          const count = tasks.filter((t: any) => 
            t.status === "Done" && 
            t.updatedAt && 
            isSameDay(t.updatedAt.toDate ? t.updatedAt.toDate() : new Date(t.updatedAt), date)
          ).length;
          return {
            date: format(date, "MMM d"),
            completed: count
          };
        });

        // Recent Activity
        const recentProjects = projects.slice(0, 5);

        // Unique Team Members
        const uniqueMemberIds = new Set(projects.flatMap((p: any) => p.memberIds || []));

        setStats({
          totalProjects,
          completedProjects,
          totalTasks,
          completedTasks,
          ongoingWork,
          todoTasks,
          taskDistribution: finalTaskDistribution,
          productivityData,
          recentProjects,
          teamMemberCount: uniqueMemberIds.size
        });
      } catch (err: any) {
        console.error("Failed to fetch dashboard stats", err);
        if (err.code === 'permission-denied') {
          setError("You don't have permission to view this data. Please contact your administrator.");
        } else {
          setError("Something went wrong while loading your dashboard. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.uid]);

  if (loading || !stats) {
    return (
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-lg" />
            <Skeleton className="h-4 w-80 rounded-lg" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-11 w-40 rounded-xl" />
            <Skeleton className="h-11 w-40 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="border-none shadow-sm overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="h-[350px]">
              <Skeleton className="h-full w-full rounded-xl" />
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="h-[350px] flex items-center justify-center">
              <Skeleton className="h-48 w-48 rounded-full" />
            </CardContent>
          </Card>
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
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard Error</h2>
        <p className="text-slate-500 text-center max-w-md mb-8">
          {error}
        </p>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-12 rounded-xl shadow-lg shadow-slate-200 transition-all"
        >
          Retry Loading
        </Button>
      </div>
    );
  }

  const statCards = [
    { 
      title: "Active Workspaces", 
      value: stats?.totalProjects || 0, 
      icon: Briefcase, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50",
      description: `${stats?.completedProjects || 0} completed`
    },
    { 
      title: "In-Flight Tasks", 
      value: (stats?.ongoingWork || 0), 
      icon: Clock, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
      description: "Tasks currently in progress"
    },
    { 
      title: "Resolved Items", 
      value: stats?.completedTasks || 0, 
      icon: CheckCircle2, 
      color: "text-amber-600", 
      bg: "bg-amber-50",
      description: "Successfully finished items"
    },
    { 
      title: "Cumulative Tasks", 
      value: stats?.totalTasks || 0, 
      icon: CheckCircle2, 
      color: "text-purple-600", 
      bg: "bg-purple-50",
      description: "Across all project boards"
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <p className="text-slate-500 font-medium max-w-lg">
          "Precision is the foundation of excellence. Your workspace is optimized for growth today."
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group overflow-hidden bg-white ring-1 ring-black/5">
            <CardContent className="p-6 relative">
              <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-bl-full opacity-20 group-hover:scale-125 transition-transform duration-700`} />
              <div className="flex items-center gap-4 relative">
                <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{stat.title}</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-0.5 tracking-tight">{stat.value}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden bg-white ring-1 ring-black/5">
          <CardHeader className="border-b border-slate-50 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Project Insights</CardTitle>
                <CardDescription className="text-slate-500 font-medium">Visualizing task completion velocity over the last 7 days</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-1 font-bold">
                +12% vs last week
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.productivityData || []}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px'
                  }}
                  itemStyle={{fontWeight: 700, color: '#10b981'}}
                  labelStyle={{fontWeight: 800, color: '#0f172a', marginBottom: '4px'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorCompleted)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Distribution */}
        <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-black/5">
          <CardHeader className="border-b border-slate-50 pb-6">
            <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Task Status</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Current distribution of all tasks</CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[380px] flex flex-col items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.taskDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={100}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {(stats?.taskDistribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-900">{stats?.totalTasks || 0}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Tasks</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full mt-6">
              {(stats?.taskDistribution || []).map((entry: any, index: number) => (
                <div key={entry.name} className="bg-slate-50/50 rounded-2xl p-3 text-center border border-slate-100 transition-all hover:bg-slate-100/50">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{entry.name}</span>
                  </div>
                  <p className="text-lg font-black text-slate-900">{entry.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-black/5">
        <CardHeader className="border-b border-slate-50 pb-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Recent Projects</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Your most recently updated projects</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/projects")}
            className="text-emerald-600 font-bold hover:bg-emerald-50 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            View All Projects
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/30 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="px-8 py-5">Project Details</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Team</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(stats?.recentProjects || []).map((project: any) => (
                  <tr key={project.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-110 transition-transform duration-300">
                          {project.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{project.name}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[250px] mt-0.5">{project.description || "No description provided"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 font-bold px-3 py-1 rounded-lg">
                        {project.status === "In Progress" ? "Ongoing" : project.status}
                      </Badge>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].slice(0, project.memberIds?.length || 0).map((i) => (
                            <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                              ?
                            </div>
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-500 ml-1">{project.memberIds?.length || 0} members</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 font-bold rounded-xl px-4 transition-all"
                      >
                        Open Board
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(stats?.recentProjects || []).length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Briefcase className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-bold">No projects found</p>
              <p className="text-xs">Start by creating your first project board.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
