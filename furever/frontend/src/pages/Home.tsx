import { StandalonePageSection } from "../components/sections/StandalonePageSection";
import { standalonePages } from "../data/site";
import { HomeWalletButton } from "../providers/Web3Provider";

export default function Home() {
  return (
    <StandalonePageSection
      src={standalonePages.home.src}
      title={standalonePages.home.title}
      hiddenSelectors={[".nav-wallet"]}
      overlay={
        <div className="absolute right-4 top-[14px] md:right-8">
          <div className="pointer-events-auto">
            <HomeWalletButton />
          </div>
        </div>
      }
    />
  );
}
