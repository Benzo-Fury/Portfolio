import { useSectionObserver } from "../lib/useSectionObserver";
import { useThemeToggle } from "../lib/useThemeToggle";
import { sections, skills, projects, posts, socials, contactEmail } from "../content";
import NavigationDots from "../components/NavigationDots";
import Footer from "../components/footer/Footer";
import Header from "../components/sections/Header";
import IntroSection from "../components/sections/IntroSection";
import ProjectsSection from "../components/sections/ProjectsSection";
import ThoughtsSection from "../components/sections/ThoughtsSection";
import ConnectSection from "../components/sections/ConnectSection";

export default function Home() {
  const { isDark, toggleTheme } = useThemeToggle(true);
  const { activeSection, registerSectionRef } = useSectionObserver([
    ...sections,
  ]);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Header />

      <NavigationDots
        sections={[...sections]}
        activeSection={activeSection}
        onSelect={scrollToSection}
      />

      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
        <IntroSection registerRef={registerSectionRef} skills={skills} />
        <ProjectsSection registerRef={registerSectionRef} projects={projects} />
        <ThoughtsSection registerRef={registerSectionRef} />
        <ConnectSection registerRef={registerSectionRef} email={contactEmail} socials={socials} />
        <Footer isDark={isDark} onToggleTheme={toggleTheme} />
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none"></div>
    </div>
  );
}
