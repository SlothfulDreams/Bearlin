import { act, render, waitFor } from '@testing-library/react-native';

import { NativeWindThemeSync } from '@/providers/nativewind-theme-sync';
import { useLearningStore } from '@/store/learning-store';

const mockSetColorScheme = jest.fn();

jest.mock('nativewind', () => ({
  useColorScheme: () => ({ setColorScheme: mockSetColorScheme }),
}));

describe('NativeWindThemeSync', () => {
  beforeEach(() => {
    mockSetColorScheme.mockClear();
    useLearningStore.getState().updatePreferences({ appTheme: 'system' });
  });

  it('syncs persisted system and manual color-scheme preferences', async () => {
    const screen = await render(<NativeWindThemeSync />);
    await waitFor(() => expect(mockSetColorScheme).toHaveBeenCalledWith('system'));

    await act(async () => useLearningStore.getState().updatePreferences({ appTheme: 'dark' }));
    await waitFor(() => expect(mockSetColorScheme).toHaveBeenCalledWith('dark'));

    await screen.unmount();
  });
});
