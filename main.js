/* 
   SYNTAX SQUAD - CYBER TOOLS (UPDATED)
*/

// --- CONFIGURATION ---
const officialSites = {
    'facebook': 'facebook.com', 'instagram': 'instagram.com',
    'google': 'google.com', 'gmail': 'google.com',
    'sbi': 'onlinesbi.sbi', 'amazon': 'amazon.in',
    'flipkart': 'flipkart.com', 'netflix': 'netflix.com',
    'paytm': 'paytm.com', 'whatsapp': 'whatsapp.com',
    'twitter': 'twitter.com', 'x': 'x.com', 'github':'github.com',
    'hdfc': 'hdfcbank.com', 'icici': 'icicibank.com'
};

const commonSafeDomains = Object.values(officialSites);

// --- 1. SMART PHISHING DETECTOR (Same as before) ---
function analyzeLink() {
    const input = document.getElementById('urlInput').value.toLowerCase().trim();
    const resultPanel = document.getElementById('urlResult');
    const header = document.getElementById('resultHeader');
    const desc = document.getElementById('resultDesc');
    const detected = document.getElementById('detectedUrl');

    if (!input) return alert("Please paste a link first!");

    const urlRegex = /https?:\/\/[^\s]+|www\.[^\s]+/g;
    const match = input.match(urlRegex);

    if (!match) {
        alert("No valid URL found.");
        return;
    }

    const rawUrl = match[0];
    detected.innerText = rawUrl;
    resultPanel.classList.remove('hidden');
    resultPanel.className = 'result-panel'; 
    
    try {
        let domain;
        if(rawUrl.startsWith('http')) {
            domain = new URL(rawUrl).hostname;
        } else {
            domain = new URL('http://' + rawUrl).hostname;
        }

        if (rawUrl.startsWith('http://')) {
            setResult('danger', '⚠️ UNSAFE PROTOCOL', 'This site uses HTTP (Not Encrypted). Data can be intercepted.');
            return;
        }

        const isSafe = commonSafeDomains.some(safe => domain.endsWith(safe));
        if (isSafe) {
            setResult('safe', '✅ VERIFIED LEGITIMATE', 'This is a verified official domain.');
            return;
        }

        const cleanDomain = domain.replace(/[\.\-]/g, ''); 
        let phishingDetected = false;
        let targetedBrand = '';

        for (let [brand, official] of Object.entries(officialSites)) {
            if (cleanDomain.includes(brand) && !domain.endsWith(official)) {
                phishingDetected = true;
                targetedBrand = brand.toUpperCase();
                break;
            }
        }

        if (phishingDetected) {
            setResult('danger', `🚫 PHISHING (${targetedBrand})`, 
                `This link mimics ${targetedBrand} but the domain '${domain}' is fake.`);
        } else {
            setResult('danger', '⚠️ SUSPICIOUS', 'Domain not in safety database. Proceed with caution.');
        }

    } catch (e) {
        setResult('danger', '❌ INVALID URL', 'The link structure is malformed.');
    }
}

function setResult(type, title, text) {
    const panel = document.getElementById('urlResult');
    const header = document.getElementById('resultHeader');
    const desc = document.getElementById('resultDesc');
    panel.className = `result-panel ${type}`;
    header.innerHTML = title;
    desc.innerText = text;
}

// --- 2. PASSWORD ANALYTICS (UPDATED) ---

function checkStrength() {
    const pass = document.getElementById('passInput').value;
    const bar = document.getElementById('strengthBar');
    const text = document.getElementById('strengthText');
    const crack = document.getElementById('crackTime');
    const feedbackList = document.getElementById('passFeedback');

    let score = 0;
    let issues = [];

    // 1. Basic Checks
    if (pass.length < 8) issues.push("Too short (Minimum 8 chars)");
    else score += 20;

    if (!/[A-Z]/.test(pass)) issues.push("Add an Uppercase letter (A-Z)");
    else score += 20;

    if (!/[0-9]/.test(pass)) issues.push("Add a Number (0-9)");
    else score += 20;

    if (!/[^A-Za-z0-9]/.test(pass)) issues.push("Add a Symbol (!@#$)");
    else score += 20;

    // 2. Common Patterns Check
    const commonPatterns = ['password', '1234', 'admin', 'qwerty', 'user'];
    const lowerPass = pass.toLowerCase();
    if (commonPatterns.some(pat => lowerPass.includes(pat))) {
        score -= 30; // Big penalty
        issues.push("Contains common dictionary word (Avoid 'password', '123')");
    }

    if (pass.length > 12) score += 20;

    // Clamp score
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    // 3. Update UI
    // Bar Color
    let color = '#ff2a2a'; // Red
    let label = 'Weak';
    let time = 'Seconds';

    if (score > 40) { color = '#ffae00'; label = 'Medium'; time = '3 Days'; }
    if (score > 60) { color = '#eaff00'; label = 'Good'; time = '5 Months'; }
    if (score > 80) { color = '#00ff88'; label = 'Strong'; time = 'Centuries'; }

    bar.style.width = `${score}%`;
    bar.style.backgroundColor = color;
    text.innerText = `Strength: ${label}`;
    crack.innerText = `Crack Time: ${pass.length ? time : '--'}`;

    // 4. Show Feedback
    feedbackList.innerHTML = "";
    if (issues.length > 0 && pass.length > 0) {
        feedbackList.classList.add('active');
        issues.forEach(issue => {
            const li = document.createElement('li');
            li.innerText = issue;
            feedbackList.appendChild(li);
        });
    } else {
        feedbackList.classList.remove('active');
    }
}

