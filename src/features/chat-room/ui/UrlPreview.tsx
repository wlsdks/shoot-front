import React from 'react';
import { ChatMessageItem } from '../../message/types/ChatRoom.types';
import {
    UrlPreviewContainer,
    UrlPreviewImage,
    UrlPreviewContent,
    UrlPreviewTitle,
    UrlPreviewDescription,
    UrlPreviewUrl
} from '../styles/ChatRoom.styles';

interface UrlPreviewProps {
    message: ChatMessageItem;
}

export const UrlPreview: React.FC<UrlPreviewProps> = ({ message }) => {
    const preview = message.content?.urlPreview;
    
    if (!preview) return null;

    return (
        <UrlPreviewContainer onClick={() => preview.url && window.open(preview.url, '_blank')}>
            {preview.image && (
                <UrlPreviewImage src={preview.image} alt={preview.title} />
            )}
            <UrlPreviewContent>
                {preview.title && <UrlPreviewTitle>{preview.title}</UrlPreviewTitle>}
                {preview.description && <UrlPreviewDescription>{preview.description}</UrlPreviewDescription>}
                {preview.url && <UrlPreviewUrl>{preview.url}</UrlPreviewUrl>}
            </UrlPreviewContent>
        </UrlPreviewContainer>
    );
}; 