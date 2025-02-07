// 회원가입 페이지
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../services/api';

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(username, nickname);
      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      navigate('/login');
    } catch (error) {
      console.error('회원가입 실패', error);
    }
  };

  return (
    <div>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>아이디: </label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>닉네임: </label>
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} required />
        </div>
        <button type="submit">회원가입</button>
      </form>
    </div>
  );
};

export default Signup;
