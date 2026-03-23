'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import RevenueExpenseModal from '@/components/RevenueExpenseModal'
import FarmTasksModal from '@/components/FarmTasksModal'
import { 
  Users, 
  FolderTree, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  Plus,
  Quote,
  Hand,
  TrendingDown,
  BarChart3,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Sprout,
  Landmark,
  Activity,
  Sparkles,
  Leaf,
  TrendingUp as TrendUp,
  TrendingDown as TrendDown,
  CheckCircle2,
  Circle,
  Clock,
  Edit2,
  Trash2,
  X,
  PieChart,
  MoreHorizontal,
  BookOpen,
  Save,
  Trash,
  Edit,
  Calendar as CalendarIcon,
  User,
  ListTodo,
  ChevronRight,
  PenLine
} from 'lucide-react'


interface DashboardClientProps {
  customers: any[]
  recentTransactions: any[]
}

// Spinning number component
function SpinningNumber({ value, color, suffix = '', prefix = '' }: { value: number; color?: string; suffix?: string; prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0)
  const [spinning, setSpinning] = useState(true)
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    setSpinning(true)
    const spinDuration = 1000
    const spinSteps = 20
    let step = 0

    spinIntervalRef.current = setInterval(() => {
      step++
      setDisplayValue(Math.floor(Math.random() * 100))
      
      if (step >= spinSteps) {
        if (spinIntervalRef.current) {
          clearInterval(spinIntervalRef.current)
          spinIntervalRef.current = null
        }
        setDisplayValue(value)
        setSpinning(false)
      }
    }, spinDuration / spinSteps)

    return () => {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current)
        spinIntervalRef.current = null
      }
    }
  }, [value])

  return (
    <span className={`inline-block transition-all duration-100 ${spinning ? 'animate-spin-slot' : ''} ${color}`} suppressHydrationWarning>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  )
}

// Sparkline component for trend visualization
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    if (!canvasRef.current || !data.length) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    const padding = 2
    
    ctx.clearRect(0, 0, width, height)
    
    if (data.length < 2) return
    
    const maxVal = Math.max(...data)
    const minVal = Math.min(...data)
    const range = maxVal - minVal || 1
    
    const points = data.map((val, i) => ({
      x: padding + (i / (data.length - 1)) * (width - 2 * padding),
      y: height - padding - ((val - minVal) / range) * (height - 2 * padding)
    }))
    
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(points[0].x, height - padding)
    for (let i = 0; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.lineTo(points[points.length - 1].x, height - padding)
    ctx.closePath()
    
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, `${color}40`)
    gradient.addColorStop(1, `${color}00`)
    ctx.fillStyle = gradient
    ctx.fill()
  }, [data, color])
  
  return <canvas ref={canvasRef} width={80} height={30} className="w-full h-7" />
}

// Donut Chart Component - Clickable
function DonutChart({ revenue, expenses, onClick }: { revenue: number; expenses: number; onClick?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const total = revenue + expenses
  const revenuePercent = (revenue / total) * 360
  const expensesPercent = (expenses / total) * 360

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 8

    ctx.clearRect(0, 0, width, height)

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, 0, (expensesPercent * Math.PI) / 180)
    ctx.closePath()
    ctx.fillStyle = '#B85C3A'
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, (expensesPercent * Math.PI) / 180, ((expensesPercent + revenuePercent) * Math.PI) / 180)
    ctx.closePath()
    ctx.fillStyle = '#7AA65A'
    ctx.fill()

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI)
    ctx.fillStyle = '#0F180F'
    ctx.fill()

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 12px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`₹${Math.round(total).toLocaleString()}`, centerX, centerY)
  }, [revenue, expenses, revenuePercent, expensesPercent])

  return <canvas ref={canvasRef} width={140} height={140} className="w-full h-32 cursor-pointer hover:opacity-80 transition-opacity" onClick={onClick} />
}

