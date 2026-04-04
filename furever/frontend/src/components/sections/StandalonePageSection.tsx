import type { ReactNode } from "react";

import { StandaloneLayout } from "../layout/StandaloneLayout";
import { StandaloneFrame } from "../ui/StandaloneFrame";

type StandalonePageSectionProps = {
  src: string;
  title: string;
  hiddenSelectors?: string[];
  overlay?: ReactNode;
};

export function StandalonePageSection({
  src,
  title,
  hiddenSelectors,
  overlay,
}: StandalonePageSectionProps) {
  return (
    <StandaloneLayout>
      <StandaloneFrame
        src={src}
        title={title}
        hiddenSelectors={hiddenSelectors}
        overlay={overlay}
      />
    </StandaloneLayout>
  );
}
