import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="paper-card px-10 py-12 text-center max-w-md">
        <h1 className="mb-4 text-5xl font-hand font-bold text-foreground">404</h1>
        <p className="mb-4 text-lg text-muted-foreground">页面走丢啦</p>
        <a href="/" className="font-hand text-lg text-primary underline decoration-primary/40 underline-offset-4 hover:text-primary/90">
          回首页
        </a>
      </div>
    </div>
  );
};

export default NotFound;
