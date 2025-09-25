'use server';

/**
 * @fileOverview A Genkit flow for suggesting relevant tags for a Jira issue.
 *
 * - suggestIssueTags - A function that suggests tags based on the issue content.
 * - SuggestIssueTagsInput - The input type for the suggestIssueTags function.
 * - SuggestIssueTagsOutput - The return type for the suggestIssueTags function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestIssueTagsInputSchema = z.object({
  issueContent: z.string().describe('The summary and description of the issue to tag.'),
});
export type SuggestIssueTagsInput = z.infer<typeof SuggestIssueTagsInputSchema>;

const SuggestIssueTagsOutputSchema = z.object({
  suggestedTags: z.array(z.string()).describe('An array of suggested tags (labels) for the issue.'),
});
export type SuggestIssueTagsOutput = z.infer<typeof SuggestIssueTagsOutputSchema>;

export async function suggestIssueTags(
  input: SuggestIssueTagsInput
): Promise<SuggestIssueTagsOutput> {
  return suggestIssueTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestIssueTagsPrompt',
  input: { schema: SuggestIssueTagsInputSchema },
  output: { schema: SuggestIssueTagsOutputSchema },
  prompt: `You are an expert software engineer and project manager. Your task is to suggest relevant technical and functional tags for a Jira issue.

Analyze the following issue content (summary and description). Suggest a list of 1 to 5 single-word, lowercase tags that accurately categorize the issue.

Good examples of tags: 'frontend', 'backend', 'api', 'database', 'ui', 'ux', 'bug', 'performance', 'security', 'refactor', 'mobile', 'web'.
Bad examples: 'login-button', 'very-important', 'needs-discussion'. Tags should be general categories, not specific components or statuses.

Issue Content:
"{{{issueContent}}}"
`,
});

const suggestIssueTagsFlow = ai.defineFlow(
  {
    name: 'suggestIssueTagsFlow',
    inputSchema: SuggestIssueTagsInputSchema,
    outputSchema: SuggestIssueTagsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    // Sanitize tags: ensure they are single-word and lowercase
    const sanitizedTags = output!.suggestedTags
      .map(tag => tag.toLowerCase().split(/\s+/)[0])
      .filter(tag => tag.length > 0);
    return { suggestedTags: [...new Set(sanitizedTags)] }; // Return unique tags
  }
);
