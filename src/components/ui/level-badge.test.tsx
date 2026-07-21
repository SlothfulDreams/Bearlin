import { render } from '@testing-library/react-native';

import { LevelBadge } from './level-badge';

describe('LevelBadge', () => {
  it('announces the CEFR level accessibly', async () => {
    const screen = await render(<LevelBadge level="B1" />);
    expect(screen.getByLabelText('CEFR B1')).toBeTruthy();
    expect(screen.getByText('B1')).toBeTruthy();
  });
});
