import { Icons } from "@/components/common/icons";

interface SocialInterface {
  name: string;
  username: string;
  icon: any;
  link: string;
}

export const SocialLinks: SocialInterface[] = [
  {
    name: "Github",
    username: "@trungit",
    icon: Icons.gitHub,
    link: "https://github.com/trungit",
  },
  {
    name: "LinkedIn",
    username: "Nguyen Chi Trung",
    icon: Icons.linkedin,
    link: "https://www.linkedin.com/in/trung-junior-it-bd",
  },
  {
    name: "Gmail",
    username: "trungnc.contact",
    icon: Icons.gmail,
    link: "mailto:trungnc.contact@gmail.com",
  },
];

