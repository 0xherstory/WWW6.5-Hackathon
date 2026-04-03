import { cn } from "../../lib/cn";

interface GeneratedAvatarProps {
  address: string;
  className?: string;
  size?: number;
}

function hashNumber(source: string, seed: number) {
  let hash = 0;
  const text = `${source}${seed}`;

  for (let index = 0; index < text.length; index += 1) {
    hash = (Math.imul(31, hash) + text.charCodeAt(index)) | 0;
  }

  return Math.abs(hash);
}

export function GeneratedAvatar({ address, className, size = 28 }: GeneratedAvatarProps) {
  const palette = ["#C4A85A", "#9B7FD4", "#6A8FD4", "#D47F9B", "#7FD49B", "#D4A07F", "#7FB4D4"];
  const seed = address || "0xdead";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      className={cn("rounded-full border border-[var(--line)] bg-[#18182A]", className)}
    >
      <rect width="28" height="28" fill="#18182A" />
      {Array.from({ length: 5 }).map((_, index) => {
        const cx = 4 + (hashNumber(seed, index * 3) % 20);
        const cy = 4 + (hashNumber(seed, index * 3 + 1) % 20);
        const radius = 4 + (hashNumber(seed, index * 3 + 2) % 8);
        const fill = palette[hashNumber(seed, index) % palette.length];
        const opacity = (0.5 + (index % 3) * 0.18).toFixed(2);

        return <circle key={`${cx}-${cy}-${radius}`} cx={cx} cy={cy} r={radius} fill={fill} opacity={opacity} />;
      })}
    </svg>
  );
}
