type Props = {
  sections: string[];
  activeSection: string;
  onSelect: (id: string) => void;
};

export function NavigationDots({ sections, activeSection, onSelect }: Props) {
  return (
    <nav className="fixed left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
      <div className="flex flex-col gap-4">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => onSelect(section)}
            className={`w-2 h-8 rounded-full transition-all duration-500 ${
              activeSection === section
                ? "bg-foreground"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
            }`}
            aria-label={`Navigate to ${section}`}
          />
        ))}
      </div>
    </nav>
  );
}

export default NavigationDots;


