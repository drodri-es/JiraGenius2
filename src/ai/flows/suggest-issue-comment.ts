'use server';

/**
 * @fileOverview A Genkit flow for suggesting a relevant comment based on the issue description.
 *
 * - suggestIssueComment - A function that suggests a relevant comment based on the issue description.
 * - SuggestIssueCommentInput - The input type for the suggestIssueComment function.
 * - SuggestIssueCommentOutput - The return type for the suggestIssueComment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestIssueCommentInputSchema = z.object({
  issueDescription: z
    .string()
    .describe('The description of the issue for which to suggest a comment.'),
});
export type SuggestIssueCommentInput = z.infer<typeof SuggestIssueCommentInputSchema>;

const SuggestIssueCommentOutputSchema = z.object({
  suggestedComment: z
    .string()
    .describe('A suggested comment based on the issue description.'),
});
export type SuggestIssueCommentOutput = z.infer<typeof SuggestIssueCommentOutputSchema>;

export async function suggestIssueComment(
  input: SuggestIssueCommentInput
): Promise<SuggestIssueCommentOutput> {
  return suggestIssueCommentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestIssueCommentPrompt',
  input: {schema: SuggestIssueCommentInputSchema},
  output: {schema: SuggestIssueCommentOutputSchema},
  prompt: `You are an AI assistant designed to help users respond to issues in Jira.  Based on the issue description below, generate a single comment that would be helpful to add to the issue.

Issue Description: {{{issueDescription}}}

Suggested Comment:`,
});

const suggestIssueCommentFlow = ai.defineFlow(
  {
    name: 'suggestIssueCommentFlow',
    inputSchema: SuggestIssueCommentInputSchema,
    outputSchema: SuggestIssueCommentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
