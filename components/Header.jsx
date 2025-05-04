"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Home, UserCircle, Share2, LogIn } from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";

export default function Header() {
  const { data: session } = useSession();

  const navItems = [
    {
      name: "Home",
      url: "/",
      icon: Home,
    },
    {
      name: "Redes Sociais",
      url: "/connect-social",
      icon: Share2,
    },
    ...(session
      ? [
          {
            name: "Perfil",
            url: "/profile",
            icon: UserCircle,
          },
        ]
      : [
          {
            name: "Entrar",
            url: "/login",
            icon: LogIn,
          },
        ]),
  ];

  return <NavBar items={navItems} />;
}
