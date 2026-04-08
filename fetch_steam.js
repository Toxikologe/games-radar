const axios = require('axios');
const fs = require('fs');

// --- HIER DEINE DATEN EINTRAGEN ---
const STEAM_API_KEY = 'ED99823B13B0E679C02C103BBCD7B7BB'; // Erhältst du hier: https://steamcommunity.com/dev/apikey
const STEAM_ID = '76561198133148029'; // Deine Steam-ID
// ----------------------------------

async function getSteamData() {
    try {
        // 1. Spiele in der Bibliothek abrufen
        const gamesResponse = await axios.get(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&include_appinfo=true&format=json`);
        const games = gamesResponse.data.response.games.map(g => g.name);

        // 2. Wunschliste abrufen (öffentlich zugänglicher Endpunkt)
        const wishlistResponse = await axios.get(`https://store.steampowered.com/wishlist/profiles/${STEAM_ID}/wishlistdata/`);
        const wishlist = Object.values(wishlistResponse.data).map(item => item.name);

        // Daten zusammenführen und Duplikate entfernen
        const allGames = [...new Set([...games, ...wishlist])];
        
        // Als Textdatei speichern
        fs.writeFileSync('meine_spiele.txt', allGames.join('\n'));
        console.log('Spieleliste erfolgreich aktualisiert!');

    } catch (error) {
        console.error('Fehler beim Abruf der Steam-Daten:', error.message);
        process.exit(1);
    }
}

getSteamData();
