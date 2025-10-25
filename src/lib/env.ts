export function getPublicEnv(name: string): string | undefined {
  try {
    const metaEnv = (import.meta as any)?.env;
    if (metaEnv && typeof metaEnv[name] !== "undefined") {
      return metaEnv[name];
    }
  } catch {}
  const proc = (globalThis as any)?.process;
  if (proc?.env && typeof proc.env[name] !== "undefined") {
    return proc.env[name];
  }
  return undefined;
}


