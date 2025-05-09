import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';

// 애니메이션 정의
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const slideIn = keyframes`
  from { transform: translateX(50px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// 페이지 전체를 고정시키는 컨테이너
export const PageWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  z-index: 1000;
  overflow: hidden;
`;

// 모바일 디바이스 크기에 맞는 컨테이너
export const MobileContainer = styled.div`
  width: 375px;
  height: 667px;
  background-color: #fff;
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  border: 2px solid #ddd;
  position: relative;
  animation: ${fadeIn} 0.5s ease-out;
  overflow: hidden;
`;

// 헤더 영역
export const Header = styled.div`
  padding: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
`;

export const BackButton = styled(Link)`
  position: absolute;
  left: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  text-decoration: none;
  
  &:hover {
    color: #007bff;
  }
`;

export const Title = styled.h1`
  font-size: 1.25rem;
  color: #333;
  margin: 0;
  flex: 1;
  text-align: center;
  font-weight: 600;
`;

// 폼 관련 스타일
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
`;

export const Input = styled.input`
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 1rem;
  background-color: #f9f9f9;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
    background-color: #fff;
  }
`;

export const Button = styled.button`
  padding: 14px;
  background: linear-gradient(90deg, #007bff, #0062cc);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 8px;
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.2);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 123, 255, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    background: linear-gradient(90deg, #cccccc, #bbbbbb);
    cursor: not-allowed;
    box-shadow: none;
  }
`;

// 메시지 관련 스타일
export const ErrorMessage = styled.div`
  color: #e53935;
  text-align: center;
  margin-top: 16px;
  font-size: 0.9rem;
  background-color: rgba(229, 57, 53, 0.1);
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const SuccessMessage = styled.div`
  color: #28a745;
  text-align: center;
  margin-top: 16px;
  font-size: 0.9rem;
  background-color: rgba(40, 167, 69, 0.1);
  padding: 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

// 링크 관련 스타일
export const LinkContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
`;

export const StyledLink = styled(Link)`
  color: #007bff;
  text-decoration: none;
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
  }
`; 