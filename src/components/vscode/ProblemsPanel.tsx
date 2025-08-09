"use client";

import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

const mockProblems = [
    { id: 1, type: "error", message: "Cannot find module 'react-router-dom'", file: "src/components/App.tsx", line: 2 },
    { id: 2, type: "warning", message: "Variable 'data' is declared but never used", file: "src/hooks/useAuth.ts", line: 15 },
    { id: 3, type: "info", message: "Consider using const instead of let here", file: "src/index.tsx", line: 5 },
];

export function ProblemsPanel() {
  return (
    <div className="h-full bg-[#1e1e1e] text-gray-300 text-sm p-2 overflow-y-auto">
      <div className="mb-2 font-semibold">PROBLEMS ({mockProblems.length})</div>
      {mockProblems.map((problem) => (
        <div key={problem.id} className="flex items-start py-1 px-2 hover:bg-[#2a2d2e] rounded-sm cursor-pointer">
          {problem.type === "error" ? (
            <AlertCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5 flex-shrink-0" />
          ) : problem.type === "warning" ? (
            <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500 mt-0.5 flex-shrink-0" />
          ) : (
            <Info className="h-4 w-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <div>{problem.message}</div>
            <div className="text-gray-500 text-xs">
              {problem.file}:{problem.line}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
