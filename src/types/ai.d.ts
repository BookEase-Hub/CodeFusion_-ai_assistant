export interface AIProblem {
    id: string;
    type: "error" | "warning" | "info";
    message: string;
    file: string;
    line: number;
}

export interface AIPrompt {
    id: string;
    prompt: string;
}

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    code?: { language: string; value: string };
    suggestions?: string[];
    problems?: AIProblem[];
}
