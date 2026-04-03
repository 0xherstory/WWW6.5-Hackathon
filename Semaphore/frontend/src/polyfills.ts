import { Buffer } from "buffer";
import process from "process";

const globalScope = globalThis as typeof globalThis & {
  Buffer?: typeof Buffer;
  process?: typeof process;
};

if (!(globalThis as { global?: typeof globalThis }).global) {
  (globalThis as { global: typeof globalThis }).global = globalThis;
}

if (!globalScope.Buffer) {
  globalScope.Buffer = Buffer;
}

if (!globalScope.process) {
  globalScope.process = process;
}
