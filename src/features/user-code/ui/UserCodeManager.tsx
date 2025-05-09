import React from 'react';
import { useUserCode } from '../model/useUserCode';
import { UserCodeManagerProps } from '../types';

export const UserCodeManager: React.FC<UserCodeManagerProps> = (props) => {
  const { userCode, generateCode, copyCode } = useUserCode(props);

  return (
    <div className="user-code-manager">
      <div className="code-display">
        {userCode}
      </div>
      <div className="code-actions">
        <button onClick={generateCode}>새 코드 생성</button>
        <button onClick={copyCode}>코드 복사</button>
      </div>
    </div>
  );
}; 