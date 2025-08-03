"use client"

import React from 'react';

export function Sidebar({ children }: { children: React.ReactNode }) {
  return <div className="w-64 bg-[#252526] text-gray-300">{children}</div>;
}
