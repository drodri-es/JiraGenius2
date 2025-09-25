'use server';

/**
 * @fileOverview An intelligent issue routing AI agent.
 *
 * - intelligentIssueRouting - A function that suggests the most suitable team and person to assign an issue to.
 * - IntelligentIssueRoutingInput - The input type for the intelligentIssueRouting function.
 * - IntelligentIssueRoutingOutput - The return type for the intelligentIssueRouting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentIssueRoutingInputSchema = z.object({
  issueDescription: z.string().describe('The description of the issue.'),
});
export type IntelligentIssueRoutingInput = z.infer<
  typeof IntelligentIssueRoutingInputSchema
>;

const IntelligentIssueRoutingOutputSchema = z.object({
  suggestedTeam: z.string().describe('The suggested team to assign the issue to.'),
  suggestedPerson: z
    .string()
    .describe('The suggested person to assign the issue to.'),
  justification: z.string().describe('The justification for the suggestion.'),
});
export type IntelligentIssueRoutingOutput = z.infer<
  typeof IntelligentIssueRoutingOutputSchema
>;

export async function intelligentIssueRouting(
  input: IntelligentIssueRoutingInput
): Promise<IntelligentIssueRoutingOutput> {
  return intelligentIssueRoutingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentIssueRoutingPrompt',
  input: {schema: IntelligentIssueRoutingInputSchema},
  output: {schema: IntelligentIssueRoutingOutputSchema},
  prompt: `You are an AI assistant specialized in routing issues to the most appropriate team and person.

  Given the following issue description, suggest the most suitable team and person to resolve it.  Also provide a brief justification for your suggestion.

  Issue Description: {{{issueDescription}}}

  Consider factors such as the skills required, the team's current workload, and the individual's expertise.
  `,
});

const intelligentIssueRoutingFlow = ai.defineFlow(
  {
    name: 'intelligentIssueRoutingFlow',
    inputSchema: IntelligentIssueRoutingInputSchema,
    outputSchema: IntelligentIssueRoutingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
