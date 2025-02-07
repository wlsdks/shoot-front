// 로그인/회원가입 폼 (공통 요소 사용 시)
import React from 'react';

interface AuthFormProps {
  onSubmit: (username: string, password: string, nickname?: string) => void;
  isSignup?: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSubmit, isSignup = false }) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [nickname, setNickname] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(username, password, isSignup ? nickname : undefined);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>아이디: </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      {isSignup && (
        <div>
          <label>닉네임: </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
        </div>
      )}
      <div>
        <label>비밀번호: </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">{isSignup ? '회원가입' : '로그인'}</button>
    </form>
  );
};

export default AuthForm;