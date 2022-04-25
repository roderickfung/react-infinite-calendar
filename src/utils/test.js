import { chunk } from '.';

describe('Chunk Function', () => {
  it('splits into equal sized chunks', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const result = chunk(input, 4);
    expect(result).toHaveLength(4);
    expect(result[0]).toHaveLength(3);
    expect(result[0][2]).toBe(3);
  });
});
