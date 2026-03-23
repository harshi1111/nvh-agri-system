'use client'

import { useState, useEffect } from 'react'
import { 
  X, Leaf, Users, MapPin, Plus, Edit2, Trash2, CheckCircle, Circle, 
  Calendar, AlertCircle, Search, ChevronDown, ChevronRight, BookOpen,
  Clock, ArrowLeft, Filter
} from 'lucide-react'
import { getFarmTodos, createFarmTodo, updateFarmTodo, deleteFarmTodo, toggleFarmTodoComplete, FarmTodo } from '@/lib/actions/farmTodos'
import { toast } from 'react-hot-toast'

// Journal Entry Interface
interface JournalEntry {
  id: number
  date: string
  title: string
  content: string
  mood?: string
  createdAt: string
}

interface FarmTasksModalProps {
  isOpen: boolean
  onClose: () => void
  customers: any[]
}

// Journal Modal Component (inside FarmTasks)
function JournalSection({ isOpen, onClose, entries, onSave, onDelete }: { 
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
  const [animateIn, setAnimateIn] = useState(false)

  const moods = ['🌱 Productive', '🌧️ Tired', '☀️ Energetic', '🌾 Grateful', '💭 Reflective']

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimateIn(true), 50)
    } else {
      setAnimateIn(false)
    }
  }, [isOpen])

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
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div 
        className={`bg-gradient-to-br from-[#0A100A] to-[#1A2A1A] border border-[#D4AF37]/30 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl transform transition-all duration-300 ${
          animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#D4AF37]/20 bg-gradient-to-r from-[#D4AF37]/10 to-transparent">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-semibold text-white">Farm Journal</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#D4AF37]/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400 hover:text-[#D4AF37]" />
          </button>
        </div>
        
        <div className="flex h-[calc(85vh-70px)]">
          {/* Sidebar */}
          <div className="w-80 border-r border-[#AD8B6D]/20 flex flex-col bg-black/20">
            <div className="p-3 border-b border-[#AD8B6D]/20">
              <button onClick={handleNewEntry} className="w-full py-2 rounded-lg bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/5 text-[#D4AF37] text-sm font-medium hover:from-[#D4AF37]/30 hover:to-[#D4AF37]/10 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 border border-[#D4AF37]/30">
                <Plus className="w-4 h-4" /> New Entry
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {entries.length === 0 ? (
                <div className="text-center text-gray-500 text-xs py-8">No journal entries yet.<br />Click "New Entry" to start.</div>
              ) : (
                [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                  <div 
                    key={entry.id} 
                    onClick={() => handleEditEntry(entry)} 
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] ${selectedEntry?.id === entry.id && isEditing ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/50 shadow-lg' : 'bg-[#0A120A] hover:bg-[#D4AF37]/10 border border-transparent hover:border-[#D4AF37]/30'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#D4AF37]">{entry.mood || '📝'}</span>
                      <span className="text-[10px] text-gray-500">{entry.date}</span>
                    </div>
                    <p className="text-sm font-medium text-white truncate">{entry.title}</p>
                    <p className="text-[10px] text-gray-500 truncate mt-1">{entry.content.substring(0, 60)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Editor */}
          <div className="flex-1 flex flex-col bg-black/30">
            {isEditing ? (
              <div className="flex-1 flex flex-col p-5 space-y-4">
                <input 
                  type="text" 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                  placeholder="Entry title..." 
                  className="w-full bg-[#0A120A] text-white text-lg font-medium rounded-lg px-4 py-2 border border-[#AD8B6D]/30 focus:outline-none focus:border-[#AD8B6D]" 
                />
                <div className="flex gap-3">
                  <div className="flex items-center gap-2 bg-[#0A120A] rounded-lg px-3 py-1.5 border border-[#AD8B6D]/30">
                    <Calendar className="w-4 h-4 text-[#AD8B6D]" />
                    <input 
                      type="date" 
                      value={editDate} 
                      onChange={(e) => setEditDate(e.target.value)} 
                      className="bg-transparent text-white text-xs focus:outline-none" 
                    />
                  </div>
                  {/* Mood dropdown with gold theme */}
                  <div className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37]/10 to-transparent rounded-lg px-3 py-1.5 border border-[#D4AF37]/30">
                    <span className="text-sm">😊</span>
                    <select 
                      value={editMood} 
                      onChange={(e) => setEditMood(e.target.value)} 
                      className="bg-transparent text-[#D4AF37] text-xs focus:outline-none cursor-pointer"
                    >
                      {moods.map(mood => (<option key={mood} value={mood} className="bg-[#0A120A] text-white">{mood}</option>))}
                    </select>
                  </div>
                </div>
                <textarea 
                  value={editContent} 
                  onChange={(e) => setEditContent(e.target.value)} 
                  placeholder="Write your journal entry here..." 
                  className="flex-1 w-full bg-[#0A120A] text-gray-300 text-sm rounded-lg px-4 py-3 border border-[#AD8B6D]/30 focus:outline-none focus:border-[#AD8B6D] resize-none" 
                  rows={8} 
                />
                <div className="flex gap-3">
                  <button onClick={handleSave} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#C6A032] text-black text-sm font-medium hover:from-[#E5C158] hover:to-[#D4AF37] transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20">
                    <CheckCircle className="w-4 h-4" /> Save Entry
                  </button>
                  {selectedEntry?.id && (
                    <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-all duration-300 hover:scale-105 flex items-center gap-2 border border-red-500/30 hover:border-red-500/50">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <BookOpen className="w-12 h-12 text-[#AD8B6D]/30 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Select an entry from the left</p>
                  <p className="text-gray-600 text-xs mt-1">or click "New Entry" to start writing</p>
                </div>
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

export default function FarmTasksModal({ isOpen, onClose, customers }: FarmTasksModalProps) {
  const [selectedFarmer, setSelectedFarmer] = useState<string>('')
  const [farms, setFarms] = useState<any[]>([])
  const [selectedFarm, setSelectedFarm] = useState<any>(null)
  const [plots, setPlots] = useState<any[]>([])
  const [tasks, setTasks] = useState<Record<string, FarmTodo[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [addingTaskFor, setAddingTaskFor] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<FarmTodo | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; taskId: string | null; taskTitle: string }>({ show: false, taskId: null, taskTitle: '' })
  const [animateIn, setAnimateIn] = useState(false)
  const [searchCompleted, setSearchCompleted] = useState('')
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())
  const [isJournalOpen, setIsJournalOpen] = useState(false)
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    { id: 1, date: new Date().toISOString().split('T')[0], title: 'Farm Notes', content: 'Started organizing farm tasks.', mood: '🌱 Productive', createdAt: new Date().toISOString() }
  ])

  // Form state
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [taskDueTime, setTaskDueTime] = useState('')

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimateIn(true), 50)
    } else {
      setAnimateIn(false)
      setSelectedFarm(null)
      setSelectedFarmer('')
    }
  }, [isOpen])

  // Load farms when farmer changes
  useEffect(() => {
    if (selectedFarmer) {
      const farmer = customers.find(c => c.id === selectedFarmer)
      if (farmer) {
        setFarms(farmer.projects || [])
      }
    }
  }, [selectedFarmer, customers])

  // Fetch plots for a farm
  const fetchPlotsForFarm = async (farmId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/projects/${farmId}/plots`)
      const data = await response.json()
      console.log('Fetched plots:', data)
      setPlots(data || [])
      if (data && data.length > 0) {
        loadTasksForPlots(data.map((p: any) => p.id))
      }
    } catch (error) {
      console.error('Error fetching plots:', error)
      setPlots([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadTasksForPlots = async (plotIds: string[]) => {
    setIsLoading(true)
    try {
      const tasksMap: Record<string, FarmTodo[]> = {}
      for (const plotId of plotIds) {
        const tasksData = await getFarmTodos(plotId)
        tasksMap[plotId] = tasksData
      }
      setTasks(tasksMap)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load plots and tasks when farm is selected
  useEffect(() => {
    if (selectedFarm) {
      console.log('Selected farm:', selectedFarm)
      
      if (selectedFarm.plots && selectedFarm.plots.length > 0) {
        setPlots(selectedFarm.plots)
        loadTasksForPlots(selectedFarm.plots.map((p: any) => p.id))
      } else {
        console.log('No plots in farm, fetching from API...')
        fetchPlotsForFarm(selectedFarm.id)
      }
    }
  }, [selectedFarm])

  const resetForm = () => {
    setTaskTitle('')
    setTaskDescription('')
    setTaskDueDate('')
    setTaskDueTime('')
  }

  const handleAddTask = async (plotId: string) => {
    console.log('=== handleAddTask called ===');
    console.log('plotId:', plotId);
    console.log('taskTitle:', taskTitle);
    console.log('taskDescription:', taskDescription);
    console.log('taskDueDate:', taskDueDate);
    console.log('taskDueTime:', taskDueTime);
    
    if (!taskTitle.trim()) {
      toast.error('Please enter a task title')
      console.log('Task title is empty, returning');
      return
    }

    const dueDateTime = taskDueDate && taskDueTime 
      ? `${taskDueDate}T${taskDueTime}:00`
      : taskDueDate || null

    console.log('dueDateTime:', dueDateTime);

    const formData = new FormData()
    formData.append('plot_id', plotId)
    formData.append('title', taskTitle)
    formData.append('description', taskDescription)
    if (dueDateTime) formData.append('due_date', dueDateTime)
    formData.append('reminder_enabled', 'false')

    console.log('About to call createFarmTodo');
    const result = await createFarmTodo(formData)
    console.log('createFarmTodo result:', result);
    
    if (result.error) {
      toast.error(result.error)
      console.log('Error from createFarmTodo:', result.error);
    } else if (result.todo) {
      console.log('Task created successfully:', result.todo);
      setTasks(prev => {
        const updated = {
          ...prev,
          [plotId]: [result.todo, ...(prev[plotId] || [])]
        };
        console.log('Updated tasks state:', updated);
        return updated;
      })
      toast.success('Task added!')
      resetForm()
      setAddingTaskFor(null)
    } else {
      console.log('No todo returned and no error');
    }
  }

  const handleUpdateTask = async () => {
    if (!editingTask) return
    if (!taskTitle.trim()) {
      toast.error('Please enter a task title')
      return
    }

    const dueDateTime = taskDueDate && taskDueTime 
      ? `${taskDueDate}T${taskDueTime}:00`
      : taskDueDate || null

    const formData = new FormData()
    formData.append('title', taskTitle)
    formData.append('description', taskDescription)
    if (dueDateTime) formData.append('due_date', dueDateTime)
    formData.append('reminder_enabled', 'false')
    formData.append('completed', String(editingTask.completed))

    const result = await updateFarmTodo(editingTask.id, formData)
    if (result.error) {
      toast.error(result.error)
    } else if (result.todo) {
      setTasks(prev => ({
        ...prev,
        [editingTask.plot_id]: prev[editingTask.plot_id].map(t => 
          t.id === editingTask.id ? result.todo : t
        )
      }))
      toast.success('Task updated!')
      resetForm()
      setEditingTask(null)
    }
  }

  const startEdit = (task: FarmTodo) => {
    setEditingTask(task)
    setTaskTitle(task.title)
    setTaskDescription(task.description || '')
    if (task.due_date) {
      const dueDate = new Date(task.due_date)
      setTaskDueDate(dueDate.toISOString().split('T')[0])
      setTaskDueTime(dueDate.toTimeString().slice(0, 5))
    } else {
      setTaskDueDate('')
      setTaskDueTime('')
    }
  }

  const handleToggleComplete = async (task: FarmTodo) => {
    const result = await toggleFarmTodoComplete(task.id, !task.completed)
    if (result.success && result.todo) {
      setTasks(prev => ({
        ...prev,
        [task.plot_id]: prev[task.plot_id].map(t => t.id === task.id ? result.todo : t)
      }))
      if (!task.completed) {
        toast.success(`✅ ${task.title} completed!`)
      }
    }
  }

  const confirmDelete = (task: FarmTodo) => {
    setDeleteConfirm({ show: true, taskId: task.id, taskTitle: task.title })
  }

  const handleDeleteTask = async () => {
    if (!deleteConfirm.taskId) return
    
    const result = await deleteFarmTodo(deleteConfirm.taskId)
    if (result.success) {
      for (const [plotId, tasksList] of Object.entries(tasks)) {
        if (tasksList.some(t => t.id === deleteConfirm.taskId)) {
          setTasks(prev => ({
            ...prev,
            [plotId]: prev[plotId].filter(t => t.id !== deleteConfirm.taskId)
          }))
          break
        }
      }
      toast.success('Task deleted')
    }
    setDeleteConfirm({ show: false, taskId: null, taskTitle: '' })
  }

  const getDueDateStatus = (dueDate: string | null) => {
    if (!dueDate) return null
    const today = new Date()
    const due = new Date(dueDate)
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { color: 'text-red-400', text: 'Overdue', icon: '🔴' }
    if (diffDays === 0) return { color: 'text-orange-400', text: 'Due today', icon: '⚠️' }
    if (diffDays <= 3) return { color: 'text-yellow-400', text: `${diffDays} days left`, icon: '📅' }
    return { color: 'text-green-400', text: `${diffDays} days left`, icon: '✅' }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getMonthKey = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${date.getMonth() + 1}`
  }

  const getMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  }

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => {
      const newSet = new Set(prev)
      if (newSet.has(monthKey)) {
        newSet.delete(monthKey)
      } else {
        newSet.add(monthKey)
      }
      return newSet
    })
  }

  // Organize tasks by category
  const organizeTasks = (tasksList: FarmTodo[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    const todayTasks: FarmTodo[] = []
    const upcomingTasks: FarmTodo[] = []
    const laterTasks: FarmTodo[] = []
    const completedTasks: FarmTodo[] = []
    
    tasksList.forEach(task => {
      if (task.completed) {
        completedTasks.push(task)
        return
      }
      
      if (!task.due_date) {
        laterTasks.push(task)
        return
      }
      
      const dueDate = new Date(task.due_date)
      dueDate.setHours(0, 0, 0, 0)
      
      if (dueDate.getTime() === today.getTime()) {
        todayTasks.push(task)
      } else if (dueDate < tomorrow) {
        todayTasks.push(task) // overdue goes to today
      } else if (dueDate <= nextWeek) {
        upcomingTasks.push(task)
      } else {
        laterTasks.push(task)
      }
    })
    
    return { todayTasks, upcomingTasks, laterTasks, completedTasks }
  }

  // Group completed tasks by month
  const groupCompletedByMonth = (completedTasks: FarmTodo[]) => {
    const groups: Record<string, FarmTodo[]> = {}
    completedTasks.forEach(task => {
      if (task.completed && task.due_date) {
        const monthKey = getMonthKey(task.due_date)
        if (!groups[monthKey]) groups[monthKey] = []
        groups[monthKey].push(task)
      } else if (task.completed) {
        const monthKey = getMonthKey(task.created_at)
        if (!groups[monthKey]) groups[monthKey] = []
        groups[monthKey].push(task)
      }
    })
    
    // Sort months descending
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }

  const handleSaveJournalEntry = (entry: JournalEntry) => {
    setJournalEntries(prev => {
      const existing = prev.find(e => e.id === entry.id)
      if (existing) {
        return prev.map(e => e.id === entry.id ? entry : e)
      }
      return [...prev, entry]
    })
    toast.success('Journal entry saved')
  }

  const handleDeleteJournalEntry = (id: number) => {
    setJournalEntries(prev => prev.filter(e => e.id !== id))
    toast.success('Journal entry deleted')
  }

  if (!isOpen) return null

  // If a farm is selected, show plots view
  if (selectedFarm) {
    const allTasks = plots.flatMap(plot => tasks[plot.id] || [])
    const { todayTasks, upcomingTasks, laterTasks, completedTasks } = organizeTasks(allTasks)
    const completedGroups = groupCompletedByMonth(completedTasks)
    
    const filteredCompleted = searchCompleted
      ? completedTasks.filter(t => 
          t.title.toLowerCase().includes(searchCompleted.toLowerCase()) ||
          (t.description && t.description.toLowerCase().includes(searchCompleted.toLowerCase()))
        )
      : completedTasks
    
    const filteredGroups = searchCompleted
      ? [['search', filteredCompleted] as [string, FarmTodo[]]]
      : completedGroups

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedFarm(null)}>
        <div 
          className={`relative w-full max-w-5xl h-[85vh] bg-gradient-to-br from-[#0A100A] to-[#1A2A1A] border border-[#D4AF37]/30 rounded-2xl shadow-2xl flex flex-col transform transition-all duration-300 ${
            animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/20 bg-black/40 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedFarm(null)} className="p-1 hover:bg-[#D4AF37]/10 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <Leaf className="w-6 h-6 text-[#D4AF37]" />
              <div>
                <h2 className="text-xl font-bold text-white">{selectedFarm.name}</h2>
                <p className="text-xs text-gray-400">Tasks by Plot/Acre</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                    console.log('Journal button clicked, setting isJournalOpen to true');
                    setIsJournalOpen(true);
                }}
                className="p-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/30 rounded-lg transition-all duration-300 hover:scale-110 group"
                title="Journal"
              >
                <BookOpen className="w-5 h-5 text-[#D4AF37] group-hover:rotate-12 transition-transform duration-300" />
              </button>
              <button onClick={() => setSelectedFarm(null)} className="p-2 hover:bg-[#D4AF37]/10 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* ========== PLOTS/ACRE GRID WITH ADD TASK BUTTONS ========== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plots.length === 0 ? (
                <div className="col-span-full text-center py-8 bg-black/20 rounded-xl">
                  <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">No plots or acres found for this farm.</p>
                  <p className="text-xs text-gray-600 mt-1">Add plots/acre to this farm first.</p>
                </div>
              ) : (
                plots.map(plot => {
                  const plotTasks = tasks[plot.id] || []
                  const pendingCount = plotTasks.filter(t => !t.completed).length
                  const recentTasks = plotTasks.filter(t => !t.completed).slice(0, 2)
                  
                  return (
                    <div key={plot.id} className="bg-black/30 border border-[#D4AF37]/20 rounded-xl p-4 hover:border-[#D4AF37]/40 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#D4AF37]" />
                          <h4 className="text-white font-medium">
                            {plot.type === 'plot' ? `Plot ${plot.plot_number}` : `Acre ${plot.acre_number}`}
                          </h4>
                        </div>
                        <span className="text-xs text-yellow-400">{pendingCount} pending</span>
                      </div>
                      
                      {plot.type === 'plot' && plot.cent && (
                        <p className="text-xs text-gray-400 mb-2">Cent: {plot.cent}</p>
                      )}
                      {plot.type === 'acre' && plot.acre && (
                        <p className="text-xs text-gray-400 mb-2">Acre: {plot.acre}</p>
                      )}
                      
                      {/* Add Task Button */}
                      {addingTaskFor === plot.id ? (
                        <div className="mt-2 p-2 bg-[#0A120A] rounded-lg border border-[#D4AF37]/30">
                          <input
                            type="text"
                            placeholder="Task title..."
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            className="w-full bg-transparent text-white text-xs rounded px-2 py-1.5 border border-[#D4AF37]/30 focus:outline-none focus:border-[#D4AF37] mb-2"
                            autoFocus
                          />
                          <input
                            type="text"
                            placeholder="Description (optional)"
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            className="w-full bg-transparent text-gray-300 text-xs rounded px-2 py-1.5 border border-[#D4AF37]/30 focus:outline-none focus:border-[#D4AF37] mb-2"
                          />
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <input
                              type="date"
                              value={taskDueDate}
                              onChange={(e) => setTaskDueDate(e.target.value)}
                              className="bg-black/50 text-white text-xs rounded px-2 py-1 border border-[#D4AF37]/30"
                              placeholder="Due date"
                            />
                            <input
                              type="time"
                              value={taskDueTime}
                              onChange={(e) => setTaskDueTime(e.target.value)}
                              className="bg-black/50 text-white text-xs rounded px-2 py-1 border border-[#D4AF37]/30"
                              placeholder="Time"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleAddTask(plot.id)} className="flex-1 bg-[#D4AF37] text-black text-xs py-1 rounded hover:bg-[#C6A032]">Add</button>
                            <button onClick={() => { setAddingTaskFor(null); resetForm(); }} className="flex-1 border border-gray-600 text-gray-300 text-xs py-1 rounded hover:bg-gray-800">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={()  => {
                            console.log('Add Task clicked for plot:', plot.id);
                            setAddingTaskFor(plot.id);
                          }}
                          className="w-full mt-2 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37]/10 to-transparent text-[#D4AF37] text-xs hover:from-[#D4AF37]/20 hover:to-[#D4AF37]/5 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-1 border border-[#D4AF37]/30 hover:border-[#D4AF37]/60"
                        >
                          <Plus className="w-3 h-3" /> Add Task
                        </button>
                      )}
                      
                      {/* Show recent tasks for this plot */}
                      {recentTasks.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-[10px] text-gray-500">Recent tasks:</p>
                          {recentTasks.map(task => {
                            const dueStatus = getDueDateStatus(task.due_date)
                            return (
                              <div key={task.id} className="flex items-center justify-between p-1.5 bg-black/20 rounded-lg text-xs">
                                <div className="flex-1 min-w-0">
                                  <p className="text-gray-300 truncate text-[10px]">{task.title}</p>
                                  {dueStatus && (
                                    <p className={`text-[8px] ${dueStatus.color}`}>{dueStatus.icon} {dueStatus.text}</p>
                                  )}
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleToggleComplete(task); }} className="ml-1">
                                  <Circle className="w-3 h-3 text-gray-500 hover:text-[#D4AF37]" />
                                </button>
                              </div>
                            )
                          })}
                          {plotTasks.filter(t => !t.completed).length > 2 && (
                            <p className="text-[9px] text-gray-500 text-center">+{plotTasks.filter(t => !t.completed).length - 2} more</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Today's Tasks */}
            {todayTasks.length > 0 && (
              <div className="bg-black/30 rounded-xl p-4 border-l-4 border-red-500">
                <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                  <span>🔴</span> Today's Tasks ({todayTasks.length})
                </h3>
                <div className="space-y-2">
                  {todayTasks.map(task => {
                    const dueStatus = getDueDateStatus(task.due_date)
                    const plot = plots.find(p => p.id === task.plot_id)
                    return (
                      <TaskItem
                        key={task.id}
                        task={task}
                        plotName={plot?.type === 'plot' ? `Plot ${plot.plot_number}` : `Acre ${plot.acre_number}`}
                        dueStatus={dueStatus}
                        onToggle={handleToggleComplete}
                        onEdit={startEdit}
                        onDelete={confirmDelete}
                        isEditing={editingTask?.id === task.id}
                        editingData={{ taskTitle, taskDescription, taskDueDate, taskDueTime }}
                        onEditingChange={(field, value) => {
                          if (field === 'title') setTaskTitle(value)
                          else if (field === 'description') setTaskDescription(value)
                          else if (field === 'dueDate') setTaskDueDate(value)
                          else if (field === 'dueTime') setTaskDueTime(value)
                        }}
                        onSaveEdit={handleUpdateTask}
                        onCancelEdit={() => { setEditingTask(null); resetForm(); }}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Upcoming Tasks (next 7 days) */}
            {upcomingTasks.length > 0 && (
              <div className="bg-black/30 rounded-xl p-4 border-l-4 border-yellow-500">
                <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                  <span>📅</span> Upcoming ({upcomingTasks.length})
                </h3>
                <div className="space-y-2">
                  {upcomingTasks.map(task => {
                    const dueStatus = getDueDateStatus(task.due_date)
                    const plot = plots.find(p => p.id === task.plot_id)
                    return (
                      <TaskItem
                        key={task.id}
                        task={task}
                        plotName={plot?.type === 'plot' ? `Plot ${plot.plot_number}` : `Acre ${plot.acre_number}`}
                        dueStatus={dueStatus}
                        onToggle={handleToggleComplete}
                        onEdit={startEdit}
                        onDelete={confirmDelete}
                        isEditing={editingTask?.id === task.id}
                        editingData={{ taskTitle, taskDescription, taskDueDate, taskDueTime }}
                        onEditingChange={(field, value) => {
                          if (field === 'title') setTaskTitle(value)
                          else if (field === 'description') setTaskDescription(value)
                          else if (field === 'dueDate') setTaskDueDate(value)
                          else if (field === 'dueTime') setTaskDueTime(value)
                        }}
                        onSaveEdit={handleUpdateTask}
                        onCancelEdit={() => { setEditingTask(null); resetForm(); }}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Later Tasks */}
            {laterTasks.length > 0 && (
              <div className="bg-black/30 rounded-xl p-4">
                <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                  <span>📌</span> Later ({laterTasks.length})
                </h3>
                <div className="space-y-2">
                  {laterTasks.map(task => {
                    const dueStatus = getDueDateStatus(task.due_date)
                    const plot = plots.find(p => p.id === task.plot_id)
                    return (
                      <TaskItem
                        key={task.id}
                        task={task}
                        plotName={plot?.type === 'plot' ? `Plot ${plot.plot_number}` : `Acre ${plot.acre_number}`}
                        dueStatus={dueStatus}
                        onToggle={handleToggleComplete}
                        onEdit={startEdit}
                        onDelete={confirmDelete}
                        isEditing={editingTask?.id === task.id}
                        editingData={{ taskTitle, taskDescription, taskDueDate, taskDueTime }}
                        onEditingChange={(field, value) => {
                          if (field === 'title') setTaskTitle(value)
                          else if (field === 'description') setTaskDescription(value)
                          else if (field === 'dueDate') setTaskDueDate(value)
                          else if (field === 'dueTime') setTaskDueTime(value)
                        }}
                        onSaveEdit={handleUpdateTask}
                        onCancelEdit={() => { setEditingTask(null); resetForm(); }}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Completed Tasks Section */}
            <div className="bg-black/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-semibold text-green-400 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Completed ({completedTasks.length})
                </h3>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search completed..."
                    value={searchCompleted}
                    onChange={(e) => setSearchCompleted(e.target.value)}
                    className="pl-7 pr-2 py-1 text-xs bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
              
              {searchCompleted && filteredCompleted.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-4">No matching completed tasks</p>
              ) : (
                <div className="space-y-3">
                  {filteredGroups.map(([monthKey, monthTasks]) => (
                    <div key={monthKey} className="border border-[#D4AF37]/20 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleMonth(monthKey)}
                        className="w-full flex items-center justify-between p-3 bg-black/40 hover:bg-black/60 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-300">{getMonthName(monthKey)}</span>
                        <span className="text-xs text-gray-500">{monthTasks.length} tasks</span>
                        {expandedMonths.has(monthKey) ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      {expandedMonths.has(monthKey) && (
                        <div className="p-3 space-y-2">
                          {monthTasks.map(task => {
                            const plot = plots.find(p => p.id === task.plot_id)
                            return (
                              <div key={task.id} className="flex items-start gap-2 p-2 bg-black/20 rounded-lg">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm text-gray-400 line-through">{task.title}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-[#D4AF37]">
                                      {plot?.type === 'plot' ? `Plot ${plot.plot_number}` : `Acre ${plot.acre_number}`}
                                    </span>
                                    {task.due_date && (
                                      <span className="text-[10px] text-gray-500">
                                        {formatDateTime(task.due_date)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                  {!searchCompleted && filteredGroups.length === 0 && (
                    <p className="text-center text-gray-500 text-sm py-4">No completed tasks yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Farms selection view
  return (
    <>
      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A100A] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <h3 className="text-lg font-semibold text-white">Delete Task</h3>
            </div>
            <p className="text-gray-300 text-sm mb-6">
              Delete "{deleteConfirm.taskTitle}"? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDeleteTask} className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600">Delete</button>
              <button onClick={() => setDeleteConfirm({ show: false, taskId: null, taskTitle: '' })} className="flex-1 border border-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-800">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Journal Modal */}
      <JournalSection
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        entries={journalEntries}
        onSave={handleSaveJournalEntry}
        onDelete={handleDeleteJournalEntry}
      />

      {/* Main Modal - Farms Selection */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
        <div 
          className={`relative w-full max-w-6xl h-[85vh] bg-gradient-to-br from-[#0A100A] to-[#1A2A1A] border border-[#D4AF37]/30 rounded-2xl shadow-2xl flex flex-col transform transition-all duration-300 ${
            animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/20 bg-black/40 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <Leaf className="w-6 h-6 text-[#D4AF37]" />
              <h2 className="text-xl font-bold text-white">Farm Tasks</h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsJournalOpen(true)}
                className="p-2 hover:bg-[#AD8B6D]/20 rounded-lg transition-colors"
                title="Journal"
              >
                <BookOpen className="w-5 h-5 text-[#AD8B6D]" />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-[#D4AF37]/10 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Farmer Selector - Gold theme dropdown */}
            <div className="bg-gradient-to-r from-[#D4AF37]/5 to-transparent rounded-xl p-4 mb-6 border border-[#D4AF37]/30">
              <label className="block text-sm font-medium text-[#D4AF37] mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#D4AF37]" />
                Select Farmer
              </label>
              <select
                value={selectedFarmer}
                onChange={(e) => setSelectedFarmer(e.target.value)}
                className="w-full bg-[#1A241A] border-2 border-[#D4AF37]/40 rounded-lg px-4 py-2.5 text-[#D4AF37] text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 transition-all duration-300"
              >
                <option value="" className="bg-[#0A120A] text-gray-400">Choose a farmer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#0A120A] text-white">{c.full_name}</option>
                ))}
              </select>
            </div>

            {/* Farms Grid */}
            {selectedFarmer && farms.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {farms.map(farm => {
                  const allTasks = (farm.plots || []).flatMap((plot: any) => tasks[plot.id] || [])
                  const pendingTasks = allTasks.filter((t: FarmTodo) => !t.completed)
                  const completedTasksCount = allTasks.filter((t: FarmTodo) => t.completed).length
                  
                  return (
                    <div 
                      key={farm.id} 
                      onClick={() => {
                        console.log('Farm clicked:', farm)
                        setSelectedFarm(farm)
                      }}
                      className="bg-black/30 border border-[#D4AF37]/20 rounded-xl p-5 hover:border-[#D4AF37]/60 hover:bg-black/40 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-[#D4AF37]" />
                          <h3 className="text-lg font-semibold text-white">{farm.name}</h3>
                        </div>
                        <span className="text-xs text-gray-500">{farm.plots?.length || 0} plots/acre</span>
                      </div>
                      
                      <div className="flex gap-4 mb-3">
                        <div>
                          <p className="text-2xl font-bold text-yellow-400">{pendingTasks.length}</p>
                          <p className="text-xs text-gray-400">Pending</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-400">{completedTasksCount}</p>
                          <p className="text-xs text-gray-400">Completed</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-xs text-[#D4AF37] group-hover:underline">View details →</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {selectedFarmer && farms.length === 0 && (
              <div className="text-center py-12 bg-black/20 rounded-xl">
                <Leaf className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">No farms found for this farmer.</p>
              </div>
            )}

            {!selectedFarmer && (
              <div className="text-center py-12 bg-black/20 rounded-xl">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">Select a farmer to view their farms and tasks.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// Task Item Component with proper types
function TaskItem({ 
  task, plotName, dueStatus, onToggle, onEdit, onDelete, 
  isEditing, editingData, onEditingChange, onSaveEdit, onCancelEdit 
}: { 
  task: FarmTodo
  plotName: string
  dueStatus: { color: string; text: string; icon: string } | null
  onToggle: (task: FarmTodo) => void
  onEdit: (task: FarmTodo) => void
  onDelete: (task: FarmTodo) => void
  isEditing: boolean
  editingData: { taskTitle: string; taskDescription: string; taskDueDate: string; taskDueTime: string }
  onEditingChange: (field: string, value: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
}) {
  if (isEditing) {
    return (
      <div className="bg-[#0A120A] rounded-lg p-3 border border-[#D4AF37]/30 mb-2">
        <input
          type="text"
          value={editingData.taskTitle}
          onChange={(e) => onEditingChange('title', e.target.value)}
          className="w-full bg-transparent text-white text-sm rounded px-3 py-2 border border-[#D4AF37]/30 focus:outline-none focus:border-[#D4AF37] mb-2"
          placeholder="Task title"
          autoFocus
        />
        <input
          type="text"
          value={editingData.taskDescription}
          onChange={(e) => onEditingChange('description', e.target.value)}
          className="w-full bg-transparent text-gray-300 text-sm rounded px-3 py-2 border border-[#D4AF37]/30 focus:outline-none focus:border-[#D4AF37] mb-2"
          placeholder="Description (optional)"
        />
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-2 bg-black/30 rounded-lg px-2 py-1">
            <Calendar className="w-3 h-3 text-gray-500" />
            <input
              type="date"
              value={editingData.taskDueDate}
              onChange={(e) => onEditingChange('dueDate', e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 bg-black/30 rounded-lg px-2 py-1">
            <Clock className="w-3 h-3 text-gray-500" />
            <input
              type="time"
              value={editingData.taskDueTime}
              onChange={(e) => onEditingChange('dueTime', e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onSaveEdit} className="flex-1 bg-[#D4AF37] text-black text-sm py-1.5 rounded-lg">Save</button>
          <button onClick={onCancelEdit} className="flex-1 border border-gray-600 text-gray-300 text-sm py-1.5 rounded-lg">Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2 p-2 bg-black/30 rounded-lg hover:bg-black/50 transition-colors group">
      <button onClick={() => onToggle(task)} className="mt-0.5 flex-shrink-0">
        {task.completed ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <Circle className="w-4 h-4 text-gray-500 hover:text-[#D4AF37]" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
            {task.title}
          </p>
          <span className="text-[10px] text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5 rounded">
            {plotName}
          </span>
        </div>
        {task.description && (
          <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
        )}
        {dueStatus && (
          <p className={`text-[10px] mt-1 ${dueStatus.color}`}>
            {dueStatus.icon} {dueStatus.text}
          </p>
        )}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(task)} className="p-1 hover:bg-[#D4AF37]/20 rounded transition-all duration-200 hover:scale-110">
          <Edit2 className="w-3 h-3 text-[#D4AF37] hover:text-[#E5C158]" />
        </button>
        <button onClick={() => onDelete(task)} className="p-1 hover:bg-red-500/20 rounded transition-all duration-200 hover:scale-110">
          <Trash2 className="w-3 h-3 text-red-400 hover:text-red-300" />
        </button>
      </div>
    </div>
  )
}