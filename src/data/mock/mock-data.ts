import type {
  AudioTrack,
  CefrLevel,
  Chapter,
  ChapterSummary,
  ContentDetail,
  ContentSummary,
  DictionaryEntry,
  GrammarPoint,
  LexicalUnit,
  Sentence,
  Token,
} from '@/data/schemas';
import type { MockContentDataset } from '@/data/mock/mock-content-repository';
import { getMockLexeme } from '@/data/mock/mock-lexicon';

type WordSpec = string | [surface: string, dictionaryEntryId?: string, grammarPointIds?: string[]];
type LexicalUnitMetadata = Omit<LexicalUnit, 'id' | 'tokenIds'>;
type LexicalUnitOverride = LexicalUnitMetadata & { id?: string; tokenIndexes: number[] };
interface SentenceLexicalOptions {
  units?: LexicalUnitOverride[];
  words?: Record<number, Partial<LexicalUnitMetadata>>;
}

function lexicalGroup(
  tokenIndexes: number[],
  lemma: string,
  contextualTranslation: string,
  unitType: LexicalUnit['unitType'],
  grammarPointIds: string[] = [],
  dictionaryEntryId?: string,
  partOfSpeech = 'Verb',
): LexicalUnitOverride {
  return {
    tokenIndexes,
    lemma,
    contextualTranslation,
    partOfSpeech,
    pronunciation: '',
    unitType,
    dictionaryEntryId,
    grammarPointIds,
  };
}

function makeSentence(
  id: string,
  order: number,
  translation: string,
  words: WordSpec[],
  startMs: number,
  lexicalOptions: SentenceLexicalOptions = {},
): Sentence {
  let cursor = startMs;
  const tokens: Token[] = words.map((word, index) => {
    const [surface, dictionaryEntryId, grammarPointIds = []] = typeof word === 'string' ? [word] : word;
    const punctuation = /^[.,!?;:„“–—]$/.test(surface);
    const duration = punctuation ? 100 : 360;
    const token: Token = {
      id: `${id}-t${index + 1}`,
      surface,
      dictionaryEntryId,
      grammarPointIds,
      difficulty: dictionaryEntryId ? undefined : 'A1',
      audioStartMs: cursor,
      audioEndMs: cursor + duration,
      punctuation,
    };
    cursor += duration;
    return token;
  });

  const groupedTokenIndexes = new Set(lexicalOptions.units?.flatMap((unit) => unit.tokenIndexes) ?? []);
  const groupedUnits: LexicalUnit[] = (lexicalOptions.units ?? []).map(({ id: unitId, tokenIndexes, ...metadata }) => ({
    id: unitId ?? `${id}-u${Math.min(...tokenIndexes) + 1}`,
    tokenIds: tokenIndexes.map((tokenIndex) => {
      const token = tokens[tokenIndex];
      if (!token) throw new RangeError(`Lexical unit in ${id} references missing token index ${tokenIndex}.`);
      return token.id;
    }),
    ...metadata,
  }));
  const singleWordUnits: LexicalUnit[] = tokens.flatMap((token, tokenIndex) => {
    if (token.punctuation || groupedTokenIndexes.has(tokenIndex)) return [];
    const authored = getMockLexeme(token.surface);
    const metadata = lexicalOptions.words?.[tokenIndex];
    return [{
      id: `${id}-u${tokenIndex + 1}`,
      tokenIds: [token.id],
      lemma: metadata?.lemma ?? authored.lemma,
      contextualTranslation: metadata?.contextualTranslation ?? authored.contextualTranslation,
      partOfSpeech: metadata?.partOfSpeech ?? authored.partOfSpeech,
      pronunciation: metadata?.pronunciation ?? token.pronunciation ?? authored.pronunciation,
      unitType: metadata?.unitType ?? authored.unitType,
      dictionaryEntryId: metadata?.dictionaryEntryId ?? token.dictionaryEntryId ?? authored.dictionaryEntryId,
      grammarPointIds: metadata?.grammarPointIds ?? (token.grammarPointIds.length ? token.grammarPointIds : authored.grammarPointIds),
    }];
  });
  const lexicalUnits = [...groupedUnits, ...singleWordUnits].sort((left, right) => {
    const leftIndex = tokens.findIndex((token) => token.id === left.tokenIds[0]);
    const rightIndex = tokens.findIndex((token) => token.id === right.tokenIds[0]);
    return leftIndex - rightIndex;
  });

  return {
    id,
    order,
    translation,
    tokens,
    lexicalUnits,
    audioStartMs: startMs,
    audioEndMs: cursor,
  };
}

function chapterAudio(id: string, title: string, sentences: Sentence[]): AudioTrack {
  return {
    id: `${id}-audio`,
    title,
    speaker: 'Bearlin demo voice',
    source: null,
    durationMs: (sentences.at(-1)?.audioEndMs ?? 20_000) + 800,
    mock: true,
  };
}

function buildChapter(
  data: Omit<Chapter, 'audio' | 'keywordIds' | 'grammarPointIds'> & {
    keywordIds: string[];
    grammarPointIds: string[];
  },
): Chapter {
  return { ...data, audio: chapterAudio(data.id, data.title, data.sentences) };
}

