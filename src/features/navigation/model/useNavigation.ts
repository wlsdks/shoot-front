import { useState } from 'react';
import { NavigationProps } from '../types';

export const useNavigation = (props: NavigationProps) => {
  const [currentPath, setCurrentPath] = useState<string>('/');

  const navigate = (path: string) => {
    setCurrentPath(path);
    props.onNavigate?.(path);
  };

  return {
    currentPath,
    navigate
  };
}; 