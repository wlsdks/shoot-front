import React from 'react';
import { useNavigation } from '../model/useNavigation';
import { NavigationProps } from '../types';

export const Navigation: React.FC<NavigationProps> = (props) => {
  const { currentPath, navigate } = useNavigation(props);

  return (
    <nav className="navigation">
      <ul className="nav-list">
        {props.items.map((item) => (
          <li
            key={item.path}
            className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
          >
            <button onClick={() => navigate(item.path)}>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}; 