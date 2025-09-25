'use server';

/**
 * @fileOverview A Genkit flow for classifying a Jira issue as a Bug or a Feature.
 *
 * - classifyIssue - A function that takes an issue description and classifies it.
 * - ClassifyIssueInput - The input type for the classifyIssue function.
 * - ClassifyIssueOutput - The return type for the classifyIssue function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ClassifyIssueInputSchema = z.object({
  issueDescription: z.string().describe('The description of the issue to classify.'),
});
export type ClassifyIssueInput = z.infer<typeof ClassifyIssueInputSchema>;

const ClassifyIssueOutputSchema = z.object({
  classification: z.enum(['Bug', 'Feature']).describe('The classification of the issue, either "Bug" or "Feature".'),
  justification: z.string().describe('A brief justification for the classification decision.'),
});
export type ClassifyIssueOutput = z.infer<typeof ClassifyIssueOutputSchema>;

export async function classifyIssue(
  input: ClassifyIssueInput
): Promise<ClassifyIssueOutput> {
  return classifyIssueFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyIssuePrompt',
  input: { schema: ClassifyIssueInputSchema },
  output: { schema: ClassifyIssueOutputSchema },
  prompt: `You are an expert software project manager. Your task is to classify a given issue description as either a 'Bug' or a 'Feature'.

- A 'Bug' is an error, flaw, or fault in an existing part of the software. It causes the system to produce an incorrect or unexpected result, or to behave in unintended ways. Look for keywords like "error", "doesn't work", "broken", "incorrect", "fails".
- A 'Feature' is a new piece of functionality or a request for an enhancement to existing functionality. It describes something new the software should do. Look for keywords like "add", "implement", "support", "new capability", "allow users to".

Analyze the following issue description and determine if it is a Bug or a Feature. Provide a brief justification for your choice.

Issue Description:
"{{{issueDescription}}}"
`,
});

const classifyIssueFlow = ai.defineFlow(
  {
    name: 'classifyIssueFlow',
    inputSchema: ClassifyIssueInputSchema,
    outputSchema: ClassifyIssueOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
