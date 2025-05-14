import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCamera, 
  FaBell, FaShieldAlt, FaGlobe, FaSignOutAlt, FaCheck, 
  FaExclamationTriangle, FaCloudUploadAlt, FaMoon, FaSun, 
  FaInfoCircle, FaUserEdit, FaKey
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import authService from '../services/authService';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import './AccountSettingsPage.css';

const AccountSettingsPage = () => {
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);
  const currentUser = authService.getCurrentUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordVisible, setPasswordVisible] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    language: currentUser?.preferences?.language || 'vi',
    theme: currentUser?.preferences?.theme || 'light',
    emailNotifications: true,
    twoFactorAuth: false
  });
  const [avatar, setAvatar] = useState(
    currentUser?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser?.name || 'User') + '&background=4361ee&color=fff'
  );
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle theme toggle
  const toggleTheme = () => {
    const newTheme = formData.theme === 'light' ? 'dark' : 'light';
    setFormData({
      ...formData,
      theme: newTheme
    });
    
    // In a real app, you would apply the theme change immediately
    document.body.classList.toggle('dark-theme');
  };

  // Handle avatar upload click
  const handleAvatarClick = () => {
    avatarInputRef.current.click();
  };

  // Handle avatar file selection
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước hình ảnh không được vượt quá 2MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      
      // Simulate upload with preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        // In a real app, you would upload the file to your server here
        // and update the user's avatar URL
        setTimeout(() => {
          setUploadingAvatar(false);
          toast.success('Ảnh đại diện đã được cập nhật', {
            icon: <FaCheck />,
            className: 'toast-success'
          });
        }, 1000);
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      toast.error('Không thể tải lên ảnh đại diện');
      setUploadingAvatar(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setPasswordVisible({
      ...passwordVisible,
      [field]: !passwordVisible[field]
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === 'profile') {
        // Update profile
        await authService.updateProfile({
          name: formData.name,
          email: formData.email,
          preferences: {
            language: formData.language,
            theme: formData.theme
          }
        });
        
        toast.success('Thông tin cá nhân đã được cập nhật', {
          icon: <FaCheck />,
          className: 'toast-success'
        });
        
        // Update last saved time
        setLastSaved(new Date());
        
      } else if (activeTab === 'security') {
        // Change password
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
            throw new Error('Mật khẩu mới không khớp');
          }
          if (formData.newPassword.length < 6) {
            throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
        }
          
        await authService.changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        });

          // Reset password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
          
          toast.success('Mật khẩu đã được thay đổi', {
            icon: <FaCheck />,
            className: 'toast-success'
          });
        }
        
        // Toggle 2FA (simulated)
        if (formData.twoFactorAuth) {
          toast.info('Đã bật xác thực hai yếu tố', {
            icon: <FaShieldAlt />,
            className: 'toast-info'
          });
        }
      }
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.', {
        icon: <FaExclamationTriangle />,
        className: 'toast-error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    toast.info('Đang đăng xuất...', {
      autoClose: 1500,
      onClose: () => {
        authService.logout();
        navigate('/login');
      }
    });
  };

  // Handle account deletion (would need confirmation in real app)
  const handleDeleteAccount = () => {
    const confirm = window.confirm(
      'Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.'
    );
    
    if (confirm) {
      toast.info('Đang xóa tài khoản...', {
        autoClose: 2000,
        onClose: () => {
          // In a real app, you would call an API to delete the user's account
          navigate('/login');
        }
      });
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return Math.min(strength, 5);
  };

  const passwordStrength = calculatePasswordStrength(formData.newPassword);
  
  const getPasswordStrengthLabel = (strength) => {
    switch(strength) {
      case 0: return '';
      case 1: return 'Rất yếu';
      case 2: return 'Yếu';
      case 3: return 'Trung bình';
      case 4: return 'Khá mạnh';
      case 5: return 'Mạnh';
      default: return '';
    }
  };
  
  const getPasswordStrengthColor = (strength) => {
    switch(strength) {
      case 1: return '#ef4444';
      case 2: return '#f97316';
      case 3: return '#eab308';
      case 4: return '#84cc16';
      case 5: return '#10b981';
      default: return '#e5e7eb';
    }
  };

  // Render profile tab
  const renderProfileTab = () => (
    <div className="settings-tab-content">
      <div className="settings-section-header">
        <div>
          <h2 className="settings-section-title">
            <FaUserEdit className="section-icon" /> Thông tin cá nhân
          </h2>
          <p className="settings-section-description">
            Cập nhật thông tin cá nhân và tùy chọn của bạn
          </p>
        </div>
        {lastSaved && (
          <div className="last-saved">
            <FaCheck style={{ color: '#10b981', marginRight: '6px' }} /> Đã lưu lúc {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>
      
      <div className="profile-avatar-section">
        <div className="avatar-container">
          <img 
            src={avatar} 
            alt="Avatar" 
            className="profile-avatar" 
          />
          {uploadingAvatar && (
            <div className="avatar-overlay">
              <div className="avatar-spinner"></div>
            </div>
          )}
          <button 
            type="button" 
            className="avatar-upload-btn"
            onClick={handleAvatarClick}
            disabled={uploadingAvatar}
            aria-label="Tải lên ảnh đại diện"
          >
            <FaCloudUploadAlt />
          </button>
          <input 
            type="file"
            ref={avatarInputRef}
            onChange={handleAvatarChange}
            accept="image/jpeg, image/png, image/gif"
            className="avatar-input"
            aria-label="Chọn file ảnh đại diện"
          />
        </div>
        <div className="avatar-info">
          <h3>{currentUser?.name}</h3>
          <p>{currentUser?.email}</p>
          <div className="account-badges">
            <span className={`account-type ${currentUser?.subscription === 'premium' ? 'premium' : 'free'}`}>
              {currentUser?.subscription === 'premium' ? 'Premium' : 'Miễn phí'}
            </span>
            {currentUser?.emailVerified && (
              <span className="verified-badge">
                <FaCheck /> Đã xác thực
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="card-section">
            <div className="form-group">
          <label htmlFor="name">
            <FaUser className="input-icon" /> Họ và tên
          </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
            className="form-input"
            placeholder="Nhập họ và tên đầy đủ"
              />
            </div>
        
            <div className="form-group">
          <label htmlFor="email">
            <FaEnvelope className="input-icon" /> Email
          </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
            className="form-input"
            placeholder="Email của bạn"
          />
        </div>
      </div>
      
      <div className="card-section">
        <h3 className="settings-section-subtitle">Tùy chọn hiển thị</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="language">
              <FaGlobe className="input-icon" /> Ngôn ngữ
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="form-select"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="theme">
              {formData.theme === 'light' ? <FaSun className="input-icon" /> : <FaMoon className="input-icon" />} Giao diện
            </label>
            <div className="theme-selector">
              <button 
                type="button"
                className={`theme-option ${formData.theme === 'light' ? 'active' : ''}`}
                onClick={() => formData.theme !== 'light' && toggleTheme()}
              >
                <FaSun /> Sáng
              </button>
              <button 
                type="button"
                className={`theme-option ${formData.theme === 'dark' ? 'active' : ''}`}
                onClick={() => formData.theme !== 'dark' && toggleTheme()}
              >
                <FaMoon /> Tối
              </button>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="emailNotifications"
              checked={formData.emailNotifications}
              onChange={handleChange}
              className="form-checkbox"
            />
            <span className="checkbox-text">
              <FaBell className="checkbox-icon" /> Nhận thông báo qua email
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  // Render security tab
  const renderSecurityTab = () => (
    <div className="settings-tab-content">
      <div className="settings-section-header">
        <div>
          <h2 className="settings-section-title">
            <FaKey className="section-icon" /> Bảo mật tài khoản
          </h2>
          <p className="settings-section-description">
            Thay đổi mật khẩu và cài đặt bảo mật nâng cao
          </p>
        </div>
      </div>
      
      <div className="card-section">
        <h3 className="settings-section-subtitle">Thay đổi mật khẩu</h3>
        
            <div className="form-group">
          <label htmlFor="currentPassword">
            <FaLock className="input-icon" /> Mật khẩu hiện tại
          </label>
          <div className="password-input-container">
              <input
              type={passwordVisible.current ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
              className="form-input"
              placeholder="Nhập mật khẩu hiện tại"
            />
            <button 
              type="button" 
              className="password-toggle-btn"
              onClick={() => togglePasswordVisibility('current')}
              tabIndex="-1"
              aria-label={passwordVisible.current ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {passwordVisible.current ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
            </div>
        
            <div className="form-group">
          <label htmlFor="newPassword">
            <FaLock className="input-icon" /> Mật khẩu mới
          </label>
          <div className="password-input-container">
              <input
              type={passwordVisible.new ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
              className="form-input"
              placeholder="Nhập mật khẩu mới"
            />
            <button 
              type="button" 
              className="password-toggle-btn"
              onClick={() => togglePasswordVisibility('new')}
              tabIndex="-1"
              aria-label={passwordVisible.new ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {passwordVisible.new ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          
          {formData.newPassword && (
            <div className="password-strength">
              <div className="strength-meter">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div 
                    key={level}
                    className={`strength-segment ${passwordStrength >= level ? 'filled' : ''}`}
                    style={{ backgroundColor: passwordStrength >= level ? getPasswordStrengthColor(passwordStrength) : undefined }}
                  ></div>
                ))}
              </div>
              <span className="strength-label" style={{ color: getPasswordStrengthColor(passwordStrength) }}>
                {getPasswordStrengthLabel(passwordStrength)}
              </span>
            </div>
          )}
          
          {formData.newPassword && passwordStrength < 3 && (
            <div className="password-tip">
              <FaInfoCircle className="tip-icon" />
              Sử dụng ít nhất 8 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
            </div>
          )}
        </div>
        
            <div className="form-group">
          <label htmlFor="confirmPassword">
            <FaLock className="input-icon" /> Xác nhận mật khẩu mới
          </label>
          <div className="password-input-container">
              <input
              type={passwordVisible.confirm ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              className={`form-input ${formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? 'input-error' : ''}`}
              placeholder="Nhập lại mật khẩu mới"
            />
            <button 
              type="button" 
              className="password-toggle-btn"
              onClick={() => togglePasswordVisibility('confirm')}
              tabIndex="-1"
              aria-label={passwordVisible.confirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {passwordVisible.confirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          
          {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
            <div className="input-error-message">
              <FaExclamationTriangle style={{ color: '#ef4444' }} /> Mật khẩu không khớp
            </div>
          )}
        </div>
      </div>
      
      <div className="security-option">
        <div className="security-option-header">
          <div className="security-option-title">
            <FaShieldAlt className="security-icon" /> Xác thực hai yếu tố
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              name="twoFactorAuth"
              checked={formData.twoFactorAuth}
              onChange={handleChange}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <p className="security-option-description">
          Thêm một lớp bảo mật cho tài khoản của bạn bằng cách yêu cầu mã xác thực khi đăng nhập
        </p>
          </div>

      <div className="danger-zone">
        <h3 className="danger-zone-title">
          <FaExclamationTriangle /> Vùng nguy hiểm
        </h3>
        <p className="danger-zone-description">
          Các hành động không thể hoàn tác. Vui lòng cân nhắc kỹ trước khi thực hiện.
        </p>
        <button 
          type="button" 
          className="btn-danger"
          onClick={handleDeleteAccount}
        >
          Xóa tài khoản
        </button>
      </div>
    </div>
  );

  return (
    <div className="account-settings-page">
      <Header />
      <div className="account-page-content">
        <Sidebar />
        <div className="account-settings-container">
          <div className="settings-header">
            <h1 className="settings-title">Quản lý tài khoản</h1>
            <button 
              type="button" 
              className="btn-logout" 
              onClick={handleLogout}
            >
              <FaSignOutAlt /> Đăng xuất
            </button>
          </div>
          
          <div className="settings-content-wrapper">
            <div className="settings-tabs">
              <button 
                className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <FaUser className="tab-icon" /> Thông tin cá nhân
              </button>
              <button 
                className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <FaShieldAlt className="tab-icon" /> Bảo mật
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="settings-form">
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'security' && renderSecurityTab()}
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn-save" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <FaCheck /> Lưu thay đổi
                    </>
                  )}
            </button>
          </div>
        </form>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AccountSettingsPage; 