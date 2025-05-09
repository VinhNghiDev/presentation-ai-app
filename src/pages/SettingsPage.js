import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import './SettingsPage.css';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('account');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [preferences, setPreferences] = useState({
    language: 'vi',
    theme: 'light',
    notifications: {
      email: true,
      browser: true
    }
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = getCurrentUser();
        if (!userData) {
          navigate('/login');
          return;
        }
        setUser(userData);
        if (userData.preferences) {
          setPreferences(userData.preferences);
        }
      } catch (error) {
        setError('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setPreferences(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [name]: checked
        }
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('Mật khẩu mới không khớp');
      }

      // TODO: Implement change password API call
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Implement update preferences API call
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1>Cài đặt</h1>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="settings-content">
          <div className="settings-sidebar">
            <button
              className={`sidebar-item ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              <i className="bi bi-person"></i>
              Tài khoản
            </button>
            <button
              className={`sidebar-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <i className="bi bi-shield-lock"></i>
              Bảo mật
            </button>
            <button
              className={`sidebar-item ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <i className="bi bi-gear"></i>
              Tùy chọn
            </button>
            <button
              className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <i className="bi bi-bell"></i>
              Thông báo
            </button>
          </div>

          <div className="settings-main">
            {activeTab === 'account' && (
              <div className="settings-section">
                <h2>Thông tin tài khoản</h2>
                <div className="account-info">
                  <div className="info-item">
                    <label>Gói đăng ký</label>
                    <div className="subscription-badge">
                      {user?.subscription || 'Free'}
                    </div>
                  </div>
                  <div className="info-item">
                    <label>Ngày hết hạn</label>
                    <p>{user?.subscriptionExpires ? new Date(user.subscriptionExpires).toLocaleDateString('vi-VN') : 'Không có'}</p>
                  </div>
                  <button className="btn btn-primary">
                    Nâng cấp tài khoản
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-section">
                <h2>Bảo mật</h2>
                <form onSubmit={handlePasswordSubmit} className="password-form">
                  <div className="form-group">
                    <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="newPassword">Mật khẩu mới</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                  </button>
                </form>

                <div className="security-options">
                  <h3>Xác thực hai yếu tố</h3>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="enable2FA"
                      checked={false}
                      onChange={() => {}}
                    />
                    <label className="form-check-label" htmlFor="enable2FA">
                      Bật xác thực hai yếu tố
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="settings-section">
                <h2>Tùy chọn</h2>
                <form onSubmit={handlePreferencesSubmit} className="preferences-form">
                  <div className="form-group">
                    <label htmlFor="language">Ngôn ngữ</label>
                    <select
                      id="language"
                      name="language"
                      value={preferences.language}
                      onChange={handlePreferenceChange}
                      className="form-select"
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="theme">Giao diện</label>
                    <select
                      id="theme"
                      name="theme"
                      value={preferences.theme}
                      onChange={handlePreferenceChange}
                      className="form-select"
                    >
                      <option value="light">Sáng</option>
                      <option value="dark">Tối</option>
                    </select>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="settings-section">
                <h2>Thông báo</h2>
                <form onSubmit={handlePreferencesSubmit} className="notifications-form">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="emailNotifications"
                      name="email"
                      checked={preferences.notifications.email}
                      onChange={handlePreferenceChange}
                    />
                    <label className="form-check-label" htmlFor="emailNotifications">
                      Nhận thông báo qua email
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="browserNotifications"
                      name="browser"
                      checked={preferences.notifications.browser}
                      onChange={handlePreferenceChange}
                    />
                    <label className="form-check-label" htmlFor="browserNotifications">
                      Nhận thông báo trên trình duyệt
                    </label>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 