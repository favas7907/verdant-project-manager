import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, MessageSquare, Paperclip, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const TaskCard = ({ task, onClick, isOverlay = false, ...props }: { task: any, onClick?: any, isOverlay?: boolean, [key: string]: any }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-20 bg-emerald-100 rounded-2xl border-2 border-dashed border-emerald-300 h-[140px]"
      />
    );
  }

  const priorityColors = {
    Low: "bg-blue-50 text-blue-600 border-blue-100",
    Medium: "bg-amber-50 text-amber-600 border-amber-100",
    High: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`group border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-grab active:cursor-grabbing rounded-3xl overflow-hidden bg-white ring-1 ring-slate-200/50 ${
        isOverlay ? "shadow-2xl border-2 border-emerald-500/20 rotate-1 scale-105" : ""
      }`}
    >
      <CardContent className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="secondary" className={`${priorityColors[task.priority]} text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-xl border shadow-sm`}>
            {task.priority}
          </Badge>
          <button className="text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-300 p-1 hover:bg-slate-50 rounded-lg">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        <h4 className="font-black text-slate-900 leading-tight line-clamp-2 text-base group-hover:text-emerald-600 transition-colors tracking-tight">
          {task.title}
        </h4>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-4 text-slate-400">
            {task.dueDate && (
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest">
                <Calendar className="w-4 h-4 text-slate-300" />
                {format(task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate), "MMM d")}
              </div>
            )}
            <div className="flex items-center gap-3">
              {task.comments?.length > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] font-black">
                  <MessageSquare className="w-4 h-4 text-slate-300" />
                  {task.comments.length}
                </div>
              )}
              {task.attachments?.length > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] font-black">
                  <Paperclip className="w-4 h-4 text-slate-300" />
                  {task.attachments.length}
                </div>
              )}
            </div>
          </div>

          {task.assignedTo && (
            <Avatar className="w-8 h-8 border-2 border-white shadow-lg ring-1 ring-slate-100 group-hover:ring-emerald-200 transition-all">
              <AvatarImage src={task.assignedTo.avatar} />
              <AvatarFallback className="text-[10px] font-black bg-emerald-50 text-emerald-600">
                {task.assignedTo.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
