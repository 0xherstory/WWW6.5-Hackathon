"use client";

import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex w-full max-w-xl items-center"
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="搜索企业..."
        className="h-12 rounded-xl border-[#E5E6EB] bg-card pl-11 pr-12 shadow-sm focus-visible:ring-2 focus-visible:ring-[#165DFF]/50"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <Button
        type="submit"
        size="sm"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 rounded-lg px-3 text-xs"
      >
        搜索
      </Button>
    </form>
  );
}