import React, { useState } from 'react'
import '../styles/Login.css'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL

const Login = () => {
  const { setUser, fetchUser } = useAuth()

  const [isRegistering, setIsRegistering] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)

    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      const data = await res.json()
      if (res.ok) {
        console.log('Login response:', data);
        localStorage.setItem('access_token', data.access_token);
        await fetchUser();
      } else {
        console.error('Login failed:', data);
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
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
    formData.append('confirm_password', confirmPassword)
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
        {error && <div className="login-error">{error}</div>}
      </div>
    </div>
  )
}

export default Login
