import type { ReactNode } from 'react';

export interface NanoRequest {
  filePath: string;
  initialContent: string;
  readonly: boolean;
}

export interface CommandResult {
  output: ReactNode[];
  nano?: NanoRequest;
  overlay?: 'matrix' | 'snake' | 'pong' | 'dino';
}

export type CommandHandler = (args: string[]) => CommandResult;

const commands = new Map<string, CommandHandler>();

export function registerCommand(name: string, handler: CommandHandler): void {
  commands.set(name, handler);
}

export function executeCommand(input: string): CommandResult {
  const parts = input.trim().split(/\s+/);
  const name = parts[0].toLowerCase();
  const args = parts.slice(1);

  const handler = commands.get(name);
  if (handler) {
    return handler(args);
  }

  return {
    output: [
      <span>
        command not found: <span className="c-accent5">{name}</span>. Try '
        <span className="c-accent1">help</span>' — I promise it works.
      </span>,
    ],
  };
}

export function getCommandNames(): string[] {
  return Array.from(commands.keys());
}
