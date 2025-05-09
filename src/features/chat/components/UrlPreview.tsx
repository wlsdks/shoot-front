import React from 'react';
import { ChatMessageItem } from '../types/ChatRoom.types';
import {
    UrlPreviewContainer,
    PreviewImage,
    PreviewContent,
    PreviewSite,
    PreviewTitle,
    PreviewDescription
} from '../styles/ChatRoom.styles';

interface UrlPreviewProps {
    message: ChatMessageItem;
}

export const UrlPreview: React.FC<UrlPreviewProps> = ({ message }) => {
    const preview = message.content?.urlPreview;
    
    if (!preview || (!preview.title && !preview.description)) {
        return null;
    }
    
    return (
        <UrlPreviewContainer onClick={() => preview.url && window.open(preview.url, '_blank')}>
            <PreviewImage $hasImage={!!preview.imageUrl}>
                {preview.imageUrl && <img src={preview.imageUrl} alt={preview.title || "Preview"} />}
            </PreviewImage>
            <PreviewContent>
                {preview.siteName && <PreviewSite>{preview.siteName}</PreviewSite>}
                {preview.title && <PreviewTitle>{preview.title}</PreviewTitle>}
                {preview.description && <PreviewDescription>{preview.description}</PreviewDescription>}
            </PreviewContent>
        </UrlPreviewContainer>
    );
}; 