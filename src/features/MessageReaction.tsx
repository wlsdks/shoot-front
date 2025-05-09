import React, { useState, useEffect } from 'react';
import { Modal, Button, Space } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { ReactionType, messageReactionService } from '../shared/api/messageReaction';

interface MessageReactionProps {
  messageId: string;
  reactions: Record<string, number[]>;
  currentUserId: number;
  onReactionUpdate: (reactions: Record<string, number[]>) => void;
}

export const MessageReaction: React.FC<MessageReactionProps> = ({
  messageId,
  reactions,
  currentUserId,
  onReactionUpdate,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reactionTypes, setReactionTypes] = useState<ReactionType[]>([]);

  useEffect(() => {
    const loadReactionTypes = async () => {
      const types = await messageReactionService.getReactionTypes();
      setReactionTypes(types);
    };
    loadReactionTypes();
  }, []);

  const handleReactionClick = async (reactionType: string) => {
    try {
      const hasReacted = reactions[reactionType]?.includes(currentUserId);
      const response = hasReacted
        ? await messageReactionService.removeReaction(messageId, reactionType)
        : await messageReactionService.addReaction(messageId, reactionType);
      
      onReactionUpdate(response.reactions);
      setIsModalVisible(false);
    } catch (error) {
      console.error('리액션 처리 중 오류 발생:', error);
    }
  };

  return (
    <>
      <div className="message-reactions">
        {Object.entries(reactions).map(([type, userIds]) => (
          <span
            key={type}
            className="reaction-badge"
            onClick={() => handleReactionClick(type)}
            style={{
              backgroundColor: userIds.includes(currentUserId) ? '#e6f7ff' : '#f0f0f0',
              padding: '2px 6px',
              borderRadius: '12px',
              marginRight: '4px',
              cursor: 'pointer',
            }}
          >
            {reactionTypes.find(t => t.code === type)?.emoji} {userIds.length}
          </span>
        ))}
        <Button
          type="text"
          icon={<SmileOutlined />}
          onClick={() => setIsModalVisible(true)}
          style={{ padding: '0 4px' }}
        />
      </div>

      <Modal
        title="리액션 추가"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={300}
      >
        <Space wrap>
          {reactionTypes.map((type) => (
            <Button
              key={type.code}
              type="text"
              onClick={() => handleReactionClick(type.code)}
              style={{
                fontSize: '20px',
                padding: '4px 8px',
                backgroundColor: reactions[type.code]?.includes(currentUserId) ? '#e6f7ff' : 'transparent',
              }}
            >
              {type.emoji}
            </Button>
          ))}
        </Space>
      </Modal>
    </>
  );
}; 