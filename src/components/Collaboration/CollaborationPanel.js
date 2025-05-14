// src/components/Collaboration/CollaborationPanel.js
import React, { useState, useEffect } from 'react';
import { 
  getCollaborators, 
  addCollaborator, 
  updateCollaboratorPermission, 
  removeCollaborator, 
  createShareLink,
  getShareLinks,
  deleteShareLink
} from '../../services/collaborationService';
import { useCollaborationStore, CollaborationService } from '../../features/collaboration';
import { toast } from 'react-toastify';
import ActiveUsers from './ActiveUsers';
import Comments from './Comments';
import VersionHistory from './VersionHistory';
import CollaborationTabs from './CollaborationTabs';
import CollaborationHeader from './CollaborationHeader';
import ShareLinkManager from './ShareLinkManager';
import LoadingState from '../common/LoadingState';
import ErrorState from '../common/ErrorState';

/**
 * Component bảng quản lý cộng tác và chia sẻ
 * @param {Object} props - Props component
 * @param {string} props.presentationId - ID bài thuyết trình
 * @param {string} props.slideId - ID slide
 * @param {string} props.currentUser - ID người dùng hiện tại
 * @param {function} props.onVersionSelect - Callback khi chọn phiên bản
 * @param {function} props.onClose - Callback khi đóng bảng
 * @param {string} props.presentationName - Tên bài thuyết trình
 */
const CollaborationPanel = ({
  presentationId,
  slideId,
  currentUser,
  onVersionSelect,
  onClose,
  presentationName
}) => {
  const [activeTab, setActiveTab] = useState('users');
  const [collaborators, setCollaborators] = useState([]);
  const [shareLinks, setShareLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { connected, users, comments, versions, currentVersion } = useCollaborationStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadCollaborators();
    loadShareLinks();
  }, [loadCollaborators, loadShareLinks]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [collaboratorsData, shareLinksData] = await Promise.all([
        getCollaborators(presentationId),
        getShareLinks(presentationId)
      ]);
      setCollaborators(collaboratorsData);
      setShareLinks(shareLinksData);
    } catch (error) {
      console.error('Error loading collaboration data:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const loadCollaborators = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCollaborators(presentationId);
      setCollaborators(data);
    } catch (error) {
      console.error('Error loading collaborators:', error);
      setError('Không thể tải danh sách người cộng tác.');
    } finally {
      setLoading(false);
    }
  };

  const loadShareLinks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getShareLinks(presentationId);
      setShareLinks(data);
    } catch (error) {
      console.error('Error loading share links:', error);
      setError('Không thể tải danh sách link chia sẻ.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShareLink = async ({ permission, expiration }) => {
    try {
      const link = await createShareLink(presentationId, permission, expiration);
      setShareLinks(prev => [...prev, link]);
      toast.success('Đã tạo link chia sẻ thành công');
    } catch (error) {
      console.error('Error creating share link:', error);
      throw error;
    }
  };

  const handleDeleteShareLink = async (token) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa link chia sẻ này?')) return;

    try {
      await deleteShareLink(presentationId, token);
      setShareLinks(prev => prev.filter(link => link.token !== token));
      toast.success('Đã xóa link chia sẻ thành công');
    } catch (error) {
      console.error('Error deleting share link:', error);
      toast.error('Không thể xóa link chia sẻ');
    }
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Đã sao chép link vào clipboard');
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState error={error} onRetry={loadData} />;
    }

    switch (activeTab) {
      case 'users':
        return (
          <ActiveUsers
            presentationId={presentationId}
            currentUser={currentUser}
            presentationName={presentationName}
          />
        );
      case 'share':
        return (
          <ShareLinkManager
            shareLinks={shareLinks}
            onCreateLink={handleCreateShareLink}
            onDeleteLink={handleDeleteShareLink}
            onCopyLink={handleCopyLink}
            loading={loading}
          />
        );
      case 'comments':
        return (
          <Comments
            presentationId={presentationId}
            slideId={slideId}
            currentUser={currentUser}
            presentationName={presentationName}
          />
        );
      case 'versions':
        return (
          <VersionHistory
            presentationId={presentationId}
            currentUser={currentUser}
            onVersionSelect={onVersionSelect}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl flex flex-col">
      <CollaborationHeader title="Cộng tác" onClose={onClose} />
      <CollaborationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default CollaborationPanel;