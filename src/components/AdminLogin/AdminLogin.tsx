import { useState } from 'react';
import './AdminLogin.css';

interface AdminLoginProps {
  onLogin: (password: string) => Promise<boolean>;
  onCancel: () => void;
}

export function AdminLogin({ onLogin, onCancel }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await onLogin(password);
    setLoading(false);
    if (!ok) {
      setError('密码不对哦~');
    }
  };

  return (
    <div className="admin-login-overlay" onClick={onCancel}>
      <div className="admin-login-modal" onClick={(e) => e.stopPropagation()}>
        <h3>🔐 管理员登录</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className="admin-password-input"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            autoFocus
          />
          {error && <p className="admin-login-error">{error}</p>}
          <div className="admin-login-buttons">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              取消
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !password}>
              {loading ? '验证中...' : '登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
