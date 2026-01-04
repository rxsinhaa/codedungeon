import { genkit } from 'genkit';
import { config } from 'dotenv';

config();

// No plugins configured here anymore, as we are using OpenRouter via openai sdk directly.
export const ai = genkit();
