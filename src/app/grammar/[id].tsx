import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { LevelBadge } from '@/components/ui/level-badge';
import { Screen } from '@/components/ui/screen';
import { useGrammarPoint } from '@/hooks/use-content';

export default function GrammarScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const grammar = useGrammarPoint(id);
  if (grammar.isPending) return <Screen includeTabInset={false}><ThemedText>Loading grammar…</ThemedText></Screen>;
  if (!grammar.data) return <Screen includeTabInset={false}><ThemedText>Grammar point not found.</ThemedText></Screen>;
  const point = grammar.data;
  return (
    <Screen includeTabInset={false}>
      <View className="gap-3 pt-4"><LevelBadge level={point.level} /><ThemedText type="title">{point.title}</ThemedText><ThemedText type="section" themeColor="textSecondary">{point.summary}</ThemedText></View>
      {point.pattern && <View className="mt-6 gap-2 rounded-card bg-element p-5 dark:bg-element-dark"><ThemedText type="label" themeColor="textSecondary">PATTERN</ThemedText><ThemedText type="bodyStrong">{point.pattern}</ThemedText></View>}
      <View className="mt-8 gap-3"><ThemedText type="section">How it works</ThemedText>{point.explanation.map((paragraph) => <ThemedText key={paragraph}>{paragraph}</ThemedText>)}</View>
      <View className="mt-8 gap-3"><ThemedText type="section">Examples</ThemedText>{point.examples.map((example) => <View key={example.german} className="gap-1 border-l-4 border-success pl-4 dark:border-success-dark"><ThemedText type="bodyStrong">{example.german}</ThemedText><ThemedText themeColor="textSecondary">{example.translation}</ThemedText>{example.note && <ThemedText type="caption" themeColor="success">{example.note}</ThemedText>}</View>)}</View>
      {point.commonMistakes.length > 0 && <View className="mt-8 gap-3 rounded-card bg-element p-5 dark:bg-element-dark"><ThemedText type="section">Common mistakes</ThemedText>{point.commonMistakes.map((mistake) => <ThemedText key={mistake}>• {mistake}</ThemedText>)}</View>}
    </Screen>
  );
}
