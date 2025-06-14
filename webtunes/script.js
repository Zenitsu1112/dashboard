const CLIENT_ID = 'bbc6b6defc62472a8b4752b6dc82573a';
const REDIRECT_URI = 'https://austin11.netlify.app/webtunes/';

const SCOPES = 'user-read-private user-read-playback-state user-read-currently-playing';

document.getElementById('login-btn').addEventListener('click', startLogin);

async function startLogin() {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  localStorage.setItem('code_verifier', codeVerifier);

  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(SCOPES)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code_challenge_method=S256&code_challenge=${codeChallenge}`;

  window.location = authUrl;
}

window.onload = async () => {
  const code = new URLSearchParams(window.location.search).get('code');
  if (code) {
    const codeVerifier = localStorage.getItem('code_verifier');
    const token = await exchangeToken(code, codeVerifier);
    localStorage.setItem('spotify_token', token.access_token);
    loadUserData(token.access_token);
  } else {
    const token = localStorage.getItem('spotify_token');
    if (token) {
      loadUserData(token);
    }
  }
};

async function exchangeToken(code, codeVerifier) {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier
  });

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  return await res.json();
}

function loadUserData(token) {
  fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: 'Bearer ' + token }
  })
    .then(res => res.json())
    .then(user => {
      document.getElementById('user-info').innerText = `🎧 Welcome, ${user.display_name}`;
    });
}

// --- Helper functions ---

function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

