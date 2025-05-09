import { useState } from 'react';
import { useUserCode } from '../shared/lib/hooks/useUserCode';

interface UserCodeManagerProps {
  userId: number;
}

const UserCodeManager = ({ userId }: UserCodeManagerProps) => {
  const [newCode, setNewCode] = useState('');
  const [searchCode, setSearchCode] = useState('');
  
  const {
    myCode,
    isLoadingMyCode,
    createCode,
    findUser,
    sendFriendRequest,
    isCreatingCode,
    isFindingUser,
    isSendingRequest,
    createCodeError,
    findUserError,
    sendRequestError,
  } = useUserCode(userId);

  const handleCreateCode = (e: React.FormEvent) => {
    e.preventDefault();
    createCode(newCode);
  };

  const handleFindUser = (e: React.FormEvent) => {
    e.preventDefault();
    findUser(searchCode);
  };

  if (isLoadingMyCode) return <div>로딩 중...</div>;

  return (
    <div>
      <div>
        <h3>내 유저 코드</h3>
        <p>현재 코드: {myCode}</p>
        <form onSubmit={handleCreateCode}>
          <input
            type="text"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="새로운 코드 입력"
          />
          <button type="submit" disabled={isCreatingCode}>
            {isCreatingCode ? '생성 중...' : '코드 생성/수정'}
          </button>
        </form>
        {createCodeError && <div>에러: {createCodeError.message}</div>}
      </div>

      <div>
        <h3>사용자 찾기</h3>
        <form onSubmit={handleFindUser}>
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="유저 코드 입력"
          />
          <button type="submit" disabled={isFindingUser}>
            {isFindingUser ? '검색 중...' : '사용자 찾기'}
          </button>
        </form>
        {findUserError && <div>에러: {findUserError.message}</div>}
      </div>
    </div>
  );
};

export default UserCodeManager; 