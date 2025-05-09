export interface NavigationItem {
  path: string;
  label: string;
}

export interface NavigationProps {
  items: NavigationItem[];
  onNavigate?: (path: string) => void;
} 