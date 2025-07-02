// Social feature에서 필요한 API들을 shared에서 직접 re-export
export {
    getFriends,
    getIncomingRequests,
    getOutgoingRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    searchFriends,
    getRecommendations,
    cancelFriendRequest
} from '../../../shared/api/friends'; 