import React from 'react';
import { SettingsTab } from '../../features/settings';
import { EditProfile } from '../../features/profile';
import { UserCodeSettings } from '../../features/user-code';

interface SettingsWidgetProps {
    // 향후 확장을 위한 props 인터페이스
}

/**
 * SettingsWidget - 설정 관련 기능들을 조합하는 위젯
 * FSD 원칙에 따라 여러 features를 조합하여 복합적인 UI 블록을 생성
 */
export const SettingsWidget: React.FC<SettingsWidgetProps> = () => {
    return (
        <SettingsTab 
            EditProfileComponent={EditProfile}
            UserCodeSettingsComponent={UserCodeSettings}
        />
    );
}; 