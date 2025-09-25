import { NextResponse } from 'next/server';

export async function POST(
    request: Request,
    { params }: { params: { projectKey: string } }
) {
  try {
    const { url, email, token } = await request.json();
    const { projectKey } = params;

    if (!url || !email || !token) {
      return NextResponse.json({ message: 'Missing Jira credentials' }, { status: 400 });
    }
    if (!projectKey) {
        return NextResponse.json({ message: 'Missing project key' }, { status: 400 });
    }

    const auth = Buffer.from(`${email}:${token}`).toString('base64');

    // A single issue key can be passed instead of a project key.
    // We can use a different JQL query for that.
    const isSingleIssue = projectKey.includes('-');

    const jql = isSingleIssue 
        ? `id = "${projectKey}"` 
        : `project = "${projectKey}" ORDER BY updated DESC`;
    
    const fields = 'summary,status,issuetype,priority,assignee,updated,created,description';
    
    const searchParams = new URLSearchParams({
        jql,
        fields,
    });

    const response = await fetch(`${url}/rest/api/3/search?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Jira API Error:', errorData);
      return NextResponse.json({ message: `Jira API request failed: ${response.statusText}`, details: errorData }, { status: response.status });
    }

    const data = await response.json();
    
    if (isSingleIssue) {
        return NextResponse.json(data.issues[0]);
    }

    return NextResponse.json(data.issues);
  } catch (error) {
    console.error(`Failed to fetch Jira issues for project ${params.projectKey}`, error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Failed to fetch Jira issues', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
  }
}
