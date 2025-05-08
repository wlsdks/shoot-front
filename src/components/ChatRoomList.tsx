import { useChatRooms } from '../hooks/useChatRooms';

interface ChatRoomListProps {
    userId: number;
}

const ChatRoomList = ({ userId }: ChatRoomListProps) => {
    const { chatRooms, isLoading, error, updateFavorite } = useChatRooms(userId);

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div>에러가 발생했습니다!</div>;

    return (
        <div>
        <h2>채팅방 목록</h2>
        {chatRooms?.data?.map((room: any) => (
            <div key={room.id}>
            <h3>{room.name}</h3>
            <button
                onClick={() => updateFavorite.mutate({ 
                roomId: room.id, 
                isFavorite: !room.isFavorite 
                })}
            >
                {room.isFavorite ? '⭐' : '☆'}
            </button>
            </div>
        ))}
        </div>
    );
};

export default ChatRoomList; 