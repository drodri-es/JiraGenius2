'use server';

/**
 * @fileOverview A Genkit flow for clustering similar Jira issues.
 *
 * - clusterIssues - A function that takes a list of issues and returns clusters of similar ones.
 * - ClusterIssuesInput - The input type for the clusterIssues function.
 * - ClusterIssuesOutput - The return type for the clusterIssues function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const IssueSchema = z.object({
  key: z.string().describe('The unique key of the issue (e.g., PROJ-123).'),
  summary: z.string().describe('The summary or title of the issue.'),
});

export const ClusterIssuesInputSchema = z.object({
  issues: z.array(IssueSchema).describe('The list of issues to cluster.'),
});
export type ClusterIssuesInput = z.infer<typeof ClusterIssuesInputSchema>;

const ClusterSchema = z.object({
  name: z.string().describe('A short, descriptive name for the cluster (e.g., "Login Authentication Errors").'),
  description: z.string().describe('A brief summary of what the issues in this cluster are about.'),
  issueKeys: z.array(z.string()).describe('An array of issue keys belonging to this cluster.'),
});

export const ClusterIssuesOutputSchema = z.object({
  clusters: z.array(ClusterSchema).describe('An array of issue clusters.'),
});
export type ClusterIssuesOutput = z.infer<typeof ClusterIssuesOutputSchema>;

export async function clusterIssues(
  input: ClusterIssuesInput
): Promise<ClusterIssuesOutput> {
  return clusterIssuesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'clusterIssuesPrompt',
  input: { schema: ClusterIssuesInputSchema },
  output: { schema: ClusterIssuesOutputSchema },
  prompt: `You are an expert project manager. Your task is to analyze a list of Jira issues and group them into clusters based on their semantic similarity.

Analyze the provided list of issues, paying close attention to their summaries. Identify groups of issues that relate to the same topic, feature, or bug.

For each cluster you identify:
1. Provide a short, descriptive name for the cluster.
2. Write a one-sentence summary that describes the common theme of the clustered issues.
3. List the keys of the issues that belong to that cluster.

Do not include issues that do not fit into any clear cluster.

Here are the issues:
{{#each issues}}
- Key: {{{key}}}, Summary: {{{summary}}}
{{/each}}
`,
});

const clusterIssuesFlow = ai.defineFlow(
  {
    name: 'clusterIssuesFlow',
    inputSchema: ClusterIssuesInputSchema,
    outputSchema: ClusterIssuesOutputSchema,
  },
  async (input) => {
    if (input.issues.length === 0) {
      return { clusters: [] };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