const mockDictionary: DictionaryEntry[] = [
  {
    id: 'word-schluessel', lemma: 'Schlüssel', article: 'der', gender: 'masculine', plural: 'Schlüssel',
    partOfSpeech: 'Noun', pronunciation: '/ˈʃlʏsl̩/', translations: ['key'],
    contextualMeaning: 'a key used to open a door', forms: [{ label: 'Genitive', value: 'des Schlüssels' }],
    examples: [{ german: 'Wo ist mein Schlüssel?', translation: 'Where is my key?' }], grammarTags: ['noun', 'masculine'],
  },
  {
    id: 'word-suchen', lemma: 'suchen', partOfSpeech: 'Verb', pronunciation: '/ˈzuːxn̩/', translations: ['to look for', 'to search'],
    contextualMeaning: 'to try to find a person or thing',
    forms: [{ label: 'Present', value: 'ich suche' }, { label: 'Perfect', value: 'hat gesucht' }],
    examples: [{ german: 'Mila sucht ihren Schlüssel.', translation: 'Mila is looking for her key.' }], grammarTags: ['regular verb'],
  },
  {
    id: 'word-verschwinden', lemma: 'verschwinden', partOfSpeech: 'Verb', pronunciation: '/fɛɐ̯ˈʃvɪndn̩/', translations: ['to disappear'],
    contextualMeaning: 'to no longer be visible or present',
    forms: [{ label: 'Simple past', value: 'verschwand' }, { label: 'Perfect', value: 'ist verschwunden' }],
    examples: [{ german: 'Der Schlüssel ist verschwunden.', translation: 'The key has disappeared.' }], grammarTags: ['strong verb', 'sein auxiliary'],
  },
  {
    id: 'word-tasche', lemma: 'Tasche', article: 'die', gender: 'feminine', plural: 'Taschen', partOfSpeech: 'Noun',
    pronunciation: '/ˈtaʃə/', translations: ['bag', 'pocket'], contextualMeaning: 'a bag carried for personal items',
    forms: [], examples: [{ german: 'Die Tasche liegt auf dem Tisch.', translation: 'The bag is on the table.' }], grammarTags: ['noun', 'feminine'],
  },
  {
    id: 'word-briefkasten', lemma: 'Briefkasten', article: 'der', gender: 'masculine', plural: 'Briefkästen', partOfSpeech: 'Noun',
    pronunciation: '/ˈbʁiːfˌkastn̩/', translations: ['mailbox'], contextualMeaning: 'a box where letters are delivered', forms: [],
    examples: [{ german: 'Im Briefkasten liegt ein Brief.', translation: 'There is a letter in the mailbox.' }], grammarTags: ['compound noun'],
  },
  {
    id: 'word-see', lemma: 'See', article: 'der', gender: 'masculine', plural: 'Seen', partOfSpeech: 'Noun', pronunciation: '/zeː/',
    translations: ['lake'], contextualMeaning: 'an inland body of water', forms: [],
    examples: [{ german: 'Wir fahren an den See.', translation: 'We are going to the lake.' }], grammarTags: ['accusative direction'],
  },
  {
    id: 'word-ufer', lemma: 'Ufer', article: 'das', gender: 'neuter', plural: 'Ufer', partOfSpeech: 'Noun', pronunciation: '/ˈuːfɐ/',
    translations: ['shore', 'bank'], contextualMeaning: 'the land directly beside water', forms: [],
    examples: [{ german: 'Am Ufer stehen alte Bäume.', translation: 'Old trees stand on the shore.' }], grammarTags: ['noun', 'neuter'],
  },
  {
    id: 'word-puenktlich', lemma: 'pünktlich', partOfSpeech: 'Adjective', pronunciation: '/ˈpʏŋktlɪç/', translations: ['punctual', 'on time'],
    contextualMeaning: 'happening at the agreed time', forms: [],
    examples: [{ german: 'Der Zug kommt pünktlich.', translation: 'The train arrives on time.' }], grammarTags: ['adjective', 'adverbial use'],
  },
  {
    id: 'word-koennten', lemma: 'können', partOfSpeech: 'Modal verb', pronunciation: '/ˈkœntn̩/', translations: ['could', 'would be able to'],
    contextualMeaning: 'a polite subjunctive form used to make a request',
    forms: [{ label: 'Subjunctive II', value: 'ich könnte, Sie könnten' }],
    examples: [{ german: 'Könnten Sie mir helfen?', translation: 'Could you help me?' }], grammarTags: ['modal verb', 'Subjunctive II'],
  },
  {
    id: 'word-auskunft', lemma: 'Auskunft', article: 'die', gender: 'feminine', plural: 'Auskünfte', partOfSpeech: 'Noun',
    pronunciation: '/ˈaʊ̯sˌkʊnft/', translations: ['information', 'information desk'], contextualMeaning: 'information given in response to a question', forms: [],
    examples: [{ german: 'Fragen Sie an der Auskunft.', translation: 'Ask at the information desk.' }], grammarTags: ['noun', 'feminine'],
  },
  {
    id: 'word-strassenbahn', lemma: 'Straßenbahn', article: 'die', gender: 'feminine', plural: 'Straßenbahnen', partOfSpeech: 'Noun',
    pronunciation: '/ˈʃtʁaːsn̩ˌbaːn/', translations: ['tram'], contextualMeaning: 'an urban rail vehicle running on streets', forms: [],
    examples: [{ german: 'Die letzte Straßenbahn fährt um Mitternacht.', translation: 'The last tram leaves at midnight.' }], grammarTags: ['compound noun'],
  },
  {
    id: 'word-bemerken', lemma: 'bemerken', partOfSpeech: 'Verb', pronunciation: '/bəˈmɛʁkn̩/', translations: ['to notice'],
    contextualMeaning: 'to become aware of something',
    forms: [{ label: 'Simple past', value: 'bemerkte' }, { label: 'Perfect', value: 'hat bemerkt' }],
    examples: [{ german: 'Sie bemerkte das Licht.', translation: 'She noticed the light.' }], grammarTags: ['inseparable verb'],
  },
  {
    id: 'word-geraeusch', lemma: 'Geräusch', article: 'das', gender: 'neuter', plural: 'Geräusche', partOfSpeech: 'Noun',
    pronunciation: '/ɡəˈʁɔɪ̯ʃ/', translations: ['sound', 'noise'], contextualMeaning: 'an audible event without implying music or speech', forms: [],
    examples: [{ german: 'Ein leises Geräusch kommt aus dem Hof.', translation: 'A quiet sound comes from the courtyard.' }], grammarTags: ['noun', 'neuter'],
  },
  {
    id: 'word-wahrnehmen', lemma: 'wahrnehmen', partOfSpeech: 'Verb', pronunciation: '/ˈvaːɐ̯ˌneːmən/', translations: ['to perceive', 'to notice'],
    contextualMeaning: 'to consciously perceive through the senses',
    forms: [{ label: 'Present', value: 'nimmt wahr' }, { label: 'Perfect', value: 'hat wahrgenommen' }],
    examples: [{ german: 'Nachts nehmen wir andere Klänge wahr.', translation: 'At night we perceive different sounds.' }], grammarTags: ['separable verb', 'strong verb'],
  },
  {
    id: 'word-erinnerung', lemma: 'Erinnerung', article: 'die', gender: 'feminine', plural: 'Erinnerungen', partOfSpeech: 'Noun',
    pronunciation: '/ɛɐ̯ˈʔɪnəʁʊŋ/', translations: ['memory', 'recollection'], contextualMeaning: 'a remembered experience or the faculty of remembering', forms: [],
    examples: [{ german: 'Jede Erinnerung verändert sich.', translation: 'Every memory changes.' }], grammarTags: ['abstract noun'],
  },
  {
    id: 'word-zuverlaessig', lemma: 'zuverlässig', partOfSpeech: 'Adjective', pronunciation: '/ˈtsuːfɛɐ̯ˌlɛsɪç/', translations: ['reliable'],
    contextualMeaning: 'consistently trustworthy or dependable', forms: [],
    examples: [{ german: 'Ist diese Erinnerung zuverlässig?', translation: 'Is this memory reliable?' }], grammarTags: ['adjective'],
  },
];

