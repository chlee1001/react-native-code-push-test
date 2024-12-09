import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  Text,
} from 'react-native';
import {getStatusBarHeight} from 'react-native-iphone-screen-helper';

interface SnackbarProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number; // 표시 시간 (기본값: 3초)
  actionLabel?: string;
  onActionPress?: () => void;
  autoHide?: boolean; // 자동 닫힘 여부 (기본값: true)
  swipeToDismiss?: boolean; // 스와이프로 닫기 기능 활성화 (기본값: true)
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: getStatusBarHeight(),
    left: 20,
    right: 20,
    backgroundColor: 'rgba(50,50,50,0.85)',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    gap: 4,
  },
  message: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
  action: {
    color: 'orange',
    fontSize: 14,
    fontWeight: 600,
  },
});

const Snackbar: React.FC<SnackbarProps> = ({
  message,
  visible,
  onDismiss,
  duration = 3000,
  actionLabel,
  onActionPress,
  autoHide = true,
  swipeToDismiss = true,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current; // 초기 위치: 화면 위로 숨김
  const [isVisible, setIsVisible] = useState(visible);

  const handleDismiss = () => {
    Animated.timing(translateY, {
      toValue: -100, // 화면 위로 이동
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false); // 애니메이션 종료 후 컴포넌트를 제거
      onDismiss();
    });
  };

  useEffect(() => {
    if (visible) {
      setIsVisible(true); // 컴포넌트를 유지
      Animated.timing(translateY, {
        toValue: 0, // 화면에 나타남
        duration: 300,
        useNativeDriver: true,
      }).start();

      // 자동 닫힘
      if (autoHide) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      handleDismiss();
    }

    return () => {};
  }, [visible, duration, autoHide]);

  // 스와이프 제스처 핸들러
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      if (swipeToDismiss && gestureState.dy < 0) {
        translateY.setValue(gestureState.dy); // 아래로 드래그
      }
    },
    onPanResponderRelease: (e, gestureState) => {
      if (swipeToDismiss && gestureState.dy < -50) {
        handleDismiss(); // 스와이프 거리 기준으로 닫기
      } else {
        Animated.spring(translateY, {
          toValue: 0, // 원래 위치로 복구
          useNativeDriver: true,
        }).start();
      }
    },
  });

  if (!isVisible) return null;

  return (
    <Animated.View
      {...(swipeToDismiss ? panResponder.panHandlers : {})}
      style={[styles.container, {transform: [{translateY}]}]}>
      <Text
        style={styles.message}
        textBreakStrategy="balanced"
        lineBreakStrategyIOS="hangul-word">
        {message}
      </Text>
      {actionLabel && onActionPress && (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export default Snackbar;
