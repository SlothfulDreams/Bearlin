import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import Animated, { FadeOut, useReducedMotion, ZoomIn } from 'react-native-reanimated';

import { BearlinLogo } from '@/components/ui/bearlin-logo';

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    SplashScreen.hideAsync();
    const timer = setTimeout(() => setVisible(false), reducedMotion ? 80 : 650);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  if (!visible) return null;

  return (
    <Animated.View
      className="absolute inset-0 z-[1000] items-center justify-center bg-brand"
      exiting={reducedMotion ? undefined : FadeOut.duration(220)}>
      <Animated.View entering={reducedMotion ? undefined : ZoomIn.duration(320)}>
        <BearlinLogo />
      </Animated.View>
    </Animated.View>
  );
}