const mockGrammar: GrammarPoint[] = [
  {
    id: 'grammar-accusative-possessive', title: 'Possessive articles in the accusative', level: 'A1',
    summary: 'Masculine nouns change mein/dein/ihr to meinen/deinen/ihren in the accusative.',
    explanation: ['The direct object takes the accusative case.', 'Only masculine singular possessive articles gain the ending -en.'],
    pattern: 'Subject + verb + meinen/deinen/ihren + masculine noun',
    examples: [{ german: 'Mila sucht ihren Schlüssel.', translation: 'Mila is looking for her key.' }],
    commonMistakes: ['Do not use „ihr Schlüssel“ when it is the direct object.'],
  },
  {
    id: 'grammar-wechselpraeposition', title: 'Two-way prepositions: location and direction', level: 'A2',
    summary: 'Use accusative for a destination and dative for a fixed location.',
    explanation: ['An + accusative answers wohin?', 'An + dative answers wo?'], pattern: 'an den See / am See',
    examples: [{ german: 'Wir fahren an den See.', translation: 'We drive to the lake.' }, { german: 'Wir sitzen am See.', translation: 'We sit by the lake.' }],
    commonMistakes: ['Choose the case from meaning, not from the preposition alone.'],
  },
  {
    id: 'grammar-separable-verbs', title: 'Separable verbs', level: 'A2',
    summary: 'In a main clause, a separable prefix moves to the end while remaining part of the same verb.',
    explanation: ['The conjugated verb stem occupies the normal verb position.', 'The prefix appears at the end of the clause, even when other sentence elements stand between both parts.'],
    pattern: 'Subjekt + Verbstamm + … + Präfix',
    examples: [{ german: 'Wir steigen in die Straßenbahn ein.', translation: 'We board the tram.', note: 'steigen + ein belong to einsteigen' }],
    commonMistakes: ['Look up the complete infinitive, not the separated stem or prefix by itself.'],
  },
  {
    id: 'grammar-reflexive-verbs', title: 'Reflexive verbs', level: 'A2',
    summary: 'A reflexive verb uses a pronoun that refers back to the subject.',
    explanation: ['The reflexive pronoun changes with the subject: mich, dich, sich, uns, euch, sich.', 'Treat the verb and its required reflexive pronoun as one vocabulary unit.'],
    pattern: 'Subjekt + Verb + Reflexivpronomen',
    examples: [{ german: 'Die Tür schließt sich.', translation: 'The door closes.' }, { german: 'Sie kniet sich hin.', translation: 'She kneels down.', note: 'This verb is both reflexive and separable.' }],
    commonMistakes: ['Do not omit the reflexive pronoun when it is required by the verb.'],
  },
  {
    id: 'grammar-polite-konjunktiv', title: 'Polite requests with Konjunktiv II', level: 'B1',
    summary: 'Könnten Sie …? makes requests courteous and indirect.',
    explanation: ['The finite verb comes first in a yes/no-style request.', 'Use the infinitive at the end with a modal verb.'],
    pattern: 'Könnten Sie + Objekt + Infinitiv?',
    examples: [{ german: 'Könnten Sie mir den Weg zeigen?', translation: 'Could you show me the way?' }], commonMistakes: [],
  },
  {
    id: 'grammar-obwohl', title: 'Concession with obwohl', level: 'B2',
    summary: 'Obwohl introduces a contrast and sends the conjugated verb to the end.',
    explanation: ['The obwohl clause expresses a fact that makes the main-clause result surprising.'], pattern: 'Obwohl … Verb, Verb + Subjekt …',
    examples: [{ german: 'Obwohl es spät war, stieg Nora ein.', translation: 'Although it was late, Nora got on.' }],
    commonMistakes: ['Keep the finite verb at the end of the obwohl clause.'],
  },
  {
    id: 'grammar-nominalization', title: 'Nominal style in analytical texts', level: 'C1',
    summary: 'Nominalizations compress actions and processes into dense noun phrases.',
    explanation: ['Formal German often turns verbs into nouns.', 'Use nominal style selectively to keep prose readable.'],
    pattern: 'wahrnehmen → die Wahrnehmung', examples: [{ german: 'Die Wahrnehmung verändert sich nachts.', translation: 'Perception changes at night.' }], commonMistakes: [],
  },
  {
    id: 'grammar-indirect-speech', title: 'Distancing with Konjunktiv I', level: 'C2',
    summary: 'Konjunktiv I reports a claim without fully endorsing it.',
    explanation: ['It is common in journalism and academic prose.', 'If the form matches the indicative, Konjunktiv II can remove ambiguity.'],
    pattern: 'Sie sagt, die Erinnerung sei zuverlässig.',
    examples: [{ german: 'Der Autor behauptet, Erinnerung sei eine Form der Erfindung.', translation: 'The author claims that memory is a form of invention.' }],
    commonMistakes: ['Konjunktiv I signals reported speech; it does not automatically signal doubt.'],
  },
];

