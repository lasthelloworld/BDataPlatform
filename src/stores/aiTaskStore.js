import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAITaskStore = defineStore('aiTask', () => {
  const tasks = ref([])

  const taskList = computed(() => tasks.value)

  const addTask = (task) => {
    const newTask = {
      id: Date.now().toString(),
      title: task.title || 'AI Analysis Task',
      createdAt: new Date().toISOString(),
      baselineProduct: task.baselineProduct || '',
      status: 'completed',
      context: task.context || {},
      messages: task.messages || [],
      htmlSnapshot: task.htmlSnapshot || '',
      filters: task.filters || {}
    }
    tasks.value.unshift(newTask)
    saveToStorage()
    return newTask.id
  }

  const getTaskById = (id) => {
    return tasks.value.find(task => task.id === id)
  }

  const deleteTask = (id) => {
    const index = tasks.value.findIndex(task => task.id === id)
    if (index > -1) {
      tasks.value.splice(index, 1)
      saveToStorage()
    }
  }

  const deleteTasks = (ids) => {
    tasks.value = tasks.value.filter(task => !ids.includes(task.id))
    saveToStorage()
  }

  const updateTask = (id, updates) => {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      Object.assign(task, updates)
      saveToStorage()
    }
  }

  const saveToStorage = () => {
    try {
      localStorage.setItem('ai_analysis_tasks', JSON.stringify(tasks.value))
    } catch (e) {
      console.error('Failed to save tasks to localStorage:', e)
    }
  }

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('ai_analysis_tasks')
      if (stored) {
        tasks.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Failed to load tasks from localStorage:', e)
    }
  }

  loadFromStorage()

  return {
    tasks,
    taskList,
    addTask,
    getTaskById,
    deleteTask,
    deleteTasks,
    updateTask
  }
})
