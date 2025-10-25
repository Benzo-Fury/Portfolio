import { Linkedin, type LucideIcon } from "lucide-react";
import { SiGithub, SiInstagram, SiDiscord } from "@icons-pack/react-simple-icons";

export type Social = {
  name: string;
  handle: string;
  url: string;
  icon?: LucideIcon | React.ComponentType<any>;
};

export const socials: Social[] = [
  {
    name: "GitHub",
    handle: "@Benzo-Fury",
    url: "https://github.com/Benzo-Fury",
    icon: SiGithub,
  },
  {
    name: "LinkedIn",
    handle: "@neo-haggard",
    url: "https://www.linkedin.com/in/neo-haggard-515750388/",
    icon: Linkedin,
  },
  {
    name: "Instagram",
    handle: "@neo.develops",
    url: "https://www.instagram.com/neo.develops/",
    icon: SiInstagram,
  },
  {
    name: "Discord",
    handle: "Neo Develops",
    url: "https://discord.gg/sSVDuawYpx",
    icon: SiDiscord,
  },
];