const chapterDefinitions: {
  id: string; contentId: string; number: number; title: string; summary: string; estimatedMinutes: number; access: 'free' | 'premium';
  level: CefrLevel; grammarPointIds: string[]; keywordIds: string[]; sentences: Sentence[];
  peopleAndPlaceNames: { name: string; note: string }[];
}[] = [
  {
    id: 'key-1', contentId: 'missing-key', number: 1, title: 'Wo ist der Schlüssel?', summary: 'Mila wants to leave the house.', estimatedMinutes: 3, access: 'free', level: 'A1',
    grammarPointIds: ['grammar-accusative-possessive', 'grammar-reflexive-verbs', 'grammar-separable-verbs'], keywordIds: ['word-schluessel', 'word-suchen', 'word-tasche'],
    sentences: [
      makeSentence('key-1-s1', 0, 'Mila wants to go to the bakery, but she cannot find her key.', [['Mila'], ['möchte'], ['zur'], ['Bäckerei'], [','], ['aber'], ['sie'], ['findet'], ['ihren', undefined, ['grammar-accusative-possessive']], ['Schlüssel', 'word-schluessel'], ['nicht'], ['.']], 0),
      makeSentence('key-1-s2', 1, 'She looks in her bag and under the table.', [['Sie'], ['sucht', 'word-suchen'], ['in'], ['ihrer'], ['Tasche', 'word-tasche'], ['und'], ['unter'], ['dem'], ['Tisch'], ['.']], 5_000),
      makeSentence('key-1-s3', 2, 'Then she checks the pockets of her jacket.', [['Dann'], ['prüft'], ['sie'], ['die'], ['Taschen'], ['ihrer'], ['Jacke'], ['.']], 9_500),
      makeSentence('key-1-s4', 3, 'There is only an old bus ticket inside.', [['Darin'], ['liegt'], ['nur'], ['eine'], ['alte'], ['Fahrkarte'], ['.']], 13_500),
      makeSentence('key-1-s5', 4, 'Mila goes back into the kitchen.', [['Mila'], ['geht'], ['zurück'], ['in'], ['die'], ['Küche'], ['.']], 17_000, { units: [lexicalGroup([1, 2], 'zurückgehen', 'goes back', 'separable-verb', ['grammar-separable-verbs'])] }),
      makeSentence('key-1-s6', 5, 'The coffee is still warm on the table.', [['Der'], ['Kaffee'], ['auf'], ['dem'], ['Tisch'], ['ist'], ['noch'], ['warm'], ['.']], 20_500),
      makeSentence('key-1-s7', 6, 'Next to it, she sees her empty key bowl.', [['Daneben'], ['sieht'], ['sie'], ['ihre'], ['leere'], ['Schlüsselschale'], ['.']], 24_500),
      makeSentence('key-1-s8', 7, 'Perhaps the key fell behind the cupboard.', [['Vielleicht'], ['ist'], ['der'], ['Schlüssel', 'word-schluessel'], ['hinter'], ['den'], ['Schrank'], ['gefallen'], ['.']], 28_500),
      makeSentence('key-1-s9', 8, 'She kneels down and looks carefully.', [['Sie'], ['kniet'], ['sich'], ['hin'], ['und'], ['schaut'], ['genau'], ['nach'], ['.']], 32_500, { units: [
        lexicalGroup([1, 2, 3], 'sich hinknien', 'kneels down', 'separable-reflexive-verb', ['grammar-reflexive-verbs', 'grammar-separable-verbs']),
        lexicalGroup([5, 7], 'nachschauen', 'looks carefully', 'separable-verb', ['grammar-separable-verbs']),
      ] }),
      makeSentence('key-1-s10', 9, 'But she finds only a little dust.', [['Aber'], ['sie'], ['findet'], ['nur'], ['ein'], ['wenig'], ['Staub'], ['.']], 36_500),
      makeSentence('key-1-s11', 10, 'Suddenly she hears a quiet noise at the apartment door.', [['Plötzlich'], ['hört'], ['sie'], ['ein'], ['leises'], ['Geräusch', 'word-geraeusch'], ['an'], ['der'], ['Wohnungstür'], ['.']], 40_500),
      makeSentence('key-1-s12', 11, 'Mila opens the door and looks into the hallway.', [['Mila'], ['öffnet'], ['die'], ['Tür'], ['und'], ['blickt'], ['in'], ['den'], ['Flur'], ['.']], 45_000),
      makeSentence('key-1-s13', 12, 'A red note lies on the floor.', [['Auf'], ['dem'], ['Boden'], ['liegt'], ['ein'], ['roter'], ['Zettel'], ['.']], 49_500),
      makeSentence('key-1-s14', 13, 'A small paper bear is drawn on it.', [['Darauf'], ['ist'], ['ein'], ['kleiner'], ['Bär'], ['aus'], ['Papier'], ['gezeichnet'], ['.']], 53_000),
    ], peopleAndPlaceNames: [{ name: 'Mila', note: 'the main character in the story' }],
  },
  {
    id: 'key-2', contentId: 'missing-key', number: 2, title: 'Eine Spur im Flur', summary: 'A note leads Mila to the door.', estimatedMinutes: 3, access: 'free', level: 'A1',
    grammarPointIds: ['grammar-accusative-possessive', 'grammar-separable-verbs'], keywordIds: ['word-briefkasten', 'word-verschwinden'],
    sentences: [
      makeSentence('key-2-s1', 0, 'The key has disappeared, but a red note lies in the hallway.', [['Der'], ['Schlüssel', 'word-schluessel'], ['ist'], ['verschwunden', 'word-verschwinden'], [','], ['aber'], ['im'], ['Flur'], ['liegt'], ['ein'], ['roter'], ['Zettel'], ['.']], 0),
      makeSentence('key-2-s2', 1, 'On it is written: Look in the mailbox!', [['Darauf'], ['steht'], [':'], ['„'], ['Sieh'], ['im'], ['Briefkasten', 'word-briefkasten'], ['nach'], ['!'], ['“']], 5_400, { units: [lexicalGroup([4, 7], 'nachsehen', 'look / check', 'separable-verb', ['grammar-separable-verbs'])] }),
    ], peopleAndPlaceNames: [{ name: 'Mila', note: 'the main character in the story' }],
  },
  {
    id: 'key-3', contentId: 'missing-key', number: 3, title: 'Ein kleiner Scherz', summary: 'Mila finds the key and her neighbor.', estimatedMinutes: 3, access: 'premium', level: 'A1',
    grammarPointIds: ['grammar-accusative-possessive'], keywordIds: ['word-schluessel', 'word-briefkasten'],
    sentences: [
      makeSentence('key-3-s1', 0, 'The key is in the mailbox next to a small paper bear.', [['Im'], ['Briefkasten', 'word-briefkasten'], ['liegt'], ['der'], ['Schlüssel', 'word-schluessel'], ['neben'], ['einem'], ['kleinen'], ['Bären'], ['aus'], ['Papier'], ['.']], 0),
      makeSentence('key-3-s2', 1, 'Her neighbor waves and laughs: Happy birthday, Mila!', [['Ihr'], ['Nachbar'], ['winkt'], ['und'], ['lacht'], [':'], ['„'], ['Alles'], ['Gute'], ['zum'], ['Geburtstag'], [','], ['Mila'], ['!'], ['“']], 5_200),
    ], peopleAndPlaceNames: [{ name: 'Mila', note: 'the main character' }, { name: 'Herr Levin', note: "Mila's neighbor" }],
  },
  {
    id: 'lake-1', contentId: 'sunday-lake', number: 1, title: 'Ein Sonntag am See', summary: 'A peaceful trip just outside the city.', estimatedMinutes: 5, access: 'free', level: 'A2',
    grammarPointIds: ['grammar-wechselpraeposition', 'grammar-separable-verbs'], keywordIds: ['word-see', 'word-ufer'],
    sentences: [
      makeSentence('lake-1-s1', 0, 'On Sunday we take the train to the lake.', [['Am'], ['Sonntag'], ['fahren'], ['wir'], ['mit'], ['dem'], ['Zug'], ['an'], ['den', undefined, ['grammar-wechselpraeposition']], ['See', 'word-see'], ['.']], 0),
      makeSentence('lake-1-s2', 1, 'At the shore we unpack bread, apples, and a thermos of tea.', [['Am', undefined, ['grammar-wechselpraeposition']], ['Ufer', 'word-ufer'], ['packen'], ['wir'], ['Brot'], [','], ['Äpfel'], ['und'], ['eine'], ['Thermoskanne'], ['Tee'], ['aus'], ['.']], 5_000, { units: [lexicalGroup([2, 11], 'auspacken', 'unpack', 'separable-verb', ['grammar-separable-verbs'])] }),
    ], peopleAndPlaceNames: [{ name: 'Müggelsee', note: 'a large lake in eastern Berlin' }],
  },
  {
    id: 'polite-1', contentId: 'polite-course', number: 1, title: 'Am Bahnhof', summary: 'Ask politely about a train connection.', estimatedMinutes: 6, access: 'free', level: 'B1',
    grammarPointIds: ['grammar-polite-konjunktiv'], keywordIds: ['word-koennten', 'word-auskunft', 'word-puenktlich'],
    sentences: [
      makeSentence('polite-1-s1', 0, 'Could you please tell me whether the train is on time?', [['Könnten', 'word-koennten', ['grammar-polite-konjunktiv']], ['Sie'], ['mir'], ['bitte'], ['sagen'], [','], ['ob'], ['der'], ['Zug'], ['pünktlich', 'word-puenktlich'], ['ist'], ['?']], 0),
      makeSentence('polite-1-s2', 1, 'The employee at the information desk checks the display.', [['Die'], ['Mitarbeiterin'], ['an'], ['der'], ['Auskunft', 'word-auskunft'], ['prüft'], ['die'], ['Anzeige'], ['.']], 5_600),
    ], peopleAndPlaceNames: [{ name: 'Hauptbahnhof', note: "Berlin's main long-distance train station" }],
  },
  {
    id: 'tram-1', contentId: 'last-tram', number: 1, title: 'Kurz vor Mitternacht', summary: 'Nora gets on an almost empty tram.', estimatedMinutes: 7, access: 'premium', level: 'B2',
    grammarPointIds: ['grammar-obwohl', 'grammar-reflexive-verbs', 'grammar-separable-verbs'], keywordIds: ['word-strassenbahn', 'word-bemerken'],
    sentences: [
      makeSentence('tram-1-s1', 0, 'Although it was already late, Nora boarded the last tram.', [['Obwohl', undefined, ['grammar-obwohl']], ['es'], ['schon'], ['spät'], ['war'], [','], ['stieg'], ['Nora'], ['in'], ['die'], ['letzte'], ['Straßenbahn', 'word-strassenbahn'], ['ein'], ['.']], 0, { units: [lexicalGroup([6, 12], 'einsteigen', 'boarded / got on', 'separable-verb', ['grammar-separable-verbs'])] }),
      makeSentence('tram-1-s2', 1, 'Only after the doors closed did she notice the forgotten suitcase.', [['Erst'], ['als'], ['sich'], ['die'], ['Türen'], ['schlossen'], [','], ['bemerkte', 'word-bemerken'], ['sie'], ['den'], ['vergessenen'], ['Koffer'], ['.']], 6_200, { units: [lexicalGroup([2, 5], 'sich schließen', 'closed', 'reflexive-verb', ['grammar-reflexive-verbs'])] }),
    ], peopleAndPlaceNames: [{ name: 'Nora', note: 'a night-shift worker' }],
  },
  {
    id: 'sound-1', contentId: 'city-sound', number: 1, title: 'Die akustische Stadt', summary: 'Why familiar places feel different after sunset.', estimatedMinutes: 9, access: 'premium', level: 'C1',
    grammarPointIds: ['grammar-nominalization', 'grammar-reflexive-verbs', 'grammar-separable-verbs'], keywordIds: ['word-geraeusch', 'word-wahrnehmen'],
    sentences: [
      makeSentence('sound-1-s1', 0, 'When visual stimuli recede, the perception of quiet sounds intensifies.', [['Wenn'], ['visuelle'], ['Reize'], ['zurücktreten'], [','], ['verstärkt'], ['sich'], ['die'], ['Wahrnehmung', undefined, ['grammar-nominalization']], ['leiser'], ['Geräusche', 'word-geraeusch'], ['.']], 0, { units: [lexicalGroup([5, 6], 'sich verstärken', 'intensifies', 'reflexive-verb', ['grammar-reflexive-verbs'])] }),
      makeSentence('sound-1-s2', 1, 'We suddenly perceive ventilation systems, distant steps, and the echo of courtyards.', [['Plötzlich'], ['nehmen', 'word-wahrnehmen'], ['wir'], ['Lüftungsanlagen'], [','], ['entfernte'], ['Schritte'], ['und'], ['das'], ['Echo'], ['der'], ['Höfe'], ['wahr'], ['.']], 6_100, { units: [lexicalGroup([1, 12], 'wahrnehmen', 'perceive', 'separable-verb', ['grammar-separable-verbs'], 'word-wahrnehmen')] }),
    ], peopleAndPlaceNames: [{ name: 'Berlin', note: "Germany's capital and a layered soundscape" }],
  },
  {
    id: 'atlas-1', contentId: 'silent-atlas', number: 1, title: 'Der Atlas ohne Namen', summary: 'Mara inherits a map that contradicts the city’s official history.', estimatedMinutes: 7, access: 'free', level: 'C2',
    grammarPointIds: ['grammar-indirect-speech'], keywordIds: ['word-zuverlaessig'],
    sentences: [
      makeSentence('atlas-1-s1', 0, 'When Mara sorted through her grandfather’s estate, she found an atlas whose existence was mentioned in none of his meticulous lists.', ['Als', 'Mara', 'den', 'Nachlass', 'ihres', 'Großvaters', 'ordnete', ',', 'fand', 'sie', 'einen', 'Atlas', ',', 'dessen', 'Existenz', 'in', 'keiner', 'seiner', 'akribischen', 'Listen', 'erwähnt', 'wurde', '.'], 0),
      makeSentence('atlas-1-s2', 1, 'The volume, whose cover bore neither a title nor a year, smelled of dust, river water, and the bitter glue of old archives.', ['Der', 'Band', ',', 'dessen', 'Einband', 'weder', 'Titel', 'noch', 'Jahreszahl', 'trug', ',', 'roch', 'nach', 'Staub', ',', 'Flusswasser', 'und', 'dem', 'bitteren', 'Leim', 'alter', 'Archive', '.'], 9_000),
      makeSentence('atlas-1-s3', 2, 'At first glance, its maps showed the familiar Berlin, but entire streets ended where today uninterrupted rows of houses stood.', ['Auf', 'den', 'ersten', 'Blick', 'zeigten', 'seine', 'Karten', 'das', 'vertraute', 'Berlin', ',', 'doch', 'ganze', 'Straßen', 'endeten', 'dort', ',', 'wo', 'heute', 'geschlossene', 'Häuserzeilen', 'standen', '.'], 18_000),
      makeSentence('atlas-1-s4', 3, 'Between the printed lines, someone had added a second city in pale blue ink, one of courtyards, footbridges, and vanished gardens.', ['Zwischen', 'den', 'gedruckten', 'Linien', 'hatte', 'jemand', 'mit', 'blassblauer', 'Tinte', 'eine', 'zweite', 'Stadt', 'eingetragen', ',', 'eine', 'Stadt', 'aus', 'Höfen', ',', 'Stegen', 'und', 'verschwundenen', 'Gärten', '.'], 27_000),
      makeSentence('atlas-1-s5', 4, 'Her grandfather claimed in a marginal note that the city had once possessed another river, which had not dried up but had been deliberately erased.', ['Ihr', 'Großvater', 'behauptete', 'in', 'einer', 'Randnotiz', ',', 'die', 'Stadt', ['habe', undefined, ['grammar-indirect-speech']], 'einst', 'einen', 'weiteren', 'Fluss', 'besessen', ',', 'der', 'nicht', 'versiegt', ',', 'sondern', 'absichtlich', 'ausgelöscht', 'worden', ['sei', undefined, ['grammar-indirect-speech']], '.'], 36_000),
      makeSentence('atlas-1-s6', 5, 'Mara took the sentence for one of his late inventions until she recognized a demolition date that matched an unexplained gap in the municipal archive.', ['Mara', 'hielt', 'den', 'Satz', 'für', 'eine', 'seiner', 'späten', 'Erfindungen', ',', 'bis', 'sie', 'ein', 'Abrissdatum', 'erkannte', ',', 'das', 'mit', 'einer', 'unerklärten', 'Lücke', 'im', 'Stadtarchiv', 'übereinstimmte', '.'], 45_000),
      makeSentence('atlas-1-s7', 6, 'Beneath transparent paper, a handwritten route led from Museum Island to a quay that had disappeared from every reliable map.', ['Unter', 'transparentem', 'Papier', 'führte', 'eine', 'handschriftliche', 'Route', 'von', 'der', 'Museumsinsel', 'zu', 'einem', 'Kai', ',', 'der', 'aus', 'jeder', ['zuverlässigen', 'word-zuverlaessig'], 'Karte', 'verschwunden', 'war', '.'], 54_000),
    ], peopleAndPlaceNames: [{ name: 'Mara Levin', note: 'an archive conservator who inherits the atlas' }, { name: 'Berlin', note: 'the city whose official map conceals a second history' }],
  },
  {
    id: 'atlas-2', contentId: 'silent-atlas', number: 2, title: 'Unter dem trockenen Kai', summary: 'The atlas leads Mara beneath a rebuilt riverfront.', estimatedMinutes: 7, access: 'free', level: 'C2',
    grammarPointIds: ['grammar-indirect-speech', 'grammar-separable-verbs'], keywordIds: ['word-wahrnehmen', 'word-geraeusch'],
    sentences: [
      makeSentence('atlas-2-s1', 0, 'The next morning Mara followed the route, although the riverbank had been rebuilt so thoroughly that even the direction of the old lanes was barely discernible.', ['Am', 'nächsten', 'Morgen', 'folgte', 'Mara', 'der', 'Route', ',', 'obwohl', 'das', 'Ufer', 'so', 'gründlich', 'umgebaut', 'worden', 'war', ',', 'dass', 'selbst', 'die', 'Richtung', 'der', 'alten', 'Gassen', 'kaum', 'noch', 'erkennbar', 'blieb', '.'], 0),
      makeSentence('atlas-2-s2', 1, 'Behind a delivery entrance she noticed a bricked-up arch whose proportions resembled not a cellar door but the mouth of a canal.', ['Hinter', 'einer', 'Lieferzufahrt', ['nahm', 'word-wahrnehmen'], 'sie', 'einen', 'zugemauerten', 'Bogen', 'wahr', ',', 'dessen', 'Proportionen', 'weniger', 'an', 'eine', 'Kellertür', 'als', 'an', 'die', 'Mündung', 'eines', 'Kanals', 'erinnerten', '.'], 10_000, { units: [lexicalGroup([3, 8], 'wahrnehmen', 'noticed', 'separable-verb', ['grammar-separable-verbs'], 'word-wahrnehmen')] }),
      makeSentence('atlas-2-s3', 2, 'An elderly surveyor named Elias watched her compare the masonry with the atlas and asked quietly whether she too had received a blue map.', ['Ein', 'älterer', 'Vermessungsingenieur', 'namens', 'Elias', 'beobachtete', ',', 'wie', 'sie', 'das', 'Mauerwerk', 'mit', 'dem', 'Atlas', 'verglich', ',', 'und', 'fragte', 'leise', ',', 'ob', 'auch', 'sie', 'eine', 'blaue', 'Karte', 'erhalten', ['habe', undefined, ['grammar-indirect-speech']], '.'], 20_000),
      makeSentence('atlas-2-s4', 3, 'He said the plans had circulated for decades among families whose homes had vanished during a redevelopment that was officially considered exemplary.', ['Die', 'Pläne', ',', 'sagte', 'er', ',', ['seien', undefined, ['grammar-indirect-speech']], 'jahrzehntelang', 'unter', 'jenen', 'Familien', 'weitergegeben', 'worden', ',', 'deren', 'Wohnungen', 'bei', 'einer', 'offiziell', 'als', 'vorbildlich', 'geltenden', 'Sanierung', 'verschwunden', 'waren', '.'], 30_000),
      makeSentence('atlas-2-s5', 4, 'The erased river was in fact a narrow branch of the Spree, but its name had become shorthand for a neighborhood that no authority wanted to remember.', ['Der', 'getilgte', 'Fluss', ['sei', undefined, ['grammar-indirect-speech']], 'in', 'Wahrheit', 'ein', 'schmaler', 'Seitenarm', 'der', 'Spree', 'gewesen', ',', 'doch', 'sein', 'Name', 'habe', 'zugleich', 'für', 'ein', 'Viertel', 'gestanden', ',', 'an', 'das', 'keine', 'Behörde', 'erinnern', 'wollte', '.'], 40_000),
      makeSentence('atlas-2-s6', 5, 'Together they found a maintenance shaft where the sound of traffic faded and a cool draft carried the smell of wet stone.', ['Gemeinsam', 'fanden', 'sie', 'einen', 'Wartungsschacht', ',', 'in', 'dem', 'das', ['Geräusch', 'word-geraeusch'], 'des', 'Verkehrs', 'verblasste', 'und', 'ein', 'kühler', 'Luftzug', 'den', 'Geruch', 'von', 'nassem', 'Stein', 'herauftrug', '.'], 50_000),
      makeSentence('atlas-2-s7', 6, 'At its end lay a sealed room containing tapes, tenant registers, and photographs whose captions had been carefully cut away.', ['An', 'seinem', 'Ende', 'lag', 'ein', 'versiegelter', 'Raum', 'mit', 'Tonbändern', ',', 'Mieterlisten', 'und', 'Fotografien', ',', 'deren', 'Bildunterschriften', 'sorgfältig', 'herausgeschnitten', 'worden', 'waren', '.'], 60_000),
    ], peopleAndPlaceNames: [{ name: 'Mara Levin', note: 'the atlas’s inheritor' }, { name: 'Elias Dorn', note: 'a retired surveyor who knows the hidden maps' }, { name: 'Spree', note: 'the river running through central Berlin' }],
  },
  {
    id: 'atlas-3', contentId: 'silent-atlas', number: 3, title: 'Was die Karten verschweigen', summary: 'Mara must decide whether evidence belongs in an archive or in public.', estimatedMinutes: 6, access: 'free', level: 'C2',
    grammarPointIds: ['grammar-indirect-speech', 'grammar-separable-verbs'], keywordIds: ['word-erinnerung', 'word-zuverlaessig'],
    sentences: [
      makeSentence('atlas-3-s1', 0, 'The recordings did not describe a conspiracy, but something more ordinary: hearings postponed, objections misplaced, and compensation promised but never paid.', ['Die', 'Aufnahmen', 'erzählten', 'von', 'keiner', 'Verschwörung', ',', 'sondern', 'von', 'etwas', 'Alltäglicherem', ':', 'vertagten', 'Anhörungen', ',', 'verlegten', 'Einsprüchen', 'und', 'Entschädigungen', ',', 'die', 'zugesagt', ',', 'aber', 'nie', 'gezahlt', 'worden', 'waren', '.'], 0),
      makeSentence('atlas-3-s2', 1, 'Mara understood that her grandfather had not mapped a secret river; he had given a visible form to a systematically displaced memory.', ['Mara', 'begriff', ',', 'dass', 'ihr', 'Großvater', 'keinen', 'geheimen', 'Fluss', 'kartiert', 'hatte', ',', 'sondern', 'einer', 'systematisch', 'verdrängten', ['Erinnerung', 'word-erinnerung'], 'eine', 'sichtbare', 'Form', 'gegeben', 'hatte', '.'], 10_000),
      makeSentence('atlas-3-s3', 2, 'Elias wanted to hand the material anonymously to the press, fearing the archive would bury it once more beneath procedural reservations.', ['Elias', 'wollte', 'das', 'Material', 'anonym', 'der', 'Presse', 'übergeben', ',', 'weil', 'er', 'fürchtete', ',', 'das', 'Archiv', 'werde', 'es', 'unter', 'verfahrensrechtlichen', 'Vorbehalten', 'abermals', 'begraben', '.'], 20_000),
      makeSentence('atlas-3-s4', 3, 'Mara objected that evidence without a verifiable origin could be dismissed precisely by those whom it was meant to challenge.', ['Mara', 'wandte', 'ein', ',', 'Belege', 'ohne', ['zuverlässige', 'word-zuverlaessig'], 'Herkunft', 'ließen', 'sich', 'ausgerechnet', 'von', 'jenen', 'leicht', 'zurückweisen', ',', 'deren', 'Darstellung', 'sie', 'infrage', 'stellen', 'sollten', '.'], 30_000, { units: [
        lexicalGroup([1, 2], 'einwenden', 'objected', 'separable-verb', ['grammar-separable-verbs']),
        lexicalGroup([19, 20], 'infrage stellen', 'challenge / call into question', 'phrase'),
      ] }),
      makeSentence('atlas-3-s5', 4, 'They therefore designed an exhibition that placed each official plan beside the blue map and every administrative phrase beside a resident’s voice.', ['Sie', 'entwarfen', 'deshalb', 'eine', 'Ausstellung', ',', 'die', 'jedem', 'amtlichen', 'Plan', 'die', 'blaue', 'Karte', 'und', 'jeder', 'Verwaltungsformel', 'die', 'Stimme', 'einer', 'Bewohnerin', 'gegenüberstellte', '.'], 40_000),
      makeSentence('atlas-3-s6', 5, 'On opening night, visitors began adding their own missing places, until the supposedly precise city map became an unfinished web of recollections.', ['Am', 'Eröffnungsabend', 'begannen', 'die', 'Besucher', ',', 'eigene', 'verschwundene', 'Orte', 'einzutragen', ',', 'bis', 'aus', 'dem', 'vermeintlich', 'präzisen', 'Stadtplan', 'ein', 'unabgeschlossenes', 'Geflecht', 'von', 'Erinnerungen', 'wurde', '.'], 50_000),
      makeSentence('atlas-3-s7', 6, 'Mara finally wrote beneath her grandfather’s last line that a map does not lie when it leaves something out, but when it pretends nothing is missing.', ['Unter', 'die', 'letzte', 'Zeile', 'ihres', 'Großvaters', 'schrieb', 'Mara', 'schließlich', ',', 'eine', 'Karte', 'lüge', 'nicht', ',', 'wenn', 'sie', 'etwas', 'auslasse', ',', 'sondern', 'wenn', 'sie', 'behaupte', ',', 'es', 'fehle', 'nichts', '.'], 60_000),
    ], peopleAndPlaceNames: [{ name: 'Mara Levin', note: 'the conservator who makes the hidden archive public' }, { name: 'Elias Dorn', note: 'the keeper of the displaced neighborhood’s history' }],
  },
  {
    id: 'memory-1', contentId: 'memory-invention', number: 1, title: 'Das unzuverlässige Archiv', summary: 'An essay about memory and storytelling.', estimatedMinutes: 12, access: 'premium', level: 'C2',
    grammarPointIds: ['grammar-indirect-speech'], keywordIds: ['word-erinnerung', 'word-zuverlaessig'],
    sentences: [
      makeSentence('memory-1-s1', 0, 'The author claims that memory is less an archive than a continuously revised narrative.', [['Der'], ['Autor'], ['behauptet'], [','], ['Erinnerung', 'word-erinnerung'], ['sei', undefined, ['grammar-indirect-speech']], ['weniger'], ['ein'], ['Archiv'], ['als'], ['eine'], ['fortwährend'], ['überarbeitete'], ['Erzählung'], ['.']], 0),
      makeSentence('memory-1-s2', 1, 'Its unreliability is therefore not a flaw, but the condition of its vitality.', [['Ihre'], ['Unzuverlässigkeit'], ['ist'], ['demnach'], ['kein'], ['Mangel'], [','], ['sondern'], ['die'], ['Bedingung'], ['ihrer'], ['Lebendigkeit'], ['.']], 6_800),
    ], peopleAndPlaceNames: [],
  },
];

