export interface Reaction {
  id: string;
  emoji: string;
  count: number;
}

export interface MessageReactionProps {
  messageId: string;
  userId?: number;
  reactions: Record<string, number[]>;
  onReactionUpdate: (reactions: Record<string, number[]>) => void;
} 