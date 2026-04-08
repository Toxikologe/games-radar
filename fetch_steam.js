const axios = require('axios');
const fs = require('fs');

const STEAM_API_KEY = process.env.STEAM_KEY;
const STEAM_ID = '76561198133148029'; 
const NEWS_API_KEY = process.env.NEWS_KEY;

async function updateData() {
    try {
        console.log("Hole Steam Daten...");
        const gamesResponse = await axios.get(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&include_appinfo=true&format=json`);
        const games = gamesResponse.data.response.games.map(g => g.name);

        const wishlistResponse = await axios.get(`https://store.steampowered.com/wishlist/profiles/${STEAM_ID}/wishlistdata/`);
        const wishlist = Object.values(wishlistResponse.data).map(item => item.name);

        const allGames = [...new Set([...games, ...wishlist])];

        console.log("Hole News Daten...");
        const topGames = allGames.slice(0, 3).map(game => `"${game}"`).join(' OR ');
        const searchQuery = topGames ? encodeURIComponent(`(${topGames})`) : 'gaming';
        const newsUrl = `https://newsapi.org/v2/everything?q=${searchQuery}&language=de&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;

        let newsArticles = [];
        try {
            const newsResponse = await axios.get(newsUrl);
            newsArticles = newsResponse.data.articles.slice(0, 10);
        } catch (newsError) {
            console.error("Fehler bei NewsAPI:", newsError.response ? newsError.response.data : newsError.message);
        }

        // Alles zusammen in ein Datenpaket packen
        const dashboardData = {
            spiele: allGames,
            news: newsArticles,
            letztesUpdate: new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })
        };

        fs.writeFileSync('dashboard_data.json', JSON.stringify(dashboardData, null, 2));
        console.log('Daten erfolgreich gespeichert!');

    } catch (error) {
        console.error('Allgemeiner Fehler:', error.message);
        process.exit(1);
    }
}

updateData();
