import { NextResponse } from 'next/server';
import type { JiraIssue, JiraSprint, SprintReport } from '@/lib/types';

// This function recursively fetches all pages of sprints or issues
async function fetchAllPages(url: string, authHeader: string) {
    let items: any[] = [];
    let isLast = false;
    let startAt = 0;

    while (!isLast) {
        const pagedUrl = new URL(url);
        pagedUrl.searchParams.set('startAt', startAt.toString());

        const response = await fetch(pagedUrl.toString(), {
            method: 'GET',
            headers: { 'Authorization': authHeader, 'Accept': 'application/json' },
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Jira API request failed with status ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        items = items.concat(data.values || (Array.isArray(data.issues) ? data.issues : []));
        isLast = data.isLast === true || (data.total !== undefined && items.length >= data.total);
        startAt += (data.maxResults || 50);
    }
    return items;
}


export async function POST(
    request: Request,
    { params }: { params: { boardId: string } }
) {
  try {
    const { url, email, token } = await request.json();
    const projectId = params.boardId; // In this context, we get the projectId and find its board

    if (!url || !email || !token) {
      return NextResponse.json({ message: 'Missing Jira credentials' }, { status: 400 });
    }
    if (!projectId) {
        return NextResponse.json({ message: 'Missing project ID' }, { status: 400 });
    }

    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    const authHeader = `Basic ${auth}`;

    // 1. Find the board ID from the project ID
    const boardsResponse = await fetch(`${url}/rest/agile/1.0/board?projectKeyOrId=${projectId}`, {
        headers: { 'Authorization': authHeader, 'Accept': 'application/json' },
    });
    if (!boardsResponse.ok) throw new Error('Failed to find Jira board for project');
    const boardsData = await boardsResponse.json();
    const board = boardsData.values[0];
    if (!board) return NextResponse.json([], { status: 200 }); // No board, so no sprints. Return empty.

    // 2. Fetch all closed sprints for that board
    const sprintsUrl = `${url}/rest/agile/1.0/board/${board.id}/sprint?state=closed`;
    const sprints: JiraSprint[] = await fetchAllPages(sprintsUrl, authHeader);

    const sprintReports: SprintReport[] = [];

    // 3. For each sprint, fetch the completed issues and calculate story points
    for (const sprint of sprints) {
        // We only care about sprints that have actually been completed
        if (!sprint.completeDate) continue;

        const jql = `sprint = ${sprint.id} AND status = Done`;
        const fields = 'summary,customfield_10026'; // customfield_10026 is often Story Points
        const searchUrl = `${url}/rest/api/3/search?jql=${encodeURIComponent(jql)}&fields=${fields}`;
        
        const issues: JiraIssue[] = await fetchAllPages(searchUrl, authHeader);

        if (issues.length > 0) {
            const totalStoryPoints = issues.reduce((acc, issue) => {
                const storyPoints = issue.fields.customfield_10026 || 0;
                return acc + storyPoints;
            }, 0);
            
            // Only include sprints where work was actually done
            if (totalStoryPoints > 0 || issues.length > 0) {
                sprintReports.push({
                    sprintName: sprint.name,
                    completedIssues: issues.length,
                    totalStoryPoints: totalStoryPoints,
                });
            }
        }
    }
    
    // Return the reports, sorted oldest to newest
    return NextResponse.json(sprintReports.reverse());

  } catch (error) {
    console.error(`Failed to fetch Jira sprint data`, error);
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
  }
}
