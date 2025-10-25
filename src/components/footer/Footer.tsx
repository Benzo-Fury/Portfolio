import ThemeToggle from "./ThemeToggle";

type Props = {
  isDark: boolean;
  onToggleTheme: () => void;
};

export function Footer({ isDark, onToggleTheme }: Props) {
  return (
    <footer className="py-12 sm:py-16 border-t border-border">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            © 2025 Neo Haggard. All rights reserved.
          </div>
          <div className="text-xs text-muted-foreground">
            Site template taken from Felix Macaspac on v0.dev
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle isDark={isDark} onClick={onToggleTheme} />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
