'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [currentPassword, setCurrentPassword] = useState('himitsu123')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [newPasswordInput, setNewPasswordInput] = useState('')

  const [tasks, setTasks] = useState([])
  const [newTaskText, setNewTaskText] = useState('')
  
  const todayStr = new Date().toISOString().split('T')[0]
  const [newTaskDate, setNewTaskDate] = useState(todayStr)
  const [newTaskTime, setNewTaskTime] = useState('')
  const [newTaskTag, setNewTaskTag] = useState('仕事')

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks()
    }
  }, [isAuthenticated])

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('カレンダー')
      .select('*')
    
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
      .from('カレンダー')
      .insert([{ 
        text: newTaskText, 
        done: false, 
        task_date: newTaskDate || null,
        task_time: newTaskTime || null,
        tag: newTaskTag || 'その他'
      }])

    if (error) {
      console.error('タスクの追加に失敗しました:', error)
      alert('タスクの追加に失敗しました。')
    } else {
      setNewTaskText('')
      setNewTaskTime('')
      fetchTasks()
    }
  }

  const toggleTask = async (id, currentDone) => {
    const { error } = await supabase
      .from('カレンダー')
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
      .from('カレンダー')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('タスクの削除に失敗しました:', error)
    } else {
      fetchTasks()
    }
  }

  const addToGoogleCalendar = (task) => {
    const title = encodeURIComponent(task.text)
    const dateFormatted = task.task_date ? task.task_date.replace(/-/g, '') : todayStr.replace(/-/g, '')
    
    let url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}`
    if (task.task_time) {
      const timeCleaned = task.task_time.replace(/:/g, '') + '00'
      url += `&dates=${dateFormatted}T${timeCleaned}/${dateFormatted}T${timeCleaned}`
    } else {
      url += `&dates=${dateFormatted}/${dateFormatted}`
    }
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
    <main style={{ maxWidth: '700px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
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
      
      <form onSubmit={addTask} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', background: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <input
          type="text"
          placeholder="新しいタスクを入力..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          style={{ padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="date"
            value={newTaskDate}
            onChange={(e) => setNewTaskDate(e.target.value)}
            style={{ padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }}
          />
          <input
            type="time"
            value={newTaskTime}
            onChange={(e) => setNewTaskTime(e.target.value)}
            style={{ padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }}
          />
          <select
            value={newTaskTag}
            onChange={(e) => setNewTaskTag(e.target.value)}
            style={{ padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }}
          >
            <option value="仕事">💼 仕事</option>
            <option value="プライベート">🏠 プライベート</option>
            <option value="勉強">📚 勉強</option>
            <option value="買い物">🛒 買い物</option>
            <option value="その他">📌 その他</option>
          </select>
        </div>
        <button type="submit" style={{ padding: '10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          タスクを追加
        </button>
      </form>

      <h2 style={{ marginTop: '30px', fontSize: '18px' }}>📝 タスク一覧</h2>
      {tasks.length === 0 ? (
        <p style={{ color: '#666' }}>まだタスクはないよ！上の欄から追加してね。</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
          {tasks.map((task) => (
            <li key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #eee', gap: '10px', background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id, task.done)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', color: '#374151' }}>
                      {task.tag || 'その他'}
                    </span>
                    <span style={{ textDecoration: task.done ? 'line-through' : 'none', color: task.done ? '#888' : '#000', fontSize: '16px' }}>
                      {task.text}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    📅 {task.task_date || '日付未設定'} {task.task_time ? `🕒 ${task.task_time}` : ''}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => addToGoogleCalendar(task)}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  title="Googleカレンダーに追加"
                >
                  カレンダー
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
