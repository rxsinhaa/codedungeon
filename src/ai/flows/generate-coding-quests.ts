'use server';

/**
 * @fileOverview Generates coding quests with D&D-flavored descriptions and starter code using an AI model via OpenRouter.
 *
 * @interface GenerateCodingQuestsInput - The input schema for generating coding quests.
 * @interface GenerateCodingQuestsOutput - The output schema for the generated coding quests.
 * @function generateCodingQuests - The main function to generate coding quests.
 */

import { z } from 'genkit';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const GenerateCodingQuestsInputSchema = z.object({
  count: z.number().describe('The number of quests to generate.'),
  difficulty: z.string().optional().describe('The difficulty of the quests (e.g., Apprentice, Journeyman, Master, Legendary).'),
});

export type GenerateCodingQuestsInput = z.infer<typeof GenerateCodingQuestsInputSchema>;

const SingleQuestSchema = z.object({
  title: z.string().describe('The title of the coding quest.'),
  difficulty: z
    .string()
    .describe('The difficulty level of the quest (e.g., Apprentice, Journeyman, Master, Legendary).'),
  mission_briefing: z
    .preprocess((val) => {
      // In case the AI uses a different key or puts it elsewhere, we can try to recover.
      // But z.preprocess receives the value of the field *if it exists*, or undefined.
      // So this won't help if the key is missing entirely at the parent level.
      // However, we can use z.object().transform() or z.preprocess() on the PARENT object.
      // But for now, let's just assume if it's there it's a string, if not we catch it with 'required'.
      // Actually, let's leave this simple string for now and rely on the PROMPT fix,
      // but if we wanted to handle aliases we'd need to do it at the Quest object level or with a loose schema.
      return val;
    }, z.string())
    .describe('A detailed D&D-flavored description of the coding task.'),
  starter_code: z.string().describe('The starter code for the coding quest.'),
  test_cases: z
    .preprocess((val) => {
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : [val];
        } catch {
          return [val];
        }
      }
      return val;
    }, z.array(z.string()))
    .describe(
      "An array of test cases for the coding quest. These should be code snippets that assert the correctness of the user's solution."
    ),
  gold_reward: z.number().describe('The gold reward for completing the quest.'),
  xp_reward: z.number().describe('The XP reward for completing the quest.'),
  language_alias: z.enum(['cpp']).describe('The programming language for the quest.'),
});

const GenerateCodingQuestsOutputSchema = z.object({
  quests: z.array(SingleQuestSchema)
});

export type GenerateCodingQuestsOutput = z.infer<typeof GenerateCodingQuestsOutputSchema>;
export type Quest = z.infer<typeof SingleQuestSchema>;


export async function generateCodingQuests(input: GenerateCodingQuestsInput): Promise<
  GenerateCodingQuestsOutput
> {
  const difficultyInstruction = input.difficulty ? `The difficulty for these quests should be: ${input.difficulty}.` : 'Make the quests varied in difficulty.';

  const prompt = `You are a quest generator for a coding adventure game. Generate a list of ${input.count} C++ coding quests.

${difficultyInstruction} The topics should be classic computer science problems, but with a fun, D&D-fantasy theme.

- 'title': A descriptive, fantasy-themed title.
- 'difficulty': (Apprentice, Journeyman, Master, Legendary).
- 'mission_briefing': A detailed D&D-flavored mission briefing that explains the coding task. The briefing should be complete and not end with '...'.
- 'starter_code': Starter code to help the player get started. This should be a function signature or a basic structure.
- 'test_cases': An array of test cases for the player to validate their solution. These should be written in C++ and use '#include <cassert>'.
- 'gold_reward': A gold reward for completing the quest (between 50 and 500).
- 'xp_reward': An XP reward for completing the quest (between 100 and 1000).
- 'language_alias': The language alias for the quest, which must be 'cpp'.

IMPORTANT: Return ONLY valid JSON. Do not use markdown formatting. The response should be a minified JSON object with the key "quests".`;

  // Define the JSON Schema manually to ensure it meets OpenRouter/OpenAI strictness requirements
  const questListSchema = {
    name: 'quest_list',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        quests: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'A descriptive, fantasy-themed title.' },
              difficulty: { type: 'string', enum: ['Apprentice', 'Journeyman', 'Master', 'Legendary'], description: 'The difficulty level of the quest.' },
              mission_briefing: { type: 'string', description: 'A detailed D&D-flavored mission briefing.' },
              starter_code: { type: 'string', description: 'Starter code function signature.' },
              test_cases: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of C++ test cases using assert.'
              },
              gold_reward: { type: 'number', description: 'Gold reward amount.' },
              xp_reward: { type: 'number', description: 'XP reward amount.' },
              language_alias: { type: 'string', enum: ['cpp'], description: 'Must be "cpp".' }
            },
            required: ['title', 'difficulty', 'mission_briefing', 'starter_code', 'test_cases', 'gold_reward', 'xp_reward', 'language_alias'],
            additionalProperties: false
          }
        }
      },
      required: ['quests'],
      additionalProperties: false
    }
  };

  const response = await openai.chat.completions.create({
    model: 'xiaomi/mimo-v2-flash:free', // Switching to a model known to support structured outputs well, or keep user's if preferred. The user's example used `google/gemini-2.5-flash`. I'll try to stick to a good one.
    // actually, let's stick to the current one or a better one if needed. The user complained about failure.
    // Let's use google/gemini-2.0-flash-exp:free as it's generally very capable with structured outputs on OpenRouter.
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 10240,
    response_format: {
      type: 'json_schema',
      json_schema: questListSchema
    },
    temperature: 0.7,
    // @ts-ignore - OpenRouter specific extensions
    plugins: [
      { id: 'response-healing' } // As requested by user
    ]
  });

  let content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No content in AI response');
  }

  // With strict JSON schema, we shouldn't need markdown stripping, but it doesn't hurt to be safe against some models
  content = content.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();

  let parsedJson;
  try {
    parsedJson = JSON.parse(content);
  } catch (error) {
    console.error("JSON Parsing failed. Raw content:", content);
    // Basic repair attempt: Find first '{' and last '}'
    const startIndex = content.indexOf('{');
    const endIndex = content.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      try {
        const repaired = content.substring(startIndex, endIndex + 1);
        parsedJson = JSON.parse(repaired);
      } catch (e) {
        throw new Error("Failed to parse AI response as JSON: " + (error instanceof Error ? error.message : String(error)));
      }
    } else {
      throw new Error("Failed to parse AI response as JSON: " + (error instanceof Error ? error.message : String(error)));
    }
  }

  // Validate with Zod
  const validationResult = GenerateCodingQuestsOutputSchema.safeParse(parsedJson);

  if (!validationResult.success) {
    console.error("Zod validation failed:", JSON.stringify(validationResult.error, null, 2));
    console.error("Raw AI Response:", JSON.stringify(parsedJson, null, 2));
    throw new Error("AI response does not match the required schema.");
  }

  // Ensure all quests have the correct language alias
  const validatedQuests = validationResult.data.quests.map(quest => ({
    ...quest,
    language_alias: 'cpp' as const,
  }));


  return { quests: validatedQuests };
}
