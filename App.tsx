import React, {useEffect, useState} from 'react';
import {View, Text, Alert, BackHandler} from 'react-native';
import CodePush from '@chlee1001/react-native-code-push';
import {version as currentVersion} from './package.json';
import Snackbar from "./src/components/common/snackbar.tsx";
import {useCodePush} from "./src/hooks/useCodePush.ts";


const App: React.FC = () => {
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const {isUpdateDownloaded} = useCodePush();

  useEffect(() => {
    if (isUpdateDownloaded) {
      setSnackbarVisible(true);
    }
  }, [isUpdateDownloaded]);

  // 뒤로가기버튼 누르면 앱종료
  useEffect(() => {
    const backAction = () => {
      Alert.alert('알림', '앱 종료', [
        {
          text: '취소',
          onPress: () => null,
          style: 'cancel',
        },
        {text: '확인', onPress: () => BackHandler.exitApp()},
      ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
      }}>
      <Text>{`안녕하세요! 이것은 CodePush 예제 앱입니다.\n${currentVersion}\n`}</Text>

      <Snackbar
          visible={snackbarVisible}
          message="앱이 업데이트되었습니다. 재시작하면 적용됩니다."
          onDismiss={() => setSnackbarVisible(false)}
          actionLabel="재시작"
          onActionPress={() => CodePush.restartApp()}
          autoHide={false}
          swipeToDismiss
      />
    </View>
  );
};

export default CodePush({checkFrequency: CodePush.CheckFrequency.MANUAL})(App);
