import { useState, useCallback, useRef, useEffect } from 'react';

export interface AsyncState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

export interface UseAsyncOptions<T> {
    initialData?: T;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    resetOnDeps?: boolean;
}

export interface UseAsyncReturn<T, P extends any[] = []> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    execute: (...args: P) => Promise<T | undefined>;
    reset: () => void;
    setData: (data: T | null) => void;
}

/**
 * 비동기 작업을 위한 공통 Hook
 * Loading, Error, Success 상태를 자동으로 관리
 */
export function useAsync<T, P extends any[] = []>(
    asyncFunction: (...args: P) => Promise<T>,
    options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T, P> {
    const { initialData = null, onSuccess, onError, resetOnDeps = false } = options;
    
    const [state, setState] = useState<AsyncState<T>>({
        data: initialData,
        loading: false,
        error: null,
    });
    
    const abortControllerRef = useRef<AbortController | null>(null);
    
    const reset = useCallback(() => {
        setState({
            data: initialData,
            loading: false,
            error: null,
        });
    }, [initialData]);
    
    const setData = useCallback((data: T | null) => {
        setState(prev => ({
            ...prev,
            data,
            error: null,
        }));
    }, []);
    
    const execute = useCallback(
        async (...args: P): Promise<T | undefined> => {
            // 이전 요청 취소
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            
            // 새 AbortController 생성
            abortControllerRef.current = new AbortController();
            
            setState(prev => ({
                ...prev,
                loading: true,
                error: null,
            }));
            
            try {
                const result = await asyncFunction(...args);
                
                // 요청이 취소되지 않았을 때만 상태 업데이트
                if (!abortControllerRef.current.signal.aborted) {
                    setState({
                        data: result,
                        loading: false,
                        error: null,
                    });
                    
                    onSuccess?.(result);
                    return result;
                }
            } catch (error) {
                // 요청이 취소되지 않았을 때만 에러 상태 업데이트
                if (!abortControllerRef.current.signal.aborted) {
                    const errorObj = error instanceof Error ? error : new Error(String(error));
                    setState({
                        data: null,
                        loading: false,
                        error: errorObj,
                    });
                    
                    onError?.(errorObj);
                }
            }
        },
        [asyncFunction, onSuccess, onError]
    );
    
    // 컴포넌트 언마운트 시 요청 취소
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);
    
    return {
        data: state.data,
        loading: state.loading,
        error: state.error,
        execute,
        reset,
        setData,
    };
}

/**
 * 즉시 실행되는 비동기 Hook
 * 컴포넌트 마운트 시 자동으로 execute를 호출
 */
export function useAsyncImmediate<T, P extends any[] = []>(
    asyncFunction: (...args: P) => Promise<T>,
    args: P,
    options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T, P> {
    const asyncState = useAsync(asyncFunction, options);
    
    useEffect(() => {
        asyncState.execute(...args);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    
    return asyncState;
}

/**
 * 의존성이 변경될 때마다 자동으로 재실행되는 비동기 Hook
 */
export function useAsyncEffect<T, P extends any[] = []>(
    asyncFunction: (...args: P) => Promise<T>,
    args: P,
    deps: React.DependencyList,
    options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T, P> {
    const asyncState = useAsync(asyncFunction, options);
    
    useEffect(() => {
        asyncState.execute(...args);
    }, deps); // eslint-disable-line react-hooks/exhaustive-deps
    
    return asyncState;
} 