function hardenPassword() {
    const pass = document.getElementById('passInput').value;
    if (!pass) return;
    const map = { a: '@', e: '3', i: '1', o: '0', s: '$', l: '!' };
    let newPass = pass.toLowerCase().split('').map(c => map[c] || c).join('');
    newPass = 'Sec#' + newPass + '99';
    newPass = newPass.charAt(0).toUpperCase() + newPass.slice(1);
    document.getElementById('hardenedDisplay').classList.remove('hidden');
    document.getElementById('newPass').innerText = newPass;
}

// --- 3. PERMISSIONS (Same as before) ---
document.addEventListener('DOMContentLoaded', async () => {
    updatePermStatus('camera', 'camStatus');
    updatePermStatus('microphone', 'micStatus');
    loadFootprint();
});

async function updatePermStatus(name, id) {
    try {
        const result = await navigator.permissions.query({ name: name });
        const el = document.getElementById(id);
        el.innerText = result.state.toUpperCase();
        el.style.color = result.state === 'granted' ? '#00ff88' : '#b0b0c0';
        result.onchange = () => updatePermStatus(name, id);
    } catch (e) {}
}

async function testCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.getElementById('videoFeed');
        document.getElementById('camContainer').classList.remove('hidden');
        video.srcObject = stream;
        updatePermStatus('camera', 'camStatus');
    } catch (err) {
        alert("ACCESS DENIED: Camera blocked.");
    }
}

async function testMic() {
    try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        document.getElementById('micContainer').classList.remove('hidden');
        updatePermStatus('microphone', 'micStatus');
    } catch (err) {
        alert("ACCESS DENIED: Microphone blocked.");
    }
}

function stopMedia(type) {
    // Reload page to stop streams simply for demo purposes
    location.reload(); 
}

// --- 4. FOOTPRINT & LOCATION (SMART UPDATE) ---

async function loadFootprint() {
    // 1. Hardware & OS (Standard)
    document.getElementById('osVal').innerText = navigator.platform;
    document.getElementById('browserVal').innerText = navigator.vendor || "Chrome/Edge";
    
    // Battery Status
    try {
        const bat = await navigator.getBattery();
        document.getElementById('batteryVal').innerText = Math.round(bat.level * 100) + '%';
    } catch(e) {
        document.getElementById('batteryVal').innerText = "Protected";
    }

    // 2. DEVICE MODEL (The "Pro" Fix)
    // We try to use the modern 'User-Agent Client Hints' API
    const modelBox = document.getElementById('osVal'); // We'll append model here
    
    if (navigator.userAgentData) {
        try {
            // Ask browser for the specific "High Entropy" value (The Model)
            const uaData = await navigator.userAgentData.getHighEntropyValues(["model", "platformVersion"]);
            const model = uaData.model;
            
            if (model) {
                // If we get it, show it!
                modelBox.innerText += ` (${model})`; 
                modelBox.style.color = "#00f3ff"; // Highlight it in neon
            } else {
                modelBox.innerText += " (Model Hidden)";
            }
        } catch (e) {
            // Fallback for browsers that block this
            modelBox.innerText += " (Generic)";
        }
    } else {
        // Fallback for iOS/Firefox (They don't support this API yet)
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        if (isIOS) modelBox.innerText += " (Apple Device)";
    }

    // 3. IP & Approximate Location
    try {
        const req = await fetch('https://ipapi.co/json/');
        const data = await req.json();
        document.getElementById('ipAddress').innerText = data.ip;
        document.getElementById('location').innerText = `${data.city}, ${data.country_name}`;
        
        // Initial fallback lat/long from IP
        document.getElementById('latlong').innerText = `${data.latitude}, ${data.longitude} (IP Approx)`;
    } catch (e) {
        document.getElementById('ipAddress').innerText = "AdBlocker";
    }

    // 4. PRECISE GPS (High Accuracy)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(5);
                const lon = position.coords.longitude.toFixed(5);
                document.getElementById('latlong').innerText = `${lat}, ${lon} (GPS Verified)`;
                document.getElementById('latlong').style.color = '#00ff88'; 
            },
            (error) => {
                console.log("GPS Denied");
            }
        );
    }
}
