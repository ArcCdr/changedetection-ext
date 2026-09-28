import { createLogger } from '../../src/lib/log.js';

describe('createLogger', () => {
  test('prefixes each level with [cdio:<scope>] and forwards arguments', () => {
    const log = createLogger('unit');
    log.debug('a %s', 'x');
    log.info('b %d', 1);
    log.warn('c');
    log.error('d %s %d', 'y', 2);
    expect(console.debug).toHaveBeenCalledWith('[cdio:unit] a %s', 'x');
    expect(console.info).toHaveBeenCalledWith('[cdio:unit] b %d', 1);
    expect(console.warn).toHaveBeenCalledWith('[cdio:unit] c');
    expect(console.error).toHaveBeenCalledWith('[cdio:unit] d %s %d', 'y', 2);
  });
});
