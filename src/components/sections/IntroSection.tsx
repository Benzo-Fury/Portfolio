import Section from "../Section";
import DotField from "../effects/DotField";
import DecodeText from "../effects/DecodeText";
import Reveal from "../effects/Reveal";

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
      className="relative isolate min-h-screen flex items-center pt-2.5 sm:pt-0"
    >
      {/* Full-bleed interactive background, fading out toward the next section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
      >
        <DotField />
      </div>

      <div className="grid lg:grid-cols-5 gap-12 sm:gap-16 w-full">
        <div className="lg:col-span-3 space-y-6 sm:space-y-8">
          <div className="space-y-3 sm:space-y-2">
            <Reveal className="text-sm text-muted-foreground font-mono tracking-wider">
              PORTFOLIO / 2026
            </Reveal>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
              <DecodeText text="Neo" trigger="mount" delay={150} className="block" />
              <DecodeText text="Haggard" trigger="mount" delay={300} className="block text-muted-foreground" />
            </h1>
          </div>

          <Reveal stagger delay={250} className="space-y-6 max-w-md">
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              19 y/o Full-stack Developer building end-to-end products, from
              scalable backends to polished interfaces, at the intersection of
              <span className="text-foreground"> modularity</span>,
              <span className="text-foreground"> performance</span>, and
              <span className="text-foreground"> maintainability</span>.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-signal rounded-full animate-pulse"></div>
                Available for work
              </div>
              <div>Australia</div>
            </div>
          </Reveal>
        </div>

        <Reveal stagger delay={450} className="lg:col-span-2 flex flex-col justify-end space-y-6 sm:space-y-8 mt-8 lg:mt-0">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground font-mono">
              CURRENTLY
            </div>
            <div className="space-y-2">
              <DecodeText text="Full-stack Developer" trigger="mount" delay={700} className="block text-foreground" />
              <div className="text-muted-foreground">for freelance</div>
              <div className="text-xs text-muted-foreground">
                2024 — Present
              </div>
            </div>
          </div>
          <Skills skills={skills} />
        </Reveal>
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
