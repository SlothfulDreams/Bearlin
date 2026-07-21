import { View } from 'react-native';

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      className="h-[7px] overflow-hidden rounded-chip bg-element-selected dark:bg-element-selected-dark">
      <View
        className={color ? 'h-full rounded-chip' : 'h-full rounded-chip bg-primary dark:bg-primary-dark'}
        style={color
          ? { width: `${clamped * 100}%`, backgroundColor: color }
          : { width: `${clamped * 100}%` }}
      />
    </View>
  );
}
