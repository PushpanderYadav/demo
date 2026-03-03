export async function handler() {
  const url =
    'https://author-p168597-e1803019.adobeaemcloud.com/graphql/execute.json/GMR/news-list';

  const response = await fetch(url);
  const result = await response.json();

  const items =
    result?.data?.newsList_2?.items?.map((item) => ({
      title: item.title,
      category: item.category,
      description: item.description?.plaintext
    })) || [];

  return new Response(JSON.stringify({ items }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=300'
    }
  });
}
