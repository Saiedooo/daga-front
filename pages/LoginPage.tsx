import React, { useState } from 'react';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
        const result = await window.electron.auth.login(username, password);
        onLogin(result.user);
    } catch (err: any) {
        setError(err.message || 'اسم المستخدم أو كلمة المرور غير صحيحة.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm bg-surface p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">
          نظام إدارة الشكاوى
        </h1>
        <p className="text-center text-text-secondary mb-8">
          الرجاء تسجيل الدخول للمتابعة
        </p>
        <form onSubmit={handleLogin}>
          {error && <p className="bg-red-100 text-red-700 p-2 rounded-md mb-4 text-sm text-center">{error}</p>}
          <div className="mb-4">
            <label htmlFor="username-input" className="block mb-2 text-sm font-medium text-text-primary">
              اسم المستخدم
            </label>
            <input
              type="text"
              id="username-input"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              className="bg-background-muted border border-border text-text-primary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
              required
              autoFocus
              disabled={isLoading}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password-input" className="block mb-2 text-sm font-medium text-text-primary">
              كلمة المرور
            </label>
            <input
              type="password"
              id="password-input"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('');
              }}
              className="bg-background-muted border border-border text-text-primary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="w-full text-white bg-primary hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;