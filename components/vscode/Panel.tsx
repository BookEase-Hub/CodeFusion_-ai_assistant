"use client"

import React from 'react';

export function Panel({ children }: { children: React.ReactNode }) {
  return <div className="h-48 bg-[#1e1e1e] text-gray-300">{children}</div>;
}
