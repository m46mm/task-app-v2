'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vriifilccnczqiuthqiw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyaWlmaWxjY25jenFpdXRocWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NzUxNTUsImV4cCI6MjEwNDI1MTE1NX0.bGmSpCWXXhymvHb3psDA80P80cngVuPjXx3uuYLEPWA'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [currentPassword, setCurrentPassword] = useState('himitsu123') // 初期パスワード
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [newPasswordInput, setNewPasswordInput] = useState('')

  const [tasks, setTasks] = useState([])
  const [newTaskText, setNewTaskText] = useState('')
  
  // 今日付をデフォルトにする (YYYY-MM-DD形式)
  const todayStr = new Date().toISOString().split('T')[0]
  const [newTaskDate, setNewTaskDate] = useState(todayStr)

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks()
    }
  }, [isAuthenticated])

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('task_date', { ascending: true })
    
    if (error) {
      console.error('タスクの取得に失敗しました:', error)
    } else {
      setTasks(data || [])
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (passwordInput === currentPassword) {
      setIsAuthenticated(true)
    } else {
      alert('パスワードが違います')
    }
  }

  const handlePasswordChange = (e) => {
    e.preventDefault()
    if (!newPasswordInput.trim()) {
      alert('新しいパスワードを入力してください')
      return
    }
    setCurrentPassword(newPasswordInput)
    setPasswordInput('')
    setNewPasswordInput('')
    setIsChangingPassword(false)
    alert('パスワードを変更しました！')
  }

  const addTask = async (e) => {
    e.preventDefault()
    if (!newTaskText.trim()) return

    const { error } = await supabase
      .from('tasks')
      .insert([{ 
        text: newTaskText, 
        done: false, 
        task_date: newTaskDate 
      }])

    if (error) {
      console.error('タスクの追加に失敗しました:', error)
    } else {
      setNewTaskText('')
      fetchTasks()
    }
  }

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

  // Googleカレンダーに予定を追加するリンクを開く
  const addToGoogleCalendar = (task) => {
    const title = encodeURIComponent(task.text)
    // 日付をカレンダー用にフォーマット (YYYYMMDD)
    const dateFormatted = task.task_date ? task.task_date.replace(/-/g, '') : todayStr.replace(/-/g, '')
    // 終日イベントとして登録するURL
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateFormatted}/${dateFormatted}`
    window.open(url, '_blank')
  }

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

  return (
    <main style={{ maxWidth: '650px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>✨ マイ・タスク管理 (Cloud Sync)</h1>
        <button
          onClick={() => setIsChangingPassword(!isChangingPassword)}
          style={{ background: '#4b5563', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
        >
          {isChangingPassword ? 'キャンセル' : 'パスワード変更'}
        </button>
      </div>

      {isChangingPassword && (
        <form onSubmit={handlePasswordChange} style={{ display: 'flex', gap: '8px', marginTop: '15px', background: '#f3f4f6', padding: '12px', borderRadius: '6px' }}>
          <input
            type="password"
            placeholder="新しいパスワードを入力..."
            value={newPasswordInput}
            onChange={(e) => setNewPasswordInput(e.target.value)}
            style={{ flex: 1, padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <button type="submit" style={{ padding: '8px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            変更を保存
          </button>
        </form>
      )}
      
      <form onSubmit={addTask} style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="新しいタスクを入力..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          style={{ flex: 2, minWidth: '200px', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="date"
          value={newTaskDate}
          onChange={(e) => setNewTaskDate(e.target.value)}
          style={{ padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          追加
        </button>
      </form>

      <h2 style={{ marginTop: '30px', fontSize: '18px' }}>📝 タスク一覧（日付順）</h2>
      {tasks.length === 0 ? (
        <p style={{ color: '#666' }}>まだタスクはないよ！上の欄から追加してね。</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
          {tasks.map((task) => (
            <li key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #eee', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id, task.done)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div>
                  <span style={{ display: 'block', textDecoration: task.done ? 'line-through' : 'none', color: task.done ? '#888' : '#000', fontSize: '16px' }}>
                    {task.text}
                  </span>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    📅 {task.task_date || '日付未設定'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => addToGoogleCalendar(task)}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  title="Googleカレンダーに追加"
                >
                  カレンダーに追加
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
