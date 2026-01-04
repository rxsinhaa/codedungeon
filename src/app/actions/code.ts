'use server';

import axios from 'axios';
import { generateCodingQuests, type GenerateCodingQuestsInput, type GenerateCodingQuestsOutput, type Quest } from '@/ai/flows/generate-coding-quests';

export type ExecutionResult = {
  run: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: null | string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: null | string;
  };
} | { error: string };

export async function executeCode(language: string, version: string, code: string, quest: Quest | null): Promise<ExecutionResult> {
  try {
    let codeToRun = code;
    // If there's an active quest, append the test cases to the user's code
    if (quest && quest.test_cases.length > 0) {
      const testRunnerCode = quest.test_cases.join('\n');
      codeToRun = `${code}\n\n${testRunnerCode}`;
    }

    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: language,
      version: version,
      files: [{ content: codeToRun }],
    });

    return response.data;
  } catch (error) {
    console.error("Piston API execution failed:", error);
    if (axios.isAxiosError(error) && error.response) {
      return { error: `Execution failed: ${error.response.data?.message || error.message}` };
    }
    return { error: 'An unknown error occurred during code execution.' };
  }
}

import { backupQuests } from '@/lib/backup_quests';

export async function createQuests(input: GenerateCodingQuestsInput): Promise<{ success: boolean, quests?: Quest[], error?: string }> {
  try {
    const result = await generateCodingQuests(input);
    return { success: true, quests: result.quests };
  } catch (error) {
    console.error("Failed to generate quests, employing scribes' backups:", error);

    // Fallback Logic
    const requestedDiff = input.difficulty || 'Apprentice';
    // Simple mapping for resilience
    let backupKey = 'Apprentice';
    if (requestedDiff.toLowerCase().includes('master')) backupKey = 'Master';
    if (requestedDiff.toLowerCase().includes('legendary')) backupKey = 'Legendary';

    const available = backupQuests[backupKey] || backupQuests['Apprentice'];

    // If we have backups, return them essentially pretending it succeeded
    if (available && available.length > 0) {
      return { success: true, quests: available };
    }

    return { success: false, error: 'The Quest Giver is currently resting. Please try again later.' };
  }
}
