"use client";

import React, { useState, useEffect, useRef } from 'react';

export function Terminal() {
    const [history, setHistory] = useState<string[]>([
        "Welcome to CodeFusion Terminal!",
        "Type 'help' for a list of mock commands."
    ]);
    const [command, setCommand] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleCommand = (cmd: string) => {
        if (!cmd) return;

        let output = `$ ${cmd}`;
        setHistory(h => [...h, output]);

        const commandParts = cmd.toLowerCase().split(' ');
        const mainCommand = commandParts[0];

        switch(mainCommand) {
            case 'help':
                output = "Available commands: help, clear, date, echo, npm, git";
                break;
            case 'clear':
                setHistory([]);
                return;
            case 'date':
                output = new Date().toLocaleString();
                break;
            case 'echo':
                output = commandParts.slice(1).join(' ');
                break;
            case 'npm':
                if (commandParts[1] === 'start') {
                    output = "> codefusion-app@0.1.0 dev\n> next dev\n\n  ▲ Next.js 14.2.16\n  - Local:        http://localhost:3000\n\n ✓ Starting...";
                } else {
                    output = `npm: command not found: ${commandParts[1]}`;
                }
                break;
            case 'git':
                if (commandParts[1] === 'status') {
                    output = "On branch main. Your branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean";
                } else {
                    output = `git: command not found: ${commandParts[1]}`;
                }
                break;
            default:
                output = `command not found: ${cmd}`;
        }
        setHistory(h => [...h, output]);
        setCommand("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleCommand(command);
        }
    };

    return (
        <div className="h-full bg-[#1e1e1e] text-white font-mono text-sm p-2 flex flex-col" onClick={() => inputRef.current?.focus()}>
            <div className="flex-1 overflow-y-auto">
                {history.map((line, index) => (
                    <div key={index} className="whitespace-pre-wrap">{line}</div>
                ))}
                <div ref={endRef} />
            </div>
            <div className="flex items-center">
                <span className="text-green-400 mr-2">$</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none border-none text-white"
                    autoFocus
                />
            </div>
        </div>
    );
}
