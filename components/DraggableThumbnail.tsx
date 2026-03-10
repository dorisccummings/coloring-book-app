'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PageContent } from '../store/useBookStore'
import { GripVertical, Trash2 } from 'lucide-react'

export function DraggableThumbnail({ page, onRemove }: { page: PageContent, onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: page.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative bg-white border rounded-xl p-4 shadow-sm flex items-center gap-4 group"
    >
      {/* The "Handle" to drag the item */}
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 hover:bg-slate-100 rounded">
        <GripVertical className="text-slate-400" />
      </div>

      <img src={page.thumbnailUrl} alt={page.title} className="w-16 h-20 object-contain bg-slate-50 border rounded" />
      
      <div className="flex-grow">
        <h3 className="font-bold text-slate-800">{page.title}</h3>
        <p className="text-xs text-slate-500 uppercase">{Array.isArray(page.category) ? page.category[0] : page.category}</p>
      </div>

      <button 
        onClick={() => onRemove(page.id)}
        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 size={18} />
      </button>
    </div>
  )
}