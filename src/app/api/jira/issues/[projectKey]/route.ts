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
    
    // Use JQL to search for issues in the specified project
    const jql = `project = "${projectKey}" ORDER BY updated DESC`;
    const searchParams = new URLSearchParams({
        jql,
        fields: 'summary,status,issuetype,priority,assignee,updated,created',
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
    return NextResponse.json(data.issues);
  } catch (error) {
    console.error(`Failed to fetch Jira issues for project ${params.projectKey}`, error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Failed to fetch Jira issues', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
  }
}
