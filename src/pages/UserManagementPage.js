import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import userService from '../services/userService';
import Header from '../components/Header/Header';
import './UserManagementPage.css';

const UserManagementPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    isActive: true
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchUsers = useCallback(async (page = pagination.page, limit = pagination.limit, search = searchTerm) => {
    try {
      setLoading(true);
      const response = await userService.getUsers(page, limit, search);
      setUsers(response.users);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !authService.isAdmin()) {
      navigate('/');
    } else {
      fetchUsers();
    }
  }, [navigate, fetchUsers]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(1, pagination.limit, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchUsers, pagination.limit]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (user) => {
    // Kiểm tra quyền chỉnh sửa
    if (!authService.isAdmin()) {
      setError('Bạn không có quyền chỉnh sửa thông tin người dùng');
      return;
    }

    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = (user) => {
    // Kiểm tra quyền xóa
    if (!authService.isAdmin()) {
      setError('Bạn không có quyền xóa người dùng');
      return;
    }

    setSelectedUser(user);
    setModalType('delete');
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (modalType === 'edit') {
        // Kiểm tra quyền chỉnh sửa
        if (!authService.isAdmin()) {
          throw new Error('Bạn không có quyền chỉnh sửa thông tin người dùng');
        }

        await userService.updateUser(selectedUser.id, formData);
        await fetchUsers();
        setShowModal(false);
      } else if (modalType === 'delete') {
        // Kiểm tra quyền xóa
        if (!authService.isAdmin()) {
          throw new Error('Bạn không có quyền xóa người dùng');
        }

        await userService.deleteUser(selectedUser.id);
        await fetchUsers();
        setShowModal(false);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchUsers(newPage);
  };

  if (loading && !users.length) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="user-management-page">
      <Header />
      <div className="user-management-container">
        <div className="page-header">
          <h1>Quản lý người dùng</h1>
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Đăng nhập cuối</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>{new Date(user.lastLogin).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div className="action-buttons">
                      {authService.isAdmin() && (
                        <button
                          className="btn btn-edit"
                          onClick={() => handleEdit(user)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                      )}
                      {authService.isAdmin() && (
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDelete(user)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Trước
              </button>
              <span className="page-info">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Sau
              </button>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>
                  {modalType === 'edit' ? 'Chỉnh sửa người dùng' : 'Xác nhận xóa'}
                </h2>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>

              {modalType === 'edit' ? (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Tên</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
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
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  {authService.isAdmin() && (
                    <div className="form-group">
                      <label htmlFor="role">Vai trò</label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleFormChange}
                      >
                        <option value="user">Người dùng</option>
                        <option value="admin">Quản trị viên</option>
                      </select>
                    </div>
                  )}
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleFormChange}
                      />
                      Tài khoản hoạt động
                    </label>
                  </div>
                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="delete-confirmation">
                  <p>Bạn có chắc chắn muốn xóa người dùng này?</p>
                  <p className="user-info">
                    {selectedUser.name} ({selectedUser.email})
                  </p>
                  <div className="modal-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Hủy
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? 'Đang xóa...' : 'Xóa'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage; 