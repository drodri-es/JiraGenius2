'use server';

/**
 * @fileOverview A Genkit flow for classifying a Jira issue and identifying potential root causes.
 *
 * - classifyAndRelateIssue - A function that classifies an issue and relates it to past tasks if it's a bug.
 * - ClassifyAndRelateIssueInput - The input type for the function.
 * - ClassifyAndRelateIssueOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IssueContextSchema = z.object({
    key: z.string(),
    summary: z.string(),
    description: z.string(),
    type: z.string(),
});

const ClassifyAndRelateIssueInputSchema = z.object({
  targetIssue: IssueContextSchema.describe('The issue to classify and analyze.'),
  allIssues: z.array(IssueContextSchema).describe('A list of all other issues in the project for context.'),
});
export type ClassifyAndRelateIssueInput = z.infer<typeof ClassifyAndRelateIssueInputSchema>;

const ClassifyAndRelateIssueOutputSchema = z.object({
  classification: z.enum(['Bug', 'Feature']).describe('The classification of the issue, either "Bug" or "Feature".'),
  justification: z.string().describe('A brief justification for the classification decision.'),
  relatedTaskKey: z.string().optional().describe('If the issue is a bug, the key of a previously implemented task or story that is likely the root cause.'),
  relationJustification: z.string().optional().describe('A brief justification for why the bug is related to the suggested task.'),
});
export type ClassifyAndRelateIssueOutput = z.infer<typeof ClassifyAndRelateIssueOutputSchema>;

export async function classifyAndRelateIssue(
  input: ClassifyAndRelateIssueInput
): Promise<ClassifyAndRelateIssueOutput> {
  return classifyAndRelateIssueFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyAndRelateIssuePrompt',
  input: { schema: ClassifyAndRelateIssueInputSchema },
  output: { schema: ClassifyAndRelateIssueOutputSchema },
  prompt: `You are an expert software project manager and root cause analysis specialist. Your tasks are to:
1. Classify an issue as a 'Bug' or a 'Feature'.
2. If it's a 'Bug', identify a related, previously implemented task or story that might be its root cause.

- A 'Bug' is an error, flaw, or fault. Keywords: "error", "doesn't work", "broken", "incorrect".
- A 'Feature' is new functionality or an enhancement. Keywords: "add", "implement", "support", "new".

Current issue to analyze:
- Key: {{{targetIssue.key}}}
- Type: {{{targetIssue.type}}}
- Summary: {{{targetIssue.summary}}}
- Description: {{{targetIssue.description}}}

First, classify the issue and provide a justification.

Then, if and only if the classification is 'Bug', analyze the list of all other project issues provided below. Find the most likely related "Task" or "Story" that was previously implemented and could have caused this bug. The cause is often a recent change. If you find a likely candidate, provide its issue key and a justification for the connection. If no clear connection can be made, do not suggest a related task.

List of all project issues for context:
{{#each allIssues}}
- Key: {{{key}}}, Type: {{{type}}}, Summary: {{{summary}}}
{{/each}}
`,
});

const classifyAndRelateIssueFlow = ai.defineFlow(
  {
    name: 'classifyAndRelateIssueFlow',
    inputSchema: ClassifyAndRelateIssueInputSchema,
    outputSchema: ClassifyAndRelateIssueOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
