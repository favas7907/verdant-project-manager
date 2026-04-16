import React from "react";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useNotifications } from "../context/NotificationContext";
import { ScrollArea } from "./ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

import { Badge } from "./ui/badge";

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative hover:bg-slate-100 rounded-full w-10 h-10" />}>
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 border-none shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-[10px]">
              {unreadCount} New
            </Badge>
          )}
        </div>
        <ScrollArea className="h-80 bg-white">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500 font-medium">All caught up!</p>
              <p className="text-xs text-slate-400 mt-1">No new notifications for you.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-4 flex flex-col items-start gap-1 cursor-pointer transition-colors focus:bg-slate-50 ${
                    !notification.isRead ? "bg-emerald-50/30" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3 w-full">
                    {!notification.isRead && (
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm leading-tight ${!notification.isRead ? "font-bold text-slate-900" : "text-slate-600"}`}>
                        {notification.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-3 bg-slate-50 border-t border-slate-100">
          <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100/50">
            View All Activity
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
