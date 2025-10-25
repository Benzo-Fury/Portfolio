import { useEffect, useState } from "react";

export function useThemeToggle(initialDark?: boolean) {
  const getInitial = () => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      if (typeof document !== "undefined") {
        return document.documentElement.classList.contains("dark");
      }
    } catch {}
    return initialDark ?? true;
  };

  const [isDark, setIsDark] = useState<boolean>(getInitial);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {}
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return { isDark, toggleTheme } as const;
}


