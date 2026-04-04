import { StandalonePageSection } from "../components/sections/StandalonePageSection";
import { standalonePages } from "../data/site";

export default function CloudAdoption() {
  return (
    <StandalonePageSection
      src={standalonePages.cloudAdoption.src}
      title={standalonePages.cloudAdoption.title}
    />
  );
}