// Tiny train component with smoke
function TinyTrain() {
  const [position, setPosition] = useState(-180)
  const [smokeParticles, setSmokeParticles] = useState<Array<{ id: number; x: number; y: number }>>([])
  let smokeCounter = useRef(0)
  
  useEffect(() => {
    const trainInterval = setInterval(() => {
      setPosition(prev => {
        if (prev >= window.innerWidth + 100) {
          return -180
        }
        return prev + 0.8
      })
    }, 30)
    
    const smokeInterval = setInterval(() => {
      setSmokeParticles(prev => {
        const newSmoke = {
          id: smokeCounter.current++,
          x: position + 25,
          y: 22
        }
        return [...prev.slice(-12), newSmoke]
      })
    }, 180)
    
    return () => {
      clearInterval(trainInterval)
      clearInterval(smokeInterval)
    }
  }, [position])
  
  return (
    <div className="fixed bottom-0 left-0 w-full pointer-events-none z-20" style={{ maxWidth: '100%' }}>
      <div className="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-b from-[#2A2418] to-[#1A1812]">
        <div className="absolute bottom-1 left-0 w-full h-0.5 bg-[#4A3A2A]"></div>
        <div className="absolute bottom-1.5 left-0 w-full h-0.5 bg-[#3A2E1E]"></div>
      </div>
      
      {smokeParticles.map((smoke) => (
        <div
          key={smoke.id}
          className="absolute pointer-events-none"
          style={{
            left: `${smoke.x}px`,
            bottom: `${smoke.y}px`,
            animation: 'smokeRise 1s ease-out forwards'
          }}
        >
          <div className="w-2 h-2 rounded-full bg-gray-500/20 blur-[0.5px]" />
        </div>
      ))}
      
      <div
        className="absolute transition-all duration-50"
        style={{ left: `${position}px`, bottom: '3px' }}
      >
        <div className="flex items-end">
          <div className="relative">
            <div className="w-8 h-5 bg-gradient-to-b from-[#F5D742] to-[#D4AF37] rounded-t-sm border border-[#F5E6B3]/50">
              <div className="absolute -top-1 left-1.5 w-1 h-1.5 bg-gradient-to-b from-[#D4AF37] to-[#B88D2B] rounded-xs">
                <div className="absolute -top-0.5 left-0 w-1 h-0.5 bg-gray-500/30 rounded-full animate-pulse" />
              </div>
              <div className="absolute top-1 left-3 w-1 h-1 bg-[#2A2418] rounded-sm" />
              <div className="absolute top-1 left-5 w-1 h-1 bg-[#2A2418] rounded-sm" />
            </div>
            <div className="absolute -bottom-0.5 left-0.5 w-1 h-1 rounded-full bg-[#2A2418] border border-[#D4AF37]/50" />
            <div className="absolute -bottom-0.5 left-2.5 w-1 h-1 rounded-full bg-[#2A2418] border border-[#D4AF37]/50" />
            <div className="absolute -bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-[#2A2418] border border-[#D4AF37]/50" />
          </div>
          
          {[1, 2, 3].map((car) => (
            <div key={car} className="relative">
              <div className="w-5 h-4 bg-gradient-to-b from-[#F5D742] to-[#D4AF37] border-t border-[#F5E6B3]/50">
                <div className="absolute top-0.5 left-1 w-0.5 h-0.5 bg-[#2A2418] rounded-sm" />
                <div className="absolute top-0.5 left-2.5 w-0.5 h-0.5 bg-[#2A2418] rounded-sm" />
              </div>
              <div className="absolute -bottom-0.5 left-0.5 w-0.5 h-0.5 rounded-full bg-[#2A2418] border border-[#D4AF37]/50" />
              <div className="absolute -bottom-0.5 right-0.5 w-0.5 h-0.5 rounded-full bg-[#2A2418] border border-[#D4AF37]/50" />
            </div>
          ))}
          
          <div className="relative">
            <div className="w-5 h-3.5 bg-gradient-to-b from-[#F5D742] to-[#D4AF37] border-t border-[#F5E6B3]/50 rounded-r-sm">
              <div className="absolute top-0.5 left-1 w-0.5 h-0.5 bg-[#2A2418] rounded-sm" />
              <div className="absolute -right-0.5 top-1 w-0.5 h-0.5 bg-[#B85C3A]/60 rounded-r-sm animate-pulse" />
            </div>
            <div className="absolute -bottom-0.5 left-0.5 w-0.5 h-0.5 rounded-full bg-[#2A2418] border border-[#D4AF37]/50" />
            <div className="absolute -bottom-0.5 right-0.5 w-0.5 h-0.5 rounded-full bg-[#2A2418] border border-[#D4AF37]/50" />
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes smokeRise {
          0% {
            opacity: 0.4;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-12px) scale(1.2);
          }
        }
      `}</style>
    </div>
  )
}

// Journal Entry Interface
interface JournalEntry {
  id: number
  date: string
  title: string
  content: string
  mood?: string
  createdAt: string
}

// Todo Item Interface
interface TodoItem {
  id: number
  text: string
  completed: boolean
}

// Todo Modal Component
function TodoModal({ isOpen, onClose, tasks, onToggleTask, onAddTask, onUpdateTask, onDeleteTask }: { 
  isOpen: boolean; 
  onClose: () => void; 
  tasks: TodoItem[];
  onToggleTask: (id: number) => void;
  onAddTask: (text: string) => void;
  onUpdateTask: (id: number, text: string) => void;
  onDeleteTask: (id: number) => void;
}) {
  const [editingTask, setEditingTask] = useState<TodoItem | null>(null)
  const [newTaskText, setNewTaskText] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = () => {
    if (newTaskText.trim()) {
      onAddTask(newTaskText)
      setNewTaskText('')
      setIsAdding(false)
    }
  }

  const handleUpdate = () => {
    if (editingTask && newTaskText.trim()) {
      onUpdateTask(editingTask.id, newTaskText)
      setEditingTask(null)
      setNewTaskText('')
    }
  }

  const startEdit = (task: TodoItem) => {
    setEditingTask(task)
    setNewTaskText(task.text)
  }

  const cancelEdit = () => {
    setEditingTask(null)
    setNewTaskText('')
    setIsAdding(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0F180F] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border-2 border-[#D4AF37]/30 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[#D4AF37]/20 bg-[#1A241A]">
          <div className="flex items-center gap-3">
            <ListTodo className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-semibold text-white">My Tasks</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {isAdding ? (
            <div className="mb-4 p-3 bg-[#0A120A] rounded-lg border border-[#D4AF37]/30">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Enter task description..."
                className="w-full bg-transparent text-white text-sm rounded px-3 py-2 border border-[#D4AF37]/30 focus:outline-none focus:border-[#D4AF37] mb-2"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              />
              <div className="flex gap-2">
                <button onClick={handleAdd} className="flex-1 bg-[#7AA65A]/20 text-[#7AA65A] text-sm py-1.5 rounded hover:bg-[#7AA65A]/30 transition-colors">Add Task</button>
                <button onClick={cancelEdit} className="flex-1 bg-gray-500/20 text-gray-400 text-sm py-1.5 rounded hover:bg-gray-500/30 transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setIsAdding(true)} className="w-full mb-4 py-2 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] text-sm font-medium hover:bg-[#D4AF37]/30 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add New Task
            </button>
          )}

          <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
            {tasks.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">No tasks yet. Click "Add New Task" to get started.</div>
            ) : (
              [...tasks].sort((a, b) => {
                if (a.completed === b.completed) return 0
                return a.completed ? 1 : -1
              }).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-[#0A120A] rounded-lg hover:bg-[#1A241A] transition-colors group">
                  <button onClick={() => onToggleTask(task.id)} className="flex-shrink-0">
                    {task.completed ? <CheckCircle2 className="w-5 h-5 text-[#7AA65A]" /> : <Circle className="w-5 h-5 text-gray-500 hover:text-[#D4AF37] transition-colors" />}
                  </button>
                  {editingTask?.id === task.id ? (
                    <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} className="flex-1 bg-[#0F180F] text-white text-sm rounded px-3 py-1 border border-[#D4AF37]/30 focus:outline-none focus:border-[#D4AF37]" autoFocus onKeyPress={(e) => e.key === 'Enter' && handleUpdate()} />
                  ) : (
                    <span className={`flex-1 text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{task.text}</span>
                  )}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingTask?.id === task.id ? (
                      <>
                        <button onClick={handleUpdate} className="p-1 text-[#7AA65A] hover:bg-[#7AA65A]/20 rounded"><Save className="w-3.5 h-3.5" /></button>
                        <button onClick={cancelEdit} className="p-1 text-gray-500 hover:bg-gray-500/20 rounded"><X className="w-3.5 h-3.5" /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(task)} className="p-1 text-[#D4AF37] hover:bg-[#D4AF37]/20 rounded"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => onDeleteTask(task.id)} className="p-1 text-[#B85C3A] hover:bg-[#B85C3A]/20 rounded"><Trash className="w-3.5 h-3.5" /></button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1A241A; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D4AF37; border-radius: 10px; }
      `}</style>
    </div>
  )
}

// Journal Modal Component
function JournalModal({ isOpen, onClose, entries, onSave, onDelete }: { 
  isOpen: boolean; 
  onClose: () => void; 
  entries: JournalEntry[];
  onSave: (entry: JournalEntry) => void;
  onDelete: (id: number) => void;
}) {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editMood, setEditMood] = useState('')

  const moods = ['🌱 Productive', '🌧️ Tired', '☀️ Energetic', '🌾 Grateful', '💭 Reflective']

  const handleNewEntry = () => {
    const newEntry: JournalEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      title: 'New Entry',
      content: '',
      mood: '🌱 Productive',
      createdAt: new Date().toISOString()
    }
    setSelectedEntry(newEntry)
    setEditTitle(newEntry.title)
    setEditContent(newEntry.content)
    setEditDate(newEntry.date)
    setEditMood(newEntry.mood || '🌱 Productive')
    setIsEditing(true)
  }

  const handleEditEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry)
    setEditTitle(entry.title)
    setEditContent(entry.content)
    setEditDate(entry.date)
    setEditMood(entry.mood || '🌱 Productive')
    setIsEditing(true)
  }

  const handleSave = () => {
    if (selectedEntry && editTitle.trim()) {
      const updatedEntry = { ...selectedEntry, title: editTitle, content: editContent, date: editDate, mood: editMood }
      onSave(updatedEntry)
      setIsEditing(false)
      setSelectedEntry(null)
    }
  }

  const handleDelete = () => {
    if (selectedEntry && window.confirm('Delete this entry?')) {
      onDelete(selectedEntry.id)
      setIsEditing(false)
      setSelectedEntry(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0F180F] rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border-2 border-[#AD8B6D]/30 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[#AD8B6D]/20 bg-[#1A241A]">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-[#AD8B6D]" />
            <h2 className="text-lg font-semibold text-white">Farm Journal</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex h-[calc(85vh-70px)]">
          <div className="w-80 border-r border-[#AD8B6D]/20 flex flex-col">
            <div className="p-3 border-b border-[#AD8B6D]/20">
              <button onClick={handleNewEntry} className="w-full py-2 rounded-lg bg-[#AD8B6D]/20 text-[#AD8B6D] text-sm font-medium hover:bg-[#AD8B6D]/30 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> New Entry
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {entries.length === 0 ? (
                <div className="text-center text-gray-500 text-xs py-8">No journal entries yet.<br />Click "New Entry" to start.</div>
              ) : (
                [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                  <div key={entry.id} onClick={() => handleEditEntry(entry)} className={`p-3 rounded-lg cursor-pointer transition-all ${selectedEntry?.id === entry.id && isEditing ? 'bg-[#AD8B6D]/20 border border-[#AD8B6D]/50' : 'bg-[#0A120A] hover:bg-[#AD8B6D]/10 border border-transparent'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#AD8B6D]">{entry.mood || '📝'}</span>
                      <span className="text-[10px] text-gray-500">{entry.date}</span>
                    </div>
                    <p className="text-sm font-medium text-white truncate">{entry.title}</p>
                    <p className="text-[10px] text-gray-500 truncate mt-1">{entry.content.substring(0, 60)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            {isEditing ? (
              <div className="flex-1 flex flex-col p-5 space-y-4">
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Entry title..." className="w-full bg-[#0A120A] text-white text-lg font-medium rounded-lg px-4 py-2 border border-[#AD8B6D]/30 focus:outline-none focus:border-[#AD8B6D]" />
                <div className="flex gap-3">
                  <div className="flex items-center gap-2 bg-[#0A120A] rounded-lg px-3 py-1.5 border border-[#AD8B6D]/30">
                    <CalendarIcon className="w-4 h-4 text-[#AD8B6D]" />
                    <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="bg-transparent text-white text-xs focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2 bg-[#0A120A] rounded-lg px-3 py-1.5 border border-[#AD8B6D]/30">
                    <User className="w-4 h-4 text-[#AD8B6D]" />
                    <select value={editMood} onChange={(e) => setEditMood(e.target.value)} className="bg-transparent text-white text-xs focus:outline-none">
                      {moods.map(mood => (<option key={mood} value={mood} className="bg-[#0A120A] text-white">{mood}</option>))}
                    </select>
                  </div>
                </div>
                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} placeholder="Write your journal entry here..." className="flex-1 w-full bg-[#0A120A] text-gray-300 text-sm rounded-lg px-4 py-3 border border-[#AD8B6D]/30 focus:outline-none focus:border-[#AD8B6D] resize-none" rows={8} />
                <div className="flex gap-3">
                  <button onClick={handleSave} className="flex-1 py-2 rounded-lg bg-[#7AA65A] text-white text-sm font-medium hover:bg-[#7AA65A]/80 transition-colors flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Save Entry</button>
                  {selectedEntry?.id && <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-[#B85C3A]/20 text-[#B85C3A] text-sm font-medium hover:bg-[#B85C3A]/30 transition-colors flex items-center gap-2"><Trash className="w-4 h-4" /> Delete</button>}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div><BookOpen className="w-12 h-12 text-[#AD8B6D]/30 mx-auto mb-3" /><p className="text-gray-500 text-sm">Select an entry from the left</p><p className="text-gray-600 text-xs mt-1">or click "New Entry" to start writing</p></div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1A241A; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #AD8B6D; border-radius: 10px; }
      `}</style>
    </div>
  )
}

export default function DashboardClient({ customers, recentTransactions }: DashboardClientProps) {
  const router = useRouter()
  const [greeting, setGreeting] = useState('')
  const [currentDate, setCurrentDate] = useState('')
  const [currentQuote, setCurrentQuote] = useState('')
  const [quoteFade, setQuoteFade] = useState(false)
  const [birdVisible, setBirdVisible] = useState(true)
  const [handWave, setHandWave] = useState(false)
  const [greetingBorderColor, setGreetingBorderColor] = useState(0)
  const [highlightedCard, setHighlightedCard] = useState(0)
  const [pulsePercentage, setPulsePercentage] = useState(false)
  const [isJournalOpen, setIsJournalOpen] = useState(false)
  const [isTodoOpen, setIsTodoOpen] = useState(false)
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false)
  const [isFarmTasksOpen, setIsFarmTasksOpen] = useState(false)
  
  const [tasks, setTasks] = useState<TodoItem[]>([
    { id: 1, text: 'Check fertilizer stock for wheat fields', completed: false },
    { id: 2, text: 'Call Nakamoto about pending payment', completed: false },
    { id: 3, text: 'Schedule equipment maintenance', completed: true },
    { id: 4, text: 'Review monthly irrigation report', completed: false },
    { id: 5, text: 'Order new seeds for next season', completed: false },
  ])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    { id: 1, date: new Date().toISOString().split('T')[0], title: 'First Day on the Farm', content: 'Started the day early. The wheat fields are looking good.', mood: '🌱 Productive', createdAt: new Date().toISOString() },
    { id: 2, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], title: 'Meeting with Nakamoto', content: 'Had a great discussion about the upcoming harvest.', mood: '🌾 Grateful', createdAt: new Date(Date.now() - 86400000).toISOString() }
  ])

  const creditTrend = useMemo(() => [12500, 13200, 12800, 14500, 14200, 15800, 16200], [])
  const debitTrend = useMemo(() => [9800, 10200, 9900, 10800, 11200, 10500, 11800], [])
  const monthlyGrowth = useMemo(() => ({ value: 8.5, isPositive: true, label: "Since last month" }), [])

  useEffect(() => {
    const interval = setInterval(() => { setHighlightedCard((prev) => (prev + 1) % 4); setPulsePercentage(true); setTimeout(() => setPulsePercentage(false), 400); }, 2000)
    return () => clearInterval(interval)
  }, [])

  const quotes = ["The secret of getting ahead is getting started. — Mark Twain", "It does not matter how slowly you go as long as you do not stop. — Confucius", "Profit is better than wages. — Virgil", "What is worth doing is worth doing well. — Aristotle", "The best time to plant a tree was 20 years ago. The second best time is now. — Chinese Proverb", "Your most valuable asset is your customer. — Peter Drucker", "Growth is never by mere chance; it is the result of forces working together. — James Cash Penney", "Trust is the glue of life. It's the most essential ingredient in effective communication. — Stephen Covey", "Efficiency is doing things right; effectiveness is doing the right things. — Peter Drucker", "The goal is not to do more, but to have less to do. — Francine Jay", "Simplicity is the ultimate sophistication. — Leonardo da Vinci", "What gets measured, gets managed. — Peter Drucker", "Be so good they can't ignore you. — Steve Martin", "Action is the antidote to fear. — Joan Baez", "Done is better than perfect. — Sheryl Sandberg", "The best way to complain is to make things. — James Murphy"]
  const borderColors = ['#7AA65A', '#D47B5A', '#D4AF37', '#AD8B6D']

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
    const now = new Date()
    const formatted = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
    setCurrentDate(formatted)
    const randomIndex = Math.floor(Math.random() * quotes.length)
    setCurrentQuote(quotes[randomIndex])
    const quoteInterval = setInterval(() => { setQuoteFade(true); setTimeout(() => { const randomIndex = Math.floor(Math.random() * quotes.length); setCurrentQuote(quotes[randomIndex]); setQuoteFade(false); }, 500); }, 30000)
    setTimeout(() => setBirdVisible(false), 8000)
    return () => clearInterval(quoteInterval)
  }, [])

  const stats = useMemo(() => {
    let totalProjects = 0, activeProjects = 0, totalDebit = 0, totalCredit = 0, totalTransactions = 0
    customers.forEach(customer => {
      totalProjects += customer.projects?.length || 0
      customer.projects?.forEach((project: any) => {
        if (project.status === 'active') activeProjects++
        project.transactions?.forEach((t: any) => {
          totalDebit += t.debit_amount || 0
          totalCredit += t.credit_amount || 0
          totalTransactions++
        })
      })
    })
    return { totalCustomers: customers.length, activeProjects, totalProjects, netBalance: totalCredit - totalDebit, totalDebit, totalCredit, totalTransactions, availableCash: (totalCredit - totalDebit) * 0.6, monthlyVolume: totalCredit + totalDebit }
  }, [customers])

  const handleGreetingClick = () => setGreetingBorderColor((prev) => (prev + 1) % borderColors.length)
  const handleSaveJournalEntry = (entry: JournalEntry) => setJournalEntries(prev => { const existing = prev.find(e => e.id === entry.id); return existing ? prev.map(e => e.id === entry.id ? entry : e) : [...prev, entry] })
  const handleDeleteJournalEntry = (id: number) => setJournalEntries(prev => prev.filter(e => e.id !== id))
  const handleToggleTask = (id: number) => setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task))
  const handleAddTask = (text: string) => setTasks([...tasks, { id: Date.now(), text, completed: false }])
  const handleUpdateTask = (id: number, text: string) => setTasks(tasks.map(task => task.id === id ? { ...task, text } : task))
  const handleDeleteTask = (id: number) => setTasks(tasks.filter(task => task.id !== id))

  const statCards = [
    { label: 'Available Cash', value: stats.availableCash, icon: <Wallet className="w-4 h-4" />, color: '#7AA65A', prefix: '₹', change: true, percentage: monthlyGrowth.value, isPositive: monthlyGrowth.isPositive, timeLabel: monthlyGrowth.label },
    { label: 'Total Debit', value: stats.totalDebit, icon: <TrendingDown className="w-4 h-4" />, color: '#B85C3A', prefix: '₹', sparkline: debitTrend, timeLabel: 'Last 7 days' },
    { label: 'Total Credit', value: stats.totalCredit, icon: <TrendingUp className="w-4 h-4" />, color: '#7AA65A', prefix: '₹', sparkline: creditTrend, timeLabel: 'Last 7 days' },
    { label: 'Transactions', value: stats.totalTransactions, icon: <BarChart3 className="w-4 h-4" />, color: '#AD8B6D', suffix: ' txns', noPrefix: true, timeLabel: 'This month' },
  ]

  const truncateName = (name: string) => { if (!name) return ''; const parts = name.split(' '); if (parts.length === 1) return parts[0].length > 12 ? parts[0].substring(0, 10) + '...' : parts[0]; return `${parts[0].substring(0, 8)} ${parts[1]?.substring(0, 1)}.` }
  const getTransactionCategory = (transaction: any) => { if (transaction.credit_amount > 0) return 'Payment'; if (transaction.description?.toLowerCase().includes('fertilizer')) return 'Fertilizer'; if (transaction.description?.toLowerCase().includes('seed')) return 'Seeds'; if (transaction.description?.toLowerCase().includes('equipment')) return 'Equipment'; return 'Expense' }
  const formatTime = (timestamp?: string) => { if (!timestamp) return ''; const date = new Date(timestamp); return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
  const getTransactionId = (id: string) => `#${id.slice(-6)}`

  return (
    <div className="min-h-screen bg-[#0A120A] relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute bottom-1/3 left-0 right-0 h-32 bg-gradient-to-t from-[#1A2A1A]/40 to-transparent"></div>
        <div className="absolute bottom-1/3 left-0 right-0">{[...Array(8)].map((_, i) => (<div key={i} className="absolute bottom-0 w-full h-12" style={{ left: `${i * 12.5}%`, transform: `translateY(${Math.sin(i) * 3}px)` }}><div className="relative">{[...Array(4)].map((_, j) => (<div key={j} className="absolute w-0.5 bg-[#D4AF37]/20" style={{ left: `${j * 10}px`, height: '14px', bottom: '0', transform: `rotate(${Math.sin(j + i) * 8}deg)` }}></div>))}</div></div>))}</div>
        <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-3xl animate-sunrise"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A120A] via-transparent to-[#0A120A]/30 pointer-events-none"></div>
        <div className="absolute inset-0 pointer-events-none">{[{ left: '15%', top: '20%', delay: '0s' }, { left: '85%', top: '30%', delay: '2s' }, { left: '45%', top: '70%', delay: '1s' }, { left: '70%', top: '15%', delay: '3s' }, { left: '25%', top: '85%', delay: '2.5s' }].map((particle, i) => (<div key={i} className="absolute w-0.5 h-0.5 bg-[#D4AF37]/20 rounded-full" style={{ left: particle.left, top: particle.top, animation: `float-particle 15s linear infinite`, animationDelay: particle.delay }} />))}</div>
      </div>

      {birdVisible && (<div className="fixed top-1/4 left-0 z-50 pointer-events-none animate-bird-fly"><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M8 12 C 12 10, 16 10, 20 12 C 18 15, 14 17, 10 15 C 8 13, 8 12, 8 12" fill="#1A2A1A" stroke="#D4AF37" strokeWidth="1.2"/><path d="M16 12 L 22 8 L 20 12 L 22 16 L 16 12" fill="#0A120A" stroke="#D4AF37" strokeWidth="1" className="animate-wing"/><circle cx="14" cy="12" r="1" fill="#D4AF37" /></svg></div>)}
      <TinyTrain />
      <JournalModal isOpen={isJournalOpen} onClose={() => setIsJournalOpen(false)} entries={journalEntries} onSave={handleSaveJournalEntry} onDelete={handleDeleteJournalEntry} />
      <TodoModal isOpen={isTodoOpen} onClose={() => setIsTodoOpen(false)} tasks={tasks} onToggleTask={handleToggleTask} onAddTask={handleAddTask} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />

      <div className="relative z-10 max-w-6xl mx-auto p-4 sm:p-5 space-y-5 pb-16">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div onClick={handleGreetingClick} className="cursor-pointer group">
            <div className="flex items-center gap-4"><h1 className="text-3xl font-bold text-white group-hover:scale-105 transition-transform">{greeting}</h1><button onMouseEnter={() => setHandWave(true)} onMouseLeave={() => setHandWave(false)} className={`text-3xl transition-all duration-300 ${handWave ? 'scale-125 rotate-12' : ''}`}>👋</button></div>
            <div className={`mt-2 h-0.5 rounded-full transition-all duration-500 ${greetingBorderColor === 0 ? 'bg-[#7AA65A]' : greetingBorderColor === 1 ? 'bg-[#D47B5A]' : greetingBorderColor === 2 ? 'bg-[#D4AF37]' : 'bg-[#AD8B6D]'}`} style={{ width: 'auto' }}></div>
            <div className="mt-2"><p className="text-[#D4AF37] text-sm flex items-center gap-2"><Calendar className="w-4 h-4" />{currentDate}</p><p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Leaf className="w-3 h-3" />your farm at a glance</p></div>
          </div>
          <div className={`w-full lg:w-[28rem] bg-[#1A241A] border-l-2 border-[#D4AF37]/50 rounded-2xl pl-6 pr-4 py-4 transition-opacity duration-500 ${quoteFade ? 'opacity-0' : 'opacity-100'}`}><p className="text-sm text-gray-300 italic flex items-start gap-3"><Quote className="w-5 h-5 text-[#D4AF37]/70 mt-0.5 flex-shrink-0" /><span className="text-sm leading-relaxed text-gray-300">{currentQuote}</span></p></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((item, idx) => {
            const isHighlighted = idx === highlightedCard
            return (<div key={item.label} className="relative"><div className={`group bg-[#0F180F] rounded-lg p-3 border transition-all duration-300 ${isHighlighted ? 'scale-105 shadow-lg border-2' : 'border border-[#D4AF37]/20 hover:border-[#D4AF37]/50'}`} style={{ borderColor: isHighlighted ? item.color : undefined }}><div className="flex items-center justify-between mb-2"><div className={`transition-all duration-300 ${isHighlighted ? 'scale-110' : 'group-hover:scale-110'}`} style={{ color: item.color }}>{item.icon}</div>{item.change && (<div className="flex flex-col items-end"><div className={`flex items-center gap-0.5 text-xs font-medium ${item.isPositive !== false ? 'text-[#7AA65A]' : 'text-[#B85C3A]'} ${pulsePercentage && idx === 0 ? 'animate-pulse scale-110' : ''}`}>{item.isPositive !== false ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{Math.abs(Number(item.percentage))}%</div>{item.timeLabel && <span className="text-[9px] text-gray-600 mt-0.5">{item.timeLabel}</span>}</div>)}{!item.change && item.timeLabel && <span className="text-[9px] text-gray-600">{item.timeLabel}</span>}</div><p className="text-[11px] text-gray-500 mb-0.5">{item.label}</p><p className="text-xl font-bold tracking-tight" style={{ color: item.color }}>{!item.noPrefix && <span>₹</span>}<SpinningNumber value={Math.abs(item.value)} color="" />{item.suffix && <span className="text-xs ml-0.5">{item.suffix}</span>}</p>{item.sparkline && <div className="mt-2 opacity-60"><Sparkline data={item.sparkline} color={item.color} /></div>}</div></div>)
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LEFT COLUMN: Recent Activity */}
          <div className="lg:col-span-4 bg-[#0F180F]/80 rounded-xl p-4 hover:bg-[#0F180F] transition-all border border-[#4F8A8A]/30 hover:border-[#6FAAAA]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#6FAAAA]" /><h3 className="text-sm font-medium text-white">Recent Activity</h3></div>
              <button 
                onClick={() => router.push('/accounting')} 
                className="text-xs text-[#6FAAAA] hover:text-[#8FCACA] transition-all duration-200 group/btn relative"
              >
                View All 
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#6FAAAA] group-hover/btn:w-full transition-all duration-300"></span>
              </button>
            </div>
            <div className="space-y-2 h-[420px] overflow-y-auto custom-scrollbar pr-1">
              {recentTransactions.length === 0 ? (<p className="text-xs text-gray-500 text-center py-4">No recent transactions</p>) : (recentTransactions.slice(0, 9).map((t: any, idx: number) => (
                <div 
                  key={t.id} 
                  onClick={() => router.push(`/projects/${t.project_id}`)} 
                  className={`flex items-center justify-between p-2 bg-black/20 rounded-xl hover:bg-[#6FAAAA]/10 cursor-pointer transition-all group/item ${idx === 0 ? 'shadow-[0_0_8px_rgba(111,170,170,0.3)] border border-[#6FAAAA]/30' : ''}`}
                  style={{ animation: `fadeInUp 0.2s ${idx * 0.03}s both` }}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-0.5 h-8 bg-[#6FAAAA]/50 rounded-full group-hover/item:bg-[#6FAAAA] transition-colors"></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-white truncate">{truncateName(t.projects?.customers?.full_name)}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${t.credit_amount > 0 ? 'bg-[#7AA65A]/20 text-[#7AA65A]' : 'bg-[#B85C3A]/20 text-[#B85C3A]'}`}>{getTransactionCategory(t)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-gray-500 truncate flex-1">{t.description || t.type}</p>
                        <div className="flex items-center gap-1 text-[9px] text-gray-600 flex-shrink-0">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{formatTime(t.created_at)}</span>
                          <span className="text-gray-700">•</span>
                          <span>{getTransactionId(t.id)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p 
                    className={`text-xs font-medium ml-2 flex-shrink-0 ${t.credit_amount > 0 ? 'text-[#7AA65A]' : 'text-[#B85C3A]'}`}
                    suppressHydrationWarning
                  >
                    {t.credit_amount > 0 ? '+' : '-'} ₹{(t.credit_amount || t.debit_amount).toLocaleString()}
                  </p>
                </div>
              )))}
            </div>
          </div>

          {/* CENTER COLUMN: Manage Farmers, Donut Chart, Generate Reports */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1. Manage Farmers - Sage Green */}
            <div onClick={() => router.push('/customers')} className="group bg-[#0F180F] rounded-xl p-4 border-2 border-[#7AA65A]/40 hover:border-[#7AA65A] transition-all cursor-pointer">
              <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-[#7AA65A]/20"><Users className="w-5 h-5 text-[#7AA65A]" /></div><div><h3 className="text-base font-medium text-white">Manage Farmers</h3><p className="text-xs text-gray-500">Add, edit, or view farmer details</p><p className="text-[11px] text-[#7AA65A] mt-1">{stats.totalCustomers} farmers in system →</p></div></div>
            </div>

            {/* 2. Expenses vs Revenue Donut Chart */}
            <div className="bg-[#0F180F] rounded-xl p-5 border-2 border-[#D4AF37]/30 hover:border-[#D4AF37]/60 transition-all cursor-pointer" onClick={() => setIsRevenueModalOpen(true)}>
              <div className="flex items-center gap-2 mb-4"><PieChart className="w-4 h-4 text-[#D4AF37]" /><h3 className="text-sm font-medium text-white">Expenses vs Revenue</h3><span className="text-[10px] text-gray-500 ml-auto">Click to view details</span></div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex justify-center w-full md:w-1/2"><DonutChart revenue={stats.totalCredit} expenses={stats.totalDebit} onClick={() => setIsRevenueModalOpen(true)} /></div>
                <div className="w-full md:w-1/2 space-y-3 pl-0 md:pl-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#7AA65A]"></div>
                      <span className="text-xs text-gray-400">Revenue</span>
                    </div>
                    <span className="text-sm font-medium text-[#7AA65A]" suppressHydrationWarning>
                      ₹{stats.totalCredit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#B85C3A]"></div>
                      <span className="text-xs text-gray-400">Expenses</span>
                    </div>
                    <span className="text-sm font-medium text-[#B85C3A]" suppressHydrationWarning>
                      ₹{stats.totalDebit.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-[#D4AF37]/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Profit Margin</span>
                      <span className={`text-sm font-semibold ${stats.netBalance >= 0 ? 'text-[#7AA65A]' : 'text-[#B85C3A]'}`}>
                        {stats.totalCredit > 0 ? ((stats.netBalance / stats.totalCredit) * 100).toFixed(1) : '0'}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-gray-500">Net Balance</span>
                      <span className={`text-xs font-medium ${stats.netBalance >= 0 ? 'text-[#7AA65A]' : 'text-[#B85C3A]'}`} suppressHydrationWarning>
                        ₹{stats.netBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Generate Reports - Lavender with stats */}
            <div onClick={() => router.push('/reports')} className="group bg-[#0F180F] rounded-xl p-4 border-2 border-[#9B7BB5]/40 hover:border-[#9B7BB5] transition-all cursor-pointer">
              <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-[#9B7BB5]/20"><TrendingUp className="w-5 h-5 text-[#9B7BB5]" /></div><div><h3 className="text-base font-medium text-white">Generate Reports</h3><p className="text-xs text-gray-500">Export financial data & insights</p><p className="text-[11px] text-[#9B7BB5] mt-1">{stats.totalTransactions} transactions available →</p></div></div>
            </div>
          </div>

          {/* RIGHT COLUMN: Key Metrics, Farm Summary, Todo List (with Journal icon) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Key Metrics - Gold */}
            <div className="bg-[#0F180F] rounded-xl p-3 border-2 border-[#D4AF37]/50 hover:border-[#D4AF37] transition-all">
              <h3 className="text-xs font-medium text-white mb-2 flex items-center gap-2"><span className="w-1 h-3 bg-[#D4AF37] rounded-full"></span>Key Metrics</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center pb-1.5 border-b border-[#D4AF37]/10"><div className="flex items-center gap-1.5"><Users className="w-3 h-3 text-[#7AA65A]" /><p className="text-[11px] text-gray-500">Total Farmers</p></div><p className="text-sm font-semibold text-[#7AA65A]"><SpinningNumber value={stats.totalCustomers} color="text-[#7AA65A]" /></p></div>
                <div className="flex justify-between items-center pb-1.5 border-b border-[#D4AF37]/10"><div className="flex items-center gap-1.5"><Landmark className="w-3 h-3 text-[#D47B5A]" /><p className="text-[11px] text-gray-500">Active Fields</p></div><p className="text-sm font-semibold text-[#D47B5A]"><SpinningNumber value={stats.activeProjects} color="text-[#D47B5A]" /></p></div>
                <div className="flex justify-between items-center"><div className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-[#D4AF37]" /><p className="text-[11px] text-gray-500">All Projects</p></div><p className="text-sm font-semibold text-[#D4AF37]"><SpinningNumber value={stats.totalProjects} color="text-[#D4AF37]" /></p></div>
              </div>
            </div>

            {/* Farm Summary - Clay/Terracotta */}
            <div className="bg-[#0F180F] rounded-xl p-3 border-2 border-[#AD8B6D]/50 hover:border-[#AD8B6D] transition-all group">
              <div className="flex items-center gap-1.5 mb-2"><Sparkles className="w-3 h-3 text-[#AD8B6D] animate-pulse group-hover:animate-spin transition-all duration-500" /><h3 className="text-xs font-medium text-white">Farm Summary</h3></div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center"><p className="text-[11px] text-gray-500">Net Balance (All Time)</p><p className={`text-sm font-semibold ${stats.netBalance >= 0 ? 'text-[#7AA65A]' : 'text-[#B85C3A]'}`}>₹<SpinningNumber value={Math.abs(stats.netBalance)} color="" /></p></div>
                <div className="flex justify-between items-center"><p className="text-[11px] text-gray-500">Monthly Volume</p><p className="text-sm font-semibold text-white">₹<SpinningNumber value={Math.abs(stats.monthlyVolume)} color="" /></p></div>
                <div className="flex justify-between items-center pt-1 border-t border-[#D4AF37]/10"><p className="text-[11px] text-gray-500">Profit/Loss</p><div className="text-right"><p className={`text-sm font-semibold ${stats.netBalance >= 0 ? 'text-[#7AA65A]' : 'text-[#B85C3A]'}`}>{stats.netBalance >= 0 ? 'Profit' : 'Loss'}</p><p className="text-[9px] text-gray-600">Since inception</p></div></div>
              </div>
            </div>

            {/* Farm Tasks Button */}
            <div className="bg-[#0F180F] rounded-xl p-3 border-2 border-[#D4AF37]/50 hover:border-[#D4AF37] transition-all cursor-pointer" onClick={() => setIsFarmTasksOpen(true)}>
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-xs font-medium text-white">Farm Tasks</h3>
              </div>
              <p className="text-[11px] text-gray-400">Manage to-do lists for each farm</p>
              <div className="mt-2 text-right">
                <span className="text-[10px] text-[#D4AF37]">Click to open →</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <RevenueExpenseModal 
        isOpen={isRevenueModalOpen}
        onClose={() => setIsRevenueModalOpen(false)}
        revenue={stats.totalCredit}
        expenses={stats.totalDebit}
        customers={customers}
      />

      <FarmTasksModal
        isOpen={isFarmTasksOpen}
        onClose={() => setIsFarmTasksOpen(false)}
        customers={customers}
      />
      
      <style jsx>{`
        @keyframes sunrise { 0% { opacity: 0; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0; transform: scale(0.8); } }
        @keyframes float-particle { 0% { transform: translateY(0) translateX(0); opacity: 0; } 10% { opacity: 0.3; } 90% { opacity: 0.2; } 100% { transform: translateY(-80px) translateX(40px); opacity: 0; } }
        @keyframes bird-fly { 0% { transform: translateX(-200px) translateY(0); opacity: 0; } 5% { opacity: 1; } 30% { transform: translateX(30vw) translateY(-10px); } 60% { transform: translateX(60vw) translateY(5px); } 90% { transform: translateX(90vw) translateY(-5px); opacity: 1; } 100% { transform: translateX(110vw) translateY(0); opacity: 0; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-bird-fly { animation: bird-fly 8s ease-in-out forwards; }
        @keyframes wing { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-20deg); } }
        .animate-wing { animation: wing 0.3s ease-in-out infinite; transform-origin: left center; }
        @keyframes spin-slot { 0% { transform: translateY(0); } 100% { transform: translateY(-100px); } }
        .animate-spin-slot { animation: spin-slot 0.05s infinite linear; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1A241A; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #6FAAAA; border-radius: 10px; }
      `}</style>
    </div>
  )
}