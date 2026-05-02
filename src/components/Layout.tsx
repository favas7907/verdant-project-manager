import React, { useState, Component, ErrorInfo, ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  FolderKanban, 
  LogOut, 
  Menu,
  Leaf,
  CheckSquare,
  Users,
  Settings,
  Search,
  AlertTriangle,
  RefreshCcw,
  User as UserIcon,
  Home,
  ChevronRight
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import NotificationBell from "./NotificationBell";
import { useHeader } from "../context/HeaderContext";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { cn } from "../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

// Simple Error Wrapper (Placeholder for ErrorBoundary)
const ErrorWrapper = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { title, actions } = useHeader();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: FolderKanban, label: "Projects", path: "/projects" },
    { icon: CheckSquare, label: "My Tasks", path: "/tasks" },
    { icon: Users, label: "Team", path: "/team" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/50 text-slate-600">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
          <Leaf className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">Verdant</span>
      </div>

      <nav className="flex-1 px-6 space-y-2 mt-8">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
                isActive 
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-all duration-300",
                isActive ? "text-emerald-400 scale-110" : "text-slate-400 group-hover:text-slate-600 group-hover:scale-110"
              )} />
              <span className={cn(
                "text-sm font-black tracking-tight transition-colors duration-300",
                isActive ? "text-white" : ""
              )}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-8 mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl px-4 py-4 transition-all duration-300 group"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-black tracking-tight">Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 h-full z-20">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 transition-all duration-300">
          <div className="flex flex-col px-8 py-5 gap-4">
            {/* Top Row: Breadcrumbs & Global Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden text-slate-600 hover:bg-slate-100/50 rounded-xl" />}>
                    <Menu className="w-6 h-6" />
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-72 border-none">
                    <SidebarContent />
                  </SheetContent>
                </Sheet>
                
                {/* Breadcrumbs */}
                <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Link to="/" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors group">
                    <Home className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    <span>Workspace</span>
                  </Link>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                  {location.pathname !== "/" ? (
                    <>
                      <Link 
                        to={`/${location.pathname.split("/")[1]}`}
                        className="hover:text-slate-900 transition-colors capitalize"
                      >
                        {location.pathname.split("/")[1].replace(/-/g, ' ')}
                      </Link>
                      {location.pathname.split("/")[2] && (
                        <>
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                          <span className="text-slate-900 font-bold capitalize">
                            {location.pathname.split("/")[1] === "projects" ? "Board" : location.pathname.split("/")[2].replace(/-/g, ' ')}
                          </span>
                        </>
                      )}
                    </>
                  ) : (
                    <span className="text-slate-900 font-bold">Dashboard</span>
                  )}
                </nav>
              </div>

              <div className="flex items-center gap-8">
                <div className="hidden sm:flex items-center bg-slate-100/50 rounded-2xl px-4 py-2.5 border border-slate-200/50 focus-within:border-emerald-500/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all duration-500 shadow-sm group w-72">
                  <Search className="w-4 h-4 text-slate-400 mr-3 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search workspace..." 
                    className="bg-transparent border-none focus:ring-0 text-sm text-slate-600 w-full font-bold placeholder:text-slate-400 placeholder:font-medium"
                  />
                  <div className="hidden lg:flex items-center gap-1 ml-2 opacity-40 group-focus-within:opacity-100 transition-opacity">
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] text-slate-500 font-black shadow-sm">⌘</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] text-slate-500 font-black shadow-sm">K</kbd>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <NotificationBell />
                  <div className="h-8 w-px bg-slate-100 mx-1" />
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <button className="flex items-center gap-3 pl-2 group cursor-pointer outline-none border-none bg-transparent text-left">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-black text-slate-900 leading-none group-hover:text-emerald-600 transition-colors">{user?.name || (user?.email ? user.email.split('@')[0] : "User")}</p>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-[0.15em] font-black">Workspace Member</p>
                        </div>
                        <Avatar className="w-11 h-11 border-2 border-white shadow-xl ring-1 ring-slate-100 group-hover:ring-emerald-200 transition-all duration-300">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback className="bg-emerald-50 text-emerald-600 font-black text-lg uppercase">
                            {(user?.name || user?.email || "U").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    } />
                    <DropdownMenuContent align="end" className="w-56 p-2 border-none shadow-2xl rounded-2xl overflow-hidden bg-white/95 backdrop-blur-md">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-widest">My Account</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate("/settings")} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer focus:bg-emerald-50 focus:text-emerald-700 transition-colors group">
                          <UserIcon className="w-4 h-4 text-slate-400 group-focus:text-emerald-600" />
                          <span className="font-bold text-sm">Profile Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/tasks")} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer focus:bg-emerald-50 focus:text-emerald-700 transition-colors group">
                          <CheckSquare className="w-4 h-4 text-slate-400 group-focus:text-emerald-600" />
                          <span className="font-bold text-sm">My Tasks</span>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator className="bg-slate-50 my-1" />
                      <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer focus:bg-red-50 focus:text-red-700 transition-colors group">
                        <LogOut className="w-4 h-4 text-slate-400 group-focus:text-red-600" />
                        <span className="font-bold text-sm">Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Bottom Row: Dynamic H1 & Page Actions */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  {title || "Verdant"}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                {actions}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-white scroll-smooth relative">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.15] pointer-events-none" />
          <div className="relative z-0">
            <ErrorWrapper>
              {children}
            </ErrorWrapper>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
