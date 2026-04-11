import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton = ({ onClick }: FloatingActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-16 h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group"
      style={{
        boxShadow: "0 4px 20px hsl(15, 55%, 55%, 0.4), 0 0 40px hsl(15, 55%, 55%, 0.2)",
      }}
    >
      <Plus 
        size={28} 
        strokeWidth={2.5}
        className="transition-transform duration-300 group-hover:rotate-90" 
      />
    </button>
  );
};

export default FloatingActionButton;
