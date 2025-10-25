import Section from "../Section";

type SectionProps = {
  registerRef: (index: number) => (el: HTMLElement | null) => void;
  skills: readonly string[];
};

function IntroSection({ registerRef, skills }: SectionProps) {
  return (
    <Section
      id="intro"
      index={0}
      registerRef={registerRef}
      className="min-h-screen flex items-center opacity-0"
    >
      <div className="grid lg:grid-cols-5 gap-12 sm:gap-16 w-full">
        <div className="lg:col-span-3 space-y-6 sm:space-y-8">
          <div className="space-y-3 sm:space-y-2">
            <div className="text-sm text-muted-foreground font-mono tracking-wider">
              PORTFOLIO / 2025
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
              Neo
              <br />
              <span className="text-muted-foreground">Haggard</span>
            </h1>
          </div>

          <div className="space-y-6 max-w-md">
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              17 y/o Backend Developer architecting scalable systems at the
              intersection of
              <span className="text-foreground"> moduralarity</span>,
              <span className="text-foreground"> performance</span>, and
              <span className="text-foreground"> maintainability</span>.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Available for work
              </div>
              <div>Australia</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col justify-end space-y-6 sm:space-y-8 mt-8 lg:mt-0">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground font-mono">
              CURRENTLY
            </div>
            <div className="space-y-2">
              <div className="text-foreground">Backend Developer</div>
              <div className="text-muted-foreground">for freelance</div>
              <div className="text-xs text-muted-foreground">
                2024 — Present
              </div>
            </div>
          </div>
          <Skills skills={skills} />
        </div>
      </div>
    </Section>
  );
}

type SkillsProps = {
  skills: readonly string[];
};

export function Skills({ skills }: SkillsProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground font-mono">SKILLS</div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="px-3 py-1 text-xs border border-border rounded-full hover:border-muted-foreground/50 transition-colors duration-300 cursor-default"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

export default IntroSection;
