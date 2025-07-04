import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../features/auth';
import FriendCodePage from '../../features/user-code/ui/friendCodePage';

interface FriendCodePageProps {
  onClose: () => void;
}

const FriendCodePageWrapper: React.FC<FriendCodePageProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  return <FriendCodePage user={user} onClose={() => navigate(-1)} />;
};

export default FriendCodePageWrapper; 