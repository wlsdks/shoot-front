import React from 'react';
import { useNavigate } from 'react-router-dom';
import FriendCodePage from '../../features/user-code/ui/friendCodePage';

interface FriendCodePageProps {
  onClose: () => void;
}

const FriendCodePageWrapper: React.FC<FriendCodePageProps> = ({ onClose }) => {
  const navigate = useNavigate();
  return <FriendCodePage onClose={() => navigate(-1)} />;
};

export default FriendCodePageWrapper; 