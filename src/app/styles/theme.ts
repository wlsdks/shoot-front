export const theme = {
    colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8',
        light: '#f8f9fa',
        dark: '#343a40',
        white: '#ffffff',
        border: '#dee2e6',
        text: '#212529',
        background: '#f8f9fa',
        // 메시지 상태 관련 색상
        message: {
            pending: '#999999',
            delete: '#f44336',
            deleteHover: 'rgba(244, 67, 54, 0.1)',
            retry: '#4CAF50',
            retryHover: 'rgba(76, 175, 80, 0.1)',
            unread: '#333333'
        }
    },
    shadows: {
        small: '0 2px 4px rgba(0, 0, 0, 0.1)',
        medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
        large: '0 8px 16px rgba(0, 0, 0, 0.1)'
    },
    borderRadius: {
        small: '4px',
        medium: '8px',
        large: '12px',
        circle: '50%'
    },
    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
    },
    typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: {
            xsmall: '0.7rem',
            small: '0.875rem',
            medium: '1rem',
            large: '1.25rem',
            xlarge: '1.5rem'
        },
        fontWeight: {
            normal: 400,
            medium: 500,
            bold: 700
        }
    },
    // 메시지 상태 관련 사이즈
    messageStatus: {
        spinner: {
            size: '8px',
            borderWidth: '1px'
        },
        button: {
            size: '16px',
            fontSize: '0.7rem'
        },
        unread: {
            fontSize: '0.7rem'
        }
    }
}; 