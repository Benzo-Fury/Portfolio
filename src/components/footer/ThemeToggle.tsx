import { Sun } from "../icons/Sun";
import { Moon } from "../icons/Moon";

type Props = {
  isDark: boolean;
  onClick: () => void;
};

export function ThemeToggle({ isDark, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="group p-3 rounded-lg border border-border hover:border-muted-foreground/50 transition-all duration-300"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
      )}
    </button>
  );
}

export default ThemeToggle;