const mockChapters: Chapter[] = chapterDefinitions.map(({ level: _level, ...chapter }) => buildChapter(chapter));

function summaryForChapter(chapter: Chapter): ChapterSummary {
  const { id, contentId, number, title, summary, estimatedMinutes, access } = chapter;
  return { id, contentId, number, title, summary, estimatedMinutes, access };
}

// Stable remote Unsplash links. Images are loaded and cached by expo-image at runtime;
// no stock photography is bundled with the app.
const stockCovers = {
  keys: 'https://images.unsplash.com/photo-1694792379188-17ec34beec87?auto=format&fit=crop&w=1600&q=80',
  lakeTrain: 'https://images.unsplash.com/photo-1663947665896-fbf7981814fe?auto=format&fit=crop&w=1600&q=80',
  berlinCafe: 'https://images.unsplash.com/photo-1749651340669-53865b2a5860?auto=format&fit=crop&w=1600&q=80',
  nightTram: 'https://images.unsplash.com/photo-1762656668861-6cb4945a5fbe?auto=format&fit=crop&w=1600&q=80',
  nightCity: 'https://images.unsplash.com/photo-1588444207247-a6943699e311?auto=format&fit=crop&w=1600&q=80',
  journal: 'https://images.unsplash.com/photo-1753756510738-33a176dd3b0a?auto=format&fit=crop&w=1600&q=80',
} as const;

