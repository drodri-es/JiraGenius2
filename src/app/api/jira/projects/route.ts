
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url, email, token } = await request.json();

    if (!url || !email || !token) {
      return NextResponse.json({ message: 'Missing Jira credentials' }, { status: 400 });
    }

    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    const response = await fetch(`${url}/rest/api/3/project/search`, {
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
    return NextResponse.json(data.values);
  } catch (error) {
    console.error('Failed to fetch Jira projects', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Failed to fetch Jira projects', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
  }
}
