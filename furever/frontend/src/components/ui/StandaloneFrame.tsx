import { useCallback, useRef } from "react";

type StandaloneFrameProps = {
  src: string;
  title: string;
  hiddenSelectors?: string[];
  overlay?: React.ReactNode;
};

export function StandaloneFrame({
  src,
  title,
  hiddenSelectors = [],
  overlay,
}: StandaloneFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleLoad = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    hiddenSelectors.forEach((selector) => {
      doc.querySelectorAll<HTMLElement>(selector).forEach((element) => {
        element.style.visibility = "hidden";
        element.style.pointerEvents = "none";
      });
    });
  }, [hiddenSelectors]);

  return (
    <div className="relative h-full w-full">
      {overlay ? (
        <div className="pointer-events-none absolute inset-0 z-10">
          {overlay}
        </div>
      ) : null}
      <iframe
        ref={iframeRef}
        title={title}
        src={src}
        onLoad={handleLoad}
        className="block h-full w-full border-0"
      />
    </div>
  );
}
