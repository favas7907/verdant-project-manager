import React from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "./ui/button";

const KanbanColumn = ({ column, tasks, onTaskClick, ...props }: { column: any, tasks: any, onTaskClick: any, [key: string]: any }) => {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div className="flex flex-col w-[350px] bg-slate-50/30 rounded-[2.5rem] border border-slate-200/40 p-7 h-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-4">
          <h3 className="font-black text-slate-900 tracking-tight text-lg">{column.title}</h3>
          <span className="bg-white text-slate-500 text-[10px] px-3 py-1.5 rounded-xl font-black shadow-sm ring-1 ring-slate-200/50 uppercase tracking-[0.15em]">
            {tasks.length}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-11 w-11 text-slate-300 hover:text-slate-600 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      <div ref={setNodeRef} className="flex-1 flex flex-col gap-5 min-h-[150px] overflow-y-auto pr-1 scrollbar-hide">
        <SortableContext items={tasks.map((t: any) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task: any) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>
      </div>

      <Button 
        variant="ghost" 
        className="mt-8 w-full justify-center text-slate-400 hover:text-emerald-600 hover:bg-white rounded-[1.5rem] h-14 font-black text-sm transition-all shadow-sm hover:shadow-xl border border-transparent hover:border-emerald-50 group"
      >
        <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
        Add Task
      </Button>
    </div>
  );
};

export default KanbanColumn;
