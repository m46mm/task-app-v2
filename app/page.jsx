'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Supabaseの接続情報（自分のURLとキーに書き換えてね）
const supabaseUrl = 'https://vriifilccnczqiuthqiw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyaWlmaWxjY25jenFpdXRocWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NzUxNTUsImV4cCI6MjEwNDI1MTE1NX0.bGmSpCWXXhymvHb3psDA80P80cngVuPjXx3uuYLEPWA'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [tasks, setTasks] = useState([])
  const [newTaskText, setNewTaskText] = useState('')

  // ログイン後にSupabaseからタスクを読み込む
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks()
    }
  }, [isAuthenticated])

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('id', { ascending: true })
    
    if (error) {
      console.error('タスクの取得に失敗しました:', error)
    } else {
      setTasks(data || [])
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (passwordInput === 'himitsu123') {
      setIsAuthenticated(true)
    } else {
      alert('パスワードが違います')
    }
  }

  // タスクの追加
  const addTask = async (e) => {
    e.preventDefault()
    if (!newTaskText.trim()) return

    const { error } = await supabase
      .from('tasks')
      .insert([{ text: newTaskText, done: false }])

    if (error) {
      console.error('タスクの追加に失敗しました:', error)
    } else {
      setNewTaskText('')
      fetchTasks()
    }
  }

  // タスクの完了状態の切り替え
  const toggleTask = async (id, currentDone) => {
    const { error } = await supabase
      .from('tasks')
      .update({ done: !currentDone })
      .eq('id', id)

    if (error) {
      console.error('タスクの更新に失敗しました:', error)
    } else {
      fetchTasks()
    }
  }

  // タスクの削除
  const deleteTask = async (id) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('タスクの削除に失敗しました:', error)
    } else {
      fetchTasks()
    }
  }

  // パスワード認証画面
  if (!isAuthenticated) {
    return (
      <main style={{ maxWidth: '400px', margin: '80px auto', padding: '20px', fontFamily: 'sans-serif' }}>
        <h2>🔐 秘密のログイン</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <input
            type="password"
            placeholder="パスワードを入力..."
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            style={{ flex: 1, padding: '8px', fontSize: '16px' }}
          />
          <button type="submit" style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px' }}>
            入室
          </button>
        </form>
      </main>
    )
  }

  // タスク管理画面
  return (
    <main style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>✨ マイ・タスク管理 (Cloud Sync)</h1>
      
      <form onSubmit={addTask} style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
        <input
          type="text"
          placeholder="新しいタスクを入力..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          style={{ flex: 1, padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          追加
        </button>
      </form>

      <h2 style={{ marginTop: '30px', fontSize: '18px' }}>📝 今日のタスク</h2>
      {tasks.length === 0 ? (
        <p style={{ color: '#666' }}>まだタスクはないよ！上の欄から追加してね。</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
          {tasks.map((task) => (
            <li key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id, task.done)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ textDecoration: task.done ? 'line-through' : 'none', color: task.done ? '#888' : '#000' }}>
                  {task.text}
                </span>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
