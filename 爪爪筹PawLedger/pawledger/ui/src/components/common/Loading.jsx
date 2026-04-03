const SIZES = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };

export default function Loading({ size = "md", className = "" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${SIZES[size]} border-2 border-emerald-600 border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
}
