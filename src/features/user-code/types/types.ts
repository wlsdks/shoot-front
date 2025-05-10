export interface UserCodeSettingsProps {
    userId: number;
}

export interface Message {
    type: 'success' | 'error';
    text: string;
} 