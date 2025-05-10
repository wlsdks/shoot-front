import React from 'react';
import { useUserCode } from '../model/useUserCode';
import { UserCodeManagerProps } from '../types';

export const UserCodeManager: React.FC<UserCodeManagerProps> = ({ userId, onCodeUpdate }) => {
    const { myCode, isLoadingMyCode, createCode, isCreatingCode } = useUserCode(userId);

    const handleCopyCode = () => {
        if (myCode?.userCode) {
        navigator.clipboard.writeText(myCode.userCode);
        }
    };

    if (isLoadingMyCode) {
        return <div className="user-code-loading">로딩 중...</div>;
    }

    return (
        <div className="user-code-manager">
        <div className="code-display">
            {myCode?.userCode ? `#${myCode.userCode}` : '유저코드가 없습니다.'}
        </div>
        <div className="code-actions">
            <button 
            onClick={() => createCode(Math.random().toString(36).substring(2, 8).toUpperCase())}
            disabled={isCreatingCode}
            >
            {isCreatingCode ? '생성 중...' : '새 코드 생성'}
            </button>
            <button 
            onClick={handleCopyCode}
            disabled={!myCode?.userCode}
            >
            코드 복사
            </button>
        </div>
        </div>
    );
}; 