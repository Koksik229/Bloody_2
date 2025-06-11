import React, { useState } from 'react'
import '../styles/Login.css'

const API = import.meta.env.VITE_API_URL

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async () => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)

    const res = await fetch(`${API}/login`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })

    const data = await res.json()
    if (res.ok) {
      setMessage('✅ Добро пожаловать, ' + data.nickname)
    } else {
      setMessage('❌ ' + (data.detail || 'Ошибка входа'))
    }
  }

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setMessage('❌ Пароли не совпадают')
      return
    }

    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    formData.append('email', email)
    formData.append('nickname', nickname)

    const res = await fetch(`${API}/register`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })

    const data = await res.json()
    if (res.ok) {
      setMessage('✅ Регистрация прошла успешно')
      setIsRegistering(false)
    } else {
      setMessage('❌ ' + (data.detail || 'Ошибка регистрации'))
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>{isRegistering ? 'Регистрация' : 'Вход в BloodyWorld'}</h1>
        
        <input
          type="text"
          placeholder="Логин"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {isRegistering && (
          <>
            <input
              type="password"
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Никнейм"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
            />
          </>
        )}

        {!isRegistering ? (
          <>
            <button onClick={handleLogin}>Войти</button>
            <button className="register-btn" onClick={() => setIsRegistering(true)}>Регистрация</button>
          </>
        ) : (
          <>
            <button onClick={handleRegister}>Зарегистрироваться</button>
            <button className="register-btn" onClick={() => setIsRegistering(false)}>Назад</button>
          </>
        )}

        <div className="login-message">{message}</div>
      </div>
    </div>
  )
}

export default Login
