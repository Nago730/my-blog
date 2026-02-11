"use client";

import { useAuth } from "@/context/AuthContext";
import React from "react";

interface AdminOnlyProps {
  children: React.ReactNode;
}

export default function AdminOnly({ children }: AdminOnlyProps) {
  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  return <>{children}</>;
}
