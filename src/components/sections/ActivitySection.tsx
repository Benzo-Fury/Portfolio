import Section from "../Section";
import DecodeText from "../effects/DecodeText";
import Reveal from "../effects/Reveal";
import ContributionGraph from "../activity/ContributionGraph";
import type { ActivityData } from "../../content";
import { formatDateShort, pluralize } from "../../lib/format";

type Props = {
  registerRef: (index: number) => (el: HTMLElement | null) => void;
  activity: ActivityData;
};

function ActivitySection({ registerRef, activity }: Props) {
  return (
    <Section id="activity" index={2} registerRef={registerRef} className="py-20 sm:py-32">
      <div className="space-y-10 sm:space-y-12">
        <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-light">
              <DecodeText text="Activity" />
            </h2>
            <p className="text-sm text-muted-foreground">
              {pluralize(activity.total, "contribution")} in the last year · updated {formatDateShort(activity.generatedAt)}
            </p>
          </div>
          <a
            href={`https://github.com/${activity.user}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground font-mono hover:text-foreground transition-colors duration-300"
          >
            @{activity.user} <span aria-hidden="true">↗</span>
          </a>
        </Reveal>

        <Reveal delay={120}>
          <ContributionGraph data={activity} />
        </Reveal>
      </div>
    </Section>
  );
}

export default ActivitySection;
