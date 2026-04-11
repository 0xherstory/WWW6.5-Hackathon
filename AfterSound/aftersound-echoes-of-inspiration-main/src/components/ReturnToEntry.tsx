import { Link } from "react-router-dom";

export default function ReturnToEntry() {
  return (
    <Link
      to="/"
      className="fixed top-5 left-5 z-[60] text-serif-cn text-sm text-foreground/20 hover:text-foreground/50 transition-all duration-500 hover:shadow-[0_0_20px_hsla(260,40%,55%,0.08)]"
      title="返回余音"
    >
      余音
    </Link>
  );
}
