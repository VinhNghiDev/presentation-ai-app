import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: ''
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
        setFormData({
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar || ''
        });
      } catch (error) {
        setError('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Implement update profile API call
      setEditMode(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // TODO: Implement avatar upload
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Hồ sơ cá nhân</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Hủy' : 'Chỉnh sửa'}
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="profile-content">
          <div className="profile-avatar">
            <img 
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=4F46E5&color=fff`} 
              alt={user?.name}
              className="avatar-image"
            />
            {editMode && (
              <div className="avatar-upload">
                <label htmlFor="avatar-upload" className="btn btn-outline-primary">
                  Thay đổi ảnh
                </label>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Họ tên</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!editMode}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!editMode}
                required
              />
              {!user?.isVerified && (
                <div className="verification-status">
                  <span className="badge bg-warning">Chưa xác thực</span>
                  <button className="btn btn-link btn-sm">Gửi email xác thực</button>
                </div>
              )}
            </div>

            {editMode && (
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            )}
          </form>

          <div className="profile-stats">
            <div className="stat-item">
              <h3>Ngày tham gia</h3>
              <p>{new Date(user?.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="stat-item">
              <h3>Lần đăng nhập cuối</h3>
              <p>{new Date(user?.lastLogin).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="stat-item">
              <h3>Vai trò</h3>
              <p className="role-badge">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 