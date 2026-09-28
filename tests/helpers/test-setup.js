/**
 * @file Jest `setupFilesAfterEnv` entry: before each test, reset the chrome fake, replace
 * fetch with a fresh mock and silence (but record) console output; restore spies after.
 */
beforeEach(() => {
  globalThis.chrome._reset();
  globalThis.fetch = jest.fn();
  for (const level of ['debug', 'info', 'warn', 'error']) {
    jest.spyOn(console, level).mockImplementation(() => {});
  }
});

afterEach(() => {
  jest.restoreAllMocks();
});
