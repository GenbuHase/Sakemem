import type {
  SakenowaBrand,
  SakenowaBrewery,
  SakeSuggestion,
} from "@/lib/sakenowa/types";

const SAKENOWA_API_BASE = "https://muro.sakenowa.com/sakenowa-data/api";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type SakenowaCache = {
  brands: SakenowaBrand[];
  breweries: SakenowaBrewery[];
  breweryNameById: Map<number, string>;
  fetchedAt: number;
};

let cache: SakenowaCache | null = null;

async function fetchSakenowaData(): Promise<SakenowaCache> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache;
  }

  const [brandsResponse, breweriesResponse] = await Promise.all([
    fetch(`${SAKENOWA_API_BASE}/brands`, {
      next: { revalidate: 86400 },
    }),
    fetch(`${SAKENOWA_API_BASE}/breweries`, {
      next: { revalidate: 86400 },
    }),
  ]);

  if (!brandsResponse.ok || !breweriesResponse.ok) {
    throw new Error("さけのわAPIからのデータ取得に失敗しました。");
  }

  const brandsPayload = (await brandsResponse.json()) as {
    brands: SakenowaBrand[];
  };
  const breweriesPayload = (await breweriesResponse.json()) as {
    breweries: SakenowaBrewery[];
  };

  const breweryNameById = new Map(
    breweriesPayload.breweries.map((brewery) => [brewery.id, brewery.name]),
  );

  cache = {
    brands: brandsPayload.brands,
    breweries: breweriesPayload.breweries,
    breweryNameById,
    fetchedAt: Date.now(),
  };

  return cache;
}

export async function searchSakeBrands(
  query: string,
  limit = 10,
): Promise<SakeSuggestion[]> {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  const { brands, breweryNameById } = await fetchSakenowaData();

  const matches: SakeSuggestion[] = [];

  for (const brand of brands) {
    const breweryName = breweryNameById.get(brand.breweryId) ?? "";
    const matchesBrand = brand.name.toLowerCase().includes(normalizedQuery);
    const matchesBrewery = breweryName.toLowerCase().includes(normalizedQuery);

    if (!matchesBrand && !matchesBrewery) {
      continue;
    }

    matches.push({
      brandId: brand.id,
      brandName: brand.name,
      breweryName,
    });

    if (matches.length >= limit) {
      break;
    }
  }

  return matches;
}
