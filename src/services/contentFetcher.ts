// Fetches spoken content (~40 seconds) from free, no-auth APIs
// Falls back to built-in messages on network failure

interface Poem {
  title: string;
  author: string;
  lines: string[];
  linecount: number;
}

async function fetchPoem(): Promise<string | null> {
  try {
    // Fetch 5 random poems, pick first with 10-18 lines (~40s spoken)
    const res = await fetch('https://poetrydb.org/random/5', { signal: AbortSignal.timeout(5000) });
    const poems: Poem[] = await res.json();
    const suitable = poems.find(p => p.linecount >= 10 && p.linecount <= 18);
    if (!suitable) return null;
    const text = suitable.lines.filter(l => l.trim()).join('. ');
    return `Here is a poem. ${suitable.title}, by ${suitable.author}. ${text}`;
  } catch {
    return null;
  }
}

async function fetchFact(): Promise<string | null> {
  try {
    // Chain 3 facts to reach ~40 seconds of speech
    const fetches = Array.from({ length: 3 }, () =>
      fetch('https://uselessfacts.jsph.pl/api/v2/facts/random', { signal: AbortSignal.timeout(5000) })
        .then(r => r.json())
        .then((d: { text: string }) => d.text)
        .catch(() => null)
    );
    const facts = (await Promise.all(fetches)).filter(Boolean) as string[];
    if (facts.length === 0) return null;
    return `Here are some fun facts for your run. ${facts.join(' ... ')}`;
  } catch {
    return null;
  }
}

export async function fetchContentPool(count: number): Promise<(string | null)[]> {
  // Alternate poems and facts
  return Promise.all(
    Array.from({ length: count }, (_, i) =>
      i % 2 === 0 ? fetchPoem() : fetchFact()
    )
  );
}
