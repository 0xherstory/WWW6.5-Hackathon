import { StandalonePageSection } from "../components/sections/StandalonePageSection";
import { standalonePages } from "../data/site";

export default function Donations() {
  return (
    <StandalonePageSection
      src={standalonePages.donations.src}
      title={standalonePages.donations.title}
    />
  );
}
