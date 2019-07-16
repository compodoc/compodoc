export function Nothing() {
  return function <T extends { new (...args: any[]): {} }>(targetClassConstructor: T) {
  };
}
