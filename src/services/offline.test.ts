import { enqueueOfflineMutation } from './offline';

describe('habit mutation queue boundary', () => {
  it('does not enqueue ambiguous legacy habit toggles', async () => {
    const result = await enqueueOfflineMutation({ method: 'post', url: '/habit/h1/toggle', data: { date: '2026-11-14' } } as any);
    expect(result).toBeNull();
  });
});
