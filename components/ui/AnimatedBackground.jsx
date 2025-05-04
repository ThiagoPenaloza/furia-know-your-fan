import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const backgrounds = {
  "/profile":
    "url('https://furiagg.fbitsstatic.net/img/b/1be4afd5-a727-4555-81fd-e779a32578be.jpg')",
  "/connect-social":
    "url('https://furiagg.fbitsstatic.net/img/b/1be4afd5-a727-4555-81fd-e779a32578be.jpg')", // ou outro se quiser
  // adicione outras rotas se quiser backgrounds diferentes
};

export default function AnimatedBackground() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [bg, setBg] = useState(
    backgrounds[router.pathname] || backgrounds["/profile"]
  );

  useEffect(() => {
    setVisible(false);
    const timeout = setTimeout(() => {
      setBg(backgrounds[router.pathname] || backgrounds["/profile"]);
      setVisible(true);
    }, 700); // duração do fade-out

    return () => clearTimeout(timeout);
  }, [router.pathname]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        backgroundImage: bg,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        transition: "opacity 0.7s ease",
        opacity: visible ? 1 : 0,
      }}
      aria-hidden
    />
  );
}
