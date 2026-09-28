/**
 * @file Jest `setupFiles` entry: installs a fresh chrome fake before each test file loads.
 */
import { createChromeFake } from './chrome-fake.js';

globalThis.chrome = createChromeFake();
