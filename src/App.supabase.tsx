import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export default function App() {
  const [todos, setTodos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getTodos() {
      try {
        const { data: todos } = await supabase.from('todos').select()
        if (todos) {
          setTodos(todos)
        }
      } finally {
        setLoading(false)
      }
    }

    getTodos()
  }, [])

  if (loading) return <div>Loading...</div>
  return (
    <ul>
      {todos.map((todo: any) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  )
}