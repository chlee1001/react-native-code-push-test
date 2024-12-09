import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import CodePush from '@chlee1001/react-native-code-push';


export const useCodePush = () => {
  const [isUpdateDownloaded, setUpdateDownloaded] = useState(false);
  const [isCheckingForUpdate, setCheckingForUpdate] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';

  const checkForUpdates = async () => {
    if (isDev) return; // 개발 환경에서는 CodePush 사용하지 않음

    setCheckingForUpdate(true);
    try {
      await CodePush.sync(
        {
          installMode: CodePush.InstallMode.ON_NEXT_RESTART,
          mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE, // default
        },
        (status) => {
          switch (status) {
            case CodePush.SyncStatus.UPDATE_INSTALLED:
              setUpdateDownloaded(true);
              break;
            case CodePush.SyncStatus.UNKNOWN_ERROR:
              throw new Error('[CodePush] 알 수 없는 오류 발생');
            default:
              console.log('[CodePush] 상태:', status);
          }
        },
      );

      await CodePush.notifyAppReady();
    } catch (error) {
      //
    } finally {
      setCheckingForUpdate(false); // 상태 리셋
    }
  };

  useEffect(() => {
    // eslint-disable-next-line no-undef
    let debounceTimer: NodeJS.Timeout;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // 앱 활성화 상태에서만 업데이트 확인 (디바운스)
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          await checkForUpdates();
        }, 500); // 0.5초 지연
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // 초기 실행
    checkForUpdates();

    return () => {
      clearTimeout(debounceTimer);
      subscription.remove();
    };
  }, []);

  return {
    isUpdateDownloaded,
    isCheckingForUpdate, // 업데이트 확인 중 상태 반환
  };
};
