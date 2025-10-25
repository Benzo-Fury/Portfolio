import Section from "../Section";
import { ArrowRight } from "../icons/ArrowRight";
import type { Social } from "../../content";
import Card from "../generic/Card";

type Props = {
  registerRef: (index: number) => (el: HTMLElement | null) => void;
  email: string;
  socials: Social[];
};

function ConnectSection({ registerRef, email, socials }: Props) {
  return (
    <Section
      id="connect"
      index={3}
      registerRef={registerRef}
      className="py-20 sm:py-32 opacity-0"
    >
      <div className="grid lg:grid-cols-2 gap-12 sm:gap-16">
        <div className="space-y-6 sm:space-y-8">
          <h2 className="text-3xl sm:text-4xl font-light">Let's Connect</h2>

          <div className="space-y-6">
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Always interested in new opportunities, collaborations, and
              conversations about technology and design.
            </p>

            <div className="space-y-4">
              <a
                href={`mailto:${email}`}
                className="group flex items-center gap-3 text-foreground hover:text-muted-foreground transition-colors duration-300"
              >
                <span className="text-base sm:text-lg">{email}</span>
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <div className="text-sm text-muted-foreground font-mono">
            ELSEWHERE
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {socials.map((social) => (
              <SocialCard key={social.name} social={social} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function SocialCard({ social }: { social: Social }) {
  const Icon = social.icon;
  return (
    <a href={social.url} target="_blank" rel="noreferrer" className="block">
      <Card className="p-4 sm:p-4 hover:shadow-sm duration-300">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-foreground group-hover:text-muted-foreground transition-colors duration-300">
            {Icon ? <Icon className="w-4 h-4" /> : null}
            <span>{social.name}</span>
          </div>
          <div className="text-sm text-muted-foreground">{social.handle}</div>
        </div>
      </Card>
    </a>
  );
}

export default ConnectSection;
