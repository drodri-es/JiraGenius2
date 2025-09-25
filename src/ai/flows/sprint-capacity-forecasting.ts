'use server';

/**
 * @fileOverview A Genkit flow for forecasting sprint capacity.
 *
 * - sprintCapacityForecasting - A function that takes historical sprint data and forecasts the next sprint.
 * - SprintCapacityForecastingInput - The input type for the sprintCapacityForecasting function.
 * - SprintCapacityForecastingOutput - The return type for the sprintCapacityForecasting function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SprintReportSchema = z.object({
  sprintName: z.string().describe('The name of the sprint.'),
  completedIssues: z.number().describe('The number of issues completed in the sprint.'),
  totalStoryPoints: z.number().describe('The total story points of completed issues in the sprint.'),
});

const SprintCapacityForecastingInputSchema = z.object({
  sprintHistory: z.array(SprintReportSchema).describe('An array of historical sprint reports.'),
  sprintDurationDays: z.number().describe('The duration of the sprints in days.'),
});
export type SprintCapacityForecastingInput = z.infer<typeof SprintCapacityForecastingInputSchema>;

const SprintCapacityForecastingOutputSchema = z.object({
  predictedIssues: z.number().describe('The predicted number of issues that can be completed in the next sprint.'),
  predictedStoryPoints: z.number().describe('The predicted number of story points that can be completed in the next sprint.'),
  justification: z.string().describe('A brief justification for the prediction, considering trends, averages, and anomalies.'),
});
export type SprintCapacityForecastingOutput = z.infer<typeof SprintCapacityForecastingOutputSchema>;

export async function sprintCapacityForecasting(
  input: SprintCapacityForecastingInput
): Promise<SprintCapacityForecastingOutput> {
  return sprintCapacityForecastingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sprintCapacityForecastingPrompt',
  input: { schema: SprintCapacityForecastingInputSchema },
  output: { schema: SprintCapacityForecastingOutputSchema },
  prompt: `You are an expert Agile project manager. Your task is to analyze historical sprint data and forecast the capacity for the next sprint. The team's sprint duration is {{{sprintDurationDays}}} days.

Analyze the provided list of past sprints. Calculate the team's average velocity in terms of both the number of issues and story points. Look for trends (e.g., is velocity increasing or decreasing?) and any anomalies (e.g., a sprint with an unusually low or high number of completed issues).

Based on this analysis, predict the number of issues and story points the team can realistically complete in the next sprint. Provide a brief justification for your prediction, mentioning the average velocity and any trends you observed.

Historical Sprint Data:
{{#each sprintHistory}}
- Sprint: {{{sprintName}}}, Issues Completed: {{{completedIssues}}}, Story Points: {{{totalStoryPoints}}}
{{/each}}
`,
});

const sprintCapacityForecastingFlow = ai.defineFlow(
  {
    name: 'sprintCapacityForecastingFlow',
    inputSchema: SprintCapacityForecastingInputSchema,
    outputSchema: SprintCapacityForecastingOutputSchema,
  },
  async (input) => {
    if (input.sprintHistory.length < 2) {
        // Return a default prediction if there's not enough history
        return {
            predictedIssues: 5,
            predictedStoryPoints: 15,
            justification: "Not enough historical data for an accurate forecast. This is a baseline suggestion. The forecast will become more accurate as more sprints are completed."
        };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
