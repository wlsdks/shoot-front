import { useState } from 'react';
import { UserCodeManagerProps } from '../types';

export const useUserCode = (props: UserCodeManagerProps) => {
  const [userCode, setUserCode] = useState<string>('');

  const generateCode = () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setUserCode(newCode);
    props.onCodeGenerate?.(newCode);
  };

  const copyCode = () => {
    if (userCode) {
      navigator.clipboard.writeText(userCode);
      props.onCodeCopy?.(userCode);
    }
  };

  return {
    userCode,
    generateCode,
    copyCode
  };
}; 