import { useState } from "react";
import Navbar from "@/components/Navbar";
import StarField from "@/components/StarField";
import Landing from "@/pages/Landing";
import SplashScreen from "@/components/SplashScreen";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <StarField />
      <Navbar />
      <Landing />
    </>
  );
};

export default Index;