const mockContent: ContentSummary[] = [
  { id: 'missing-key', slug: 'der-verschwundene-schluessel', type: 'story', title: 'The Missing Key', subtitle: 'A small search in a big house', description: 'Mila searches for her key and follows a surprising trail.', level: 'A1', topic: 'Everyday life', tags: ['Family', 'Home', 'Birthday'], coverImage: stockCovers.keys, palette: { background: '#EAD8D2', foreground: '#74392F', accent: '#A63D40' }, chapterCount: 3, estimatedMinutes: 9, publishedAt: '2026-07-12', access: 'free', featured: true },
  { id: 'sunday-lake', slug: 'ein-sonntag-am-see', type: 'article', title: 'A Sunday at the Lake', description: 'A short train trip with a picnic and a summer shower.', level: 'A2', topic: 'Travel', tags: ['Nature', 'Berlin', 'Weekend'], coverImage: stockCovers.lakeTrain, palette: { background: '#DFE7DA', foreground: '#3C5A40', accent: '#4F7A5B' }, chapterCount: 1, estimatedMinutes: 5, publishedAt: '2026-07-15', access: 'free', featured: true },
  { id: 'polite-course', slug: 'hoeflich-fragen', type: 'course', title: 'Asking Politely', subtitle: 'Everyday German', description: 'Practical phrases for the station, café, and neighborhood.', level: 'B1', topic: 'Language', tags: ['Dialogue', 'Politeness', 'Everyday life'], coverImage: stockCovers.berlinCafe, palette: { background: '#EFE5C8', foreground: '#6A551F', accent: '#C99A45' }, chapterCount: 1, estimatedMinutes: 6, publishedAt: '2026-07-10', access: 'free', featured: true },
  { id: 'last-tram', slug: 'die-letzte-strassenbahn', type: 'story', title: 'The Last Tram', description: 'A late-night ride, a stranger’s suitcase, and a difficult choice.', level: 'B2', topic: 'Mystery', tags: ['Suspense', 'City', 'Night'], coverImage: stockCovers.nightTram, palette: { background: '#DAE3E8', foreground: '#33566A', accent: '#5E7E93' }, chapterCount: 1, estimatedMinutes: 7, publishedAt: '2026-07-08', access: 'premium', featured: true },
  { id: 'city-sound', slug: 'warum-staedte-nachts-anders-klingen', type: 'article', title: 'Why Cities Sound Different at Night', description: 'How attention, architecture, and sound change after sunset.', level: 'C1', topic: 'Science', tags: ['Acoustics', 'City', 'Psychology'], coverImage: stockCovers.nightCity, palette: { background: '#E2DDE7', foreground: '#52465E', accent: '#8A7A99' }, chapterCount: 1, estimatedMinutes: 9, publishedAt: '2026-07-17', access: 'premium', featured: false },
  { id: 'silent-atlas', slug: 'die-kartografin-des-schweigens', type: 'story', title: 'The Cartographer of Silence', subtitle: 'A hidden history beneath Berlin', description: 'An inherited atlas leads Mara into a neighborhood erased from the city’s official memory.', level: 'C2', topic: 'Mystery', tags: ['Archive', 'Berlin', 'Memory'], coverImage: stockCovers.journal, palette: { background: '#D9DFDF', foreground: '#334747', accent: '#617E7E' }, chapterCount: 3, estimatedMinutes: 20, publishedAt: '2026-07-20', access: 'free', featured: true },
  { id: 'memory-invention', slug: 'zwischen-erinnerung-und-erfindung', type: 'article', title: 'Between Memory and Invention', description: 'An essay about memory as a story that changes over time.', level: 'C2', topic: 'Culture', tags: ['Essay', 'Memory', 'Philosophy'], coverImage: stockCovers.journal, palette: { background: '#E5E0D4', foreground: '#4C443A', accent: '#9B7E5B' }, chapterCount: 1, estimatedMinutes: 12, publishedAt: '2026-07-03', access: 'premium', featured: false },
];

