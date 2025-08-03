import styled from 'styled-components';
import { theme } from '../../../../app/styles/theme';
import { spin } from '../../../../shared/ui/commonStyles';

// 메시지 상태 컨테이너들
export const StatusContainer = styled.span`
    margin-left: ${theme.spacing.xs};
    display: inline-flex;
    align-items: center;
    gap: ${theme.spacing.xs};
`;

export const SendingContainer = styled(StatusContainer)`
    font-size: ${theme.typography.fontSize.small};
    color: ${theme.colors.message.pending};
    gap: 2px;
`;

export const FailedContainer = styled(StatusContainer)`
    gap: ${theme.spacing.xs};
`;

// 스피너
export const Spinner = styled.span`
    width: ${theme.messageStatus.spinner.size};
    height: ${theme.messageStatus.spinner.size};
    border: ${theme.messageStatus.spinner.borderWidth} solid ${theme.colors.message.pending};
    border-radius: ${theme.borderRadius.circle};
    border-top-color: transparent;
    animation: ${spin} 1s linear infinite;
`;

// 실패 상태 버튼들
export const ActionButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    font-size: ${theme.messageStatus.button.fontSize};
    font-weight: ${theme.typography.fontWeight.bold};
    color: ${theme.colors.message.pending};
    padding: 2px;
    border-radius: ${theme.borderRadius.small};
    width: ${theme.messageStatus.button.size};
    height: ${theme.messageStatus.button.size};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
`;

export const DeleteButton = styled(ActionButton)`
    color: ${theme.colors.message.delete};

    &:hover {
        background-color: ${theme.colors.message.deleteHover};
        color: ${theme.colors.message.delete};
    }
`;

export const RetryButton = styled(ActionButton)`
    color: ${theme.colors.message.pending};

    &:hover {
        background-color: ${theme.colors.message.retryHover};
        color: ${theme.colors.message.retry};
    }
`;

// 읽지 않음 표시
export const UnreadIndicator = styled.span`
    font-size: ${theme.messageStatus.unread.fontSize};
    color: ${theme.colors.message.unread};
    margin-left: ${theme.spacing.xs};
    font-weight: ${theme.typography.fontWeight.medium};
`;