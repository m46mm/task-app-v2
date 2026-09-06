'use client';
import { useState } from 'react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'himitsu123') { // パスワードはここで変えられるよ
      setIsAuthenticated(true);
    } else {
      alert('パスワードがちがうよ！');
    }
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask, done: false }]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, done: !task.done } : task));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  if (!isAuthenticated) {
    return (
      <main style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
        <form onSubmit={handleLogin} style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h2>🔐 秘密のタスク管理</h2>
          <p>パスワードを入力してね</p>
          <input 
            type="password" 
            value={passwordInput} 
            onChange={(e) => setPasswordInput(e.target.value)} 
            placeholder="パスワード"
            style={{ padding: '10px', fontSize: '16px', marginRight: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ padding: '10px 20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>入室</button>
        </form>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>✨ マイ・タスク管理</h1>
      
      <form onSubmit={addTask} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={newTask} 
          onChange={(e) => setNewTask(e.target.value)} 
          placeholder="新しいタスクを入力..."
          style={{ flex: 1, padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>追加</button>
      </form>

      <h2>📝 今日のタスク</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.length === 0 && <p style={{ color: '#888' }}>まだタスクはないよ！上の欄から追加してね。</p>}
        {tasks.map(task => (
          <li key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '10px 15px', marginBottom: '8px', borderRadius: '5px', border: '1px solid #eee' }}>
            <span 
              onClick={() => toggleTask(task.id)} 
              style={{ textDecoration: task.done ? 'line-through' : 'none', color: task.done ? '#aaa' : '#000', cursor: 'pointer', flex: 1 }}
            >
              {task.done ? '✅ ' : '🔲 '}{task.text}
            </span>
            <button onClick={() => deleteTask(task.id)} style={{ background: '#ff4d4f', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>削除</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
