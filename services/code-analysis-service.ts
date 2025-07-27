export class CodeAnalysisService {
  async analyzeCode(code: string): Promise<any> {
    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lines = code.split('\n').length;
    const chars = code.length;
    const issues = [];

    if (code.includes('console.log')) {
      issues.push({
        message: "Found 'console.log'. Avoid using console.log in production code.",
      });
    }

    if (code.includes('var ')) {
      issues.push({
        message: "Found 'var'. Use 'let' or 'const' instead.",
      });
    }

    return {
      lines,
      chars,
      issues,
    };
  }
}
