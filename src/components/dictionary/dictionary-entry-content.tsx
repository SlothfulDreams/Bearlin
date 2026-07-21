import { Link } from 'expo-router';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ActionButton } from '@/components/ui/action-button';
import { PronunciationButton } from '@/components/ui/pronunciation-button';
import type { DictionaryEntry } from '@/data/schemas';

export function DictionaryEntryContent({ entry, saved, onToggleSaved }: { entry: DictionaryEntry; saved: boolean; onToggleSaved: () => void }) {
  return (
    <View className="gap-6 p-6 pb-10">
      <View className="flex-row items-center gap-4">
        <View className="flex-1 gap-1">
          <ThemedText type="title">{entry.article ? `${entry.article} ` : ''}{entry.lemma}</ThemedText>
          <ThemedText themeColor="textSecondary">{entry.pronunciation} · {entry.partOfSpeech}</ThemedText>
        </View>
        <PronunciationButton text={entry.lemma} />
      </View>

      <View className="gap-2 rounded-control bg-element p-4 dark:bg-element-dark">
        <ThemedText type="label" themeColor="textSecondary">IN CONTEXT</ThemedText>
        <ThemedText type="section">{entry.translations.join(', ')}</ThemedText>
        <ThemedText themeColor="textSecondary">{entry.contextualMeaning}</ThemedText>
      </View>

      {(entry.gender || entry.plural || entry.forms.length > 0) && (
        <Section title="Forms">
          <View className="flex-row flex-wrap gap-2">
            {entry.gender && <Form label="Gender" value={entry.gender} />}
            {entry.plural && <Form label="Plural" value={entry.plural} />}
            {entry.forms.map((form) => <Form key={form.label} label={form.label} value={form.value} />)}
          </View>
        </Section>
      )}

      <Section title="Examples">
        {entry.examples.map((example) => (
          <View key={example.german} className="gap-1 border-l-[3px] border-line pl-4 dark:border-line-dark">
            <ThemedText type="bodyStrong">{example.german}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">{example.translation}</ThemedText>
          </View>
        ))}
      </Section>

      {entry.grammarTags.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {entry.grammarTags.map((tag) => (
            <View key={tag} className="rounded-chip bg-element px-3 py-1 dark:bg-element-dark">
              <ThemedText type="caption">{tag}</ThemedText>
            </View>
          ))}
        </View>
      )}

      <ActionButton label={saved ? 'Remove from Words' : 'Save word'} variant={saved ? 'secondary' : 'primary'} onPress={onToggleSaved} />
      <Link href={{ pathname: '/dictionary/[id]', params: { id: entry.id } }} asChild>
        <ActionButton label="Open full entry" variant="ghost" compact />
      </Link>
    </View>
  );
}

function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <View className="gap-3">
      <ThemedText type="label" themeColor="textSecondary">{title.toLocaleUpperCase('en-US')}</ThemedText>
      {children}
    </View>
  );
}

function Form({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[120px] flex-grow gap-1 rounded-lg border border-line p-3 dark:border-line-dark">
      <ThemedText type="caption" themeColor="textSecondary">{label}</ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
  );
}