const mockDetails: ContentDetail[] = mockContent.map((content) => {
  const chapters = mockChapters.filter((chapter) => chapter.contentId === content.id);
  return {
    ...content,
    longDescription: `${content.description} This original Bearlin demo text shows vocabulary, grammar, and reading progress in context.`,
    chapters: chapters.map(summaryForChapter),
    keywordIds: [...new Set(chapters.flatMap((chapter) => chapter.keywordIds))],
    grammarPointIds: [...new Set(chapters.flatMap((chapter) => chapter.grammarPointIds))],
  };
});

export const mockDataset: MockContentDataset = {
  content: mockContent,
  details: mockDetails,
  chapters: mockChapters,
  dictionary: mockDictionary,
  grammar: mockGrammar,
  collections: [
    { id: 'start-here', title: 'Start here', description: 'Short, approachable texts for your first weeks of reading.', contentIds: ['missing-key', 'sunday-lake'] },
    { id: 'city-at-night', title: 'The city at night', description: 'Suspenseful and analytical views of life after sunset.', contentIds: ['last-tram', 'city-sound'] },
    { id: 'think-in-german', title: 'Think further in German', description: 'Demanding texts for advanced readers.', contentIds: ['city-sound', 'silent-atlas', 'memory-invention'] },
  ],
};
