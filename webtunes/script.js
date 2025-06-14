// Redirect to Spotify login
const CLIENT_ID = 'bbc6b6defc62472a8b4752b6dc82573a';
const REDIRECT_URI = 'https://austin11.netlify.app/webtunes/'; // or your Netlify site

function redirectToSpotifyLogin() {
  const scopes = [
    'user-read-playback-state',
    'user-read-currently-playing',
    'user-read-private'
  ].join('%20');

  const authUrl = `https://accounts.spotify.com/authorize` +
    `?client_id=${CLIENT_ID}` +
    `&response_type=token` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +  // ✅ must encode
    `&scope=${scopes}`;

  window.location.href = authUrl;
}

document.getElementById('login-btn').addEventListener('click', redirectToSpotifyLogin);

// When redirected back with access token:
window.onload = () => {
  const hash = window.location.hash;
  if (hash) {
    const token = new URLSearchParams(hash.substring(1)).get('access_token');
    if (token) {
      localStorage.setItem('spotify_token', token);
      loadUserData(token);
    }
  }
};

function loadUserData(token) {
  fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: 'Bearer ' + token }
  })
    .then(res => res.json())
    .then(user => {
      document.getElementById('user').innerText = `Welcome, ${user.display_name}`;
    });
}
