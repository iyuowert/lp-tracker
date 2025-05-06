export async function handler(event, context) {
  const RIOT_API_KEY = "TU_WSTAW_SWÓJ_KLUCZ_API";
  const username = "2024MUSIC";
  const tag = "2024";
  const region = "europe";
  const platform = "euw1";

  try {
    const accUrl = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(username)}/${encodeURIComponent(tag)}?api_key=${RIOT_API_KEY}`;
    const accRes = await fetch(accUrl);
    const account = await accRes.json();
    if (!account.puuid) throw new Error("Nie znaleziono gracza.");

    const sumUrl = `https://${platform}.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${account.puuid}?api_key=${RIOT_API_KEY}`;
    const sumRes = await fetch(sumUrl);
    const summoner = await sumRes.json();
    if (!summoner.id) throw new Error("Nie znaleziono summoner ID.");

    const rankedUrl = `https://${platform}.api.riotgames.com/tft/league/v1/entries/by-summoner/${summoner.id}?api_key=${RIOT_API_KEY}`;
    const rankedRes = await fetch(rankedUrl);
    const rankedData = await rankedRes.json();
    const solo = rankedData.find(q => q.queueType === "RANKED_TFT");
    if (!solo) throw new Error("Brak danych ranked TFT.");

    const tier = solo.tier;
    const rank = solo.rank;
    const lp = solo.leaguePoints;

    const tierLpMap = {
      "IRON": 0, "BRONZE": 400, "SILVER": 800,
      "GOLD": 1200, "PLATINUM": 1600, "EMERALD": 2000,
      "DIAMOND": 2400, "MASTER": 2800, "GRANDMASTER": 3200, "CHALLENGER": 3600
    };
    const rankOffset = { "IV": 0, "III": 100, "II": 200, "I": 300 };

    const currentLp = (tierLpMap[tier] || 0) + (rankOffset[rank] || 0) + lp;
    const targetLp = 2000;

    const difference = Math.max(0, targetLp - currentLp);

    return {
      statusCode: 200,
      body: JSON.stringify({ tier, rank, lp, difference })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
