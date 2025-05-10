export interface TabProps {
    title: string;
    actions?: React.ReactNode;
}

export interface LoadingProps {
    text?: string;
}

export interface EmptyStateProps {
    icon?: React.ReactNode;
    text: string;
}

export interface IconProps {
    children: React.ReactNode;
    size?: number;
} 