const API_URL = "https://api.99close.nl"; // tu wpiszesz adres backendu (Cloudflare Tunnel -> Raspberry Pi)
const $ = id => document.getElementById(id);
const el = { url: $("url"), chip: $("chip"), hint: $("hint"), note: $("note"), go: $("go"), status: $("status"), fill: $("fill"), bar: $("bar"), stage: $("stage"), pct: $("pct"), result: $("result"), avatar: $("avatar"), bubble: $("bubble"), rtitle: $("rtitle"), rmeta: $("rmeta") };

// Auth Gate Logic
if (localStorage.getItem("99close_beta_code") !== "2424") {
  window.location.replace("acces-code.html");
}

const i18n = {
  pl: {
    idle: "Obsługujemy YouTube, Spotify i SoundCloud.",
    notes: {
      mp3: "MP3 320 kbps: Świetna jakość, idealna na telefon i pendrive.",
      flac: "FLAC: Bezstratna kompresja audio. Ciesz się najwyższą studyjną jakością dźwięku!",
      wav: "WAV: Czysty, nieskompresowany plik audio. Dla prawdziwych audiofili."
    },
    say_focus: "Dawaj linka, nie ociągaj się~",
    hint_rec: (p) => "Rozpoznano link z " + p + ".",
    hint_unrec: "To nie wygląda na link z YouTube, Spotify ani SoundCloud.",
    say_idle: "Wklej link do convertera aby pobrać plik!",
    say_rec: (p) => "Ooo, " + p + "! Wybierz format~",
    say_unrec: "To nie wygląda na link z YouTube, Spotify ani SoundCloud :<",
    quotes: {
      mp3: "MP3 to klasyk! Szybko i małe~",
      flac: "Uuu, audiofil? Zgrywamy bezstratnie!",
      wav: "WAV? Potężny plik nadciąga~"
    },
    err_no_link: "Wklej najpierw link.",
    say_no_link: "Brakuje linku!",
    err_bad_link: "Ten link nie jest obsługiwany. Użyj linku z YouTube, Spotify lub SoundCloud.",
    say_bad_link: "Tego linku nie znam…",
    say_converting: "Konwertuję!",
    stages: [["Szukam utworu…"], ["Pobieram dźwięk…"], ["Konwertuję na "], ["Dopinam metadane…"]],
    say_done: "Gotowe! Smacznego uszkom~",
    stage_done: "Gotowe!",
    rtitle: (p) => "Twój utwór z " + p + " jest gotowy",
    rmeta: (f) => "Format: " + f,
    rtext: (c) => `pobieranie sie zaraz zacznie miłego słuchania ;3! (${c}s)`,
    toast_started: "Rozpoczęto pobieranie!",
    facts: [
      "Leci! Wiedziałeś, że koty przesypiają 70% swojego życia? Zazdroszczę...",
      "Ściągam! Wiesz, że najdłuższe anime ma ponad 7500 odcinków? Szok!",
      "Plik pędzi! Koty pocą się tylko przez poduszki na łapkach! Urocze, co nie?",
      "Leci! W Japonii jest wyspa Aoshima, gdzie żyje więcej kotów niż ludzi. Mój raj na ziemi~",
      "Rozpoczęto! Wiesz, że mruczenie kota podobno przyspiesza gojenie się kości? Magia~",
      "Gotowe! Czy wiesz, że kocie nosy są równie unikalne co ludzkie odciski palców?",
      "Ściągam! A tak przy okazji... pamiętaj, żeby dużo pić wody! Nyaa~"
    ],
    toast_dl: "Pobieranie w toku!",
    say_dl: "Twój plik zaraz się pobierze, daj mu chwilkę~",
    say_again: "Dawaj kolejny link! Czekam~"
  },
  en: {
    idle: "We support YouTube, Spotify, and SoundCloud.",
    notes: {
      mp3: "MP3 320 kbps: Great quality, perfect for phones and USB drives.",
      flac: "FLAC: Lossless audio compression. Enjoy the highest studio sound quality!",
      wav: "WAV: Pure, uncompressed audio file. For true audiophiles."
    },
    say_focus: "Gimme the link, don't slack off~",
    hint_rec: (p) => "Recognized a link from " + p + ".",
    hint_unrec: "This doesn't look like a YouTube, Spotify or SoundCloud link.",
    say_idle: "Paste a link into the converter to download!",
    say_rec: (p) => "Ooh, " + p + "! Choose your format~",
    say_unrec: "That doesn't look like a YouTube, Spotify or SoundCloud link :<",
    quotes: {
      mp3: "MP3 is a classic! Fast and small~",
      flac: "Ooh, audiophile? Ripping lossless!",
      wav: "WAV? A huge file is coming~"
    },
    err_no_link: "Paste a link first.",
    say_no_link: "Missing link!",
    err_bad_link: "This link isn't supported. Use a YouTube, Spotify or SoundCloud link.",
    say_bad_link: "I don't know this link...",
    say_converting: "Converting!",
    stages: [["Searching for track…"], ["Downloading audio…"], ["Converting to "], ["Applying metadata…"]],
    say_done: "Done! Bon appétit to your ears~",
    stage_done: "Done!",
    rtitle: (p) => "Your track from " + p + " is ready",
    rmeta: (f) => "Format: " + f,
    rtext: (c) => `download is starting soon, happy listening ;3! (${c}s)`,
    toast_started: "Download started!",
    facts: [
      "Incoming! Did you know cats sleep 70% of their lives? I'm jealous...",
      "Downloading! Did you know the longest anime has over 7500 episodes? Crazy!",
      "File is zooming! Cats only sweat through their paw pads! Cute, right?",
      "Incoming! Japan has an island called Aoshima with more cats than people. Paradise~",
      "Started! Did you know a cat's purr can supposedly accelerate bone healing? Magic~",
      "Done! Did you know cat noses are as unique as human fingerprints?",
      "Downloading! By the way... remember to drink lots of water! Nyaa~"
    ],
    toast_dl: "Downloading in progress!",
    say_dl: "Your file is downloading, give it a sec~",
    say_again: "Gimme another link! I'm waiting~"
  }
};

let lang = "pl";
function setLang(l) {
  lang = l;
  $("btn-pl").classList.toggle("active", l === "pl");
  $("btn-en").classList.toggle("active", l === "en");
  document.querySelectorAll("[data-i18n]").forEach(e => {
    const text = {
      pl: {
        subtitle: "YouTube, Spotify i SoundCloud do MP3, FLAC lub WAV. Bez reklam.",
        link_label: "Link do utworu",
        fmt_legend: "Format pliku",
        fmt_mp3: "mały plik",
        fmt_flac: "bez kompresji",
        fmt_wav: "surowy",
        btn_go: "Konwertuj!",
        btn_dl: "Pobierz plik",
        btn_again: "Konwertuj kolejny link"
      },
      en: {
        subtitle: "YouTube, Spotify and SoundCloud to MP3, FLAC or WAV. Ad-free.",
        link_label: "Track link",
        fmt_legend: "File format",
        fmt_mp3: "small file",
        fmt_flac: "lossless",
        fmt_wav: "raw",
        btn_go: "Convert!",
        btn_dl: "Download file",
        btn_again: "Convert another link"
      }
    }[l][e.dataset.i18n];
    if (text) e.textContent = text;
  });
  el.url.placeholder = l === "pl" ? "https://youtube.com/watch?v=…" : "https://youtube.com/watch?v=…";
  el.hint.textContent = i18n[lang].idle;
  refreshNote();
  say(currentSayFn);
}
$("btn-pl").addEventListener("click", () => setLang("pl"));
$("btn-en").addEventListener("click", () => setLang("en"));

el.hint.textContent = i18n[lang].idle;

const PLATFORMS = [
  { id: "youtube", name: "YouTube", re: /(^|\.)(youtube\.com|youtu\.be|music\.youtube\.com)$/i },
  { id: "spotify", name: "Spotify", re: /(^|\.)(open\.spotify\.com|spotify\.link)$/i },
  { id: "soundcloud", name: "SoundCloud", re: /(^|\.)(soundcloud\.com|on\.soundcloud\.com)$/i }
];
function detect(v) { try { const u = new URL(v.trim()); return PLATFORMS.find(p => p.re.test(u.hostname)) || null } catch (e) { return null } }
const fmt = () => document.querySelector('input[name=fmt]:checked').value;
function refreshNote() {
  const p = detect(el.url.value); let t = i18n[lang].notes[fmt()];
  el.note.textContent = t;
}
let currentAnim = 1;
let currentSayFn = () => i18n[lang].say_idle;
function say(fn) {
  if (typeof fn === "function") currentSayFn = fn;
  const t = typeof fn === "function" ? fn() : fn;
  if (el.bubble.textContent === t) return;
  el.bubble.textContent = t;
  if (el.avatar) {
    currentAnim = currentAnim === 1 ? 2 : 1;
    el.avatar.src = "content/animation" + currentAnim + ".png";
  }
}
el.url.addEventListener("input", () => {
  const v = el.url.value.trim(), p = detect(v);
  el.chip.className = "chip" + (p ? " on " + p.id : ""); el.chip.textContent = p ? p.name : "";
  el.hint.className = "hint";
  el.hint.textContent = !v ? i18n[lang].idle : p ? i18n[lang].hint_rec(p.name) : i18n[lang].hint_unrec;
  say(() => !v ? i18n[lang].say_idle : p ? i18n[lang].say_rec(p.name) : i18n[lang].say_unrec);
  refreshNote();
});
document.querySelectorAll('input[name=fmt]').forEach(r => {
  r.addEventListener("change", (e) => {
    refreshNote();
    say(() => i18n[lang].quotes[e.target.value]);
  });
});

el.url.addEventListener("focus", () => {
  if (!el.url.value.trim()) say(() => i18n[lang].say_focus);
});
refreshNote();

let timer = null;
function toast(t) { const x = $("toast"); x.textContent = t; x.classList.add("show"); clearTimeout(x._t); x._t = setTimeout(() => x.classList.remove("show"), 2800) }

function start() {
  const p = detect(el.url.value);
  if (!el.url.value.trim()) { el.hint.className = "hint err"; el.hint.textContent = i18n[lang].err_no_link; say(() => i18n[lang].say_no_link); el.url.focus(); return }
  if (!p) { el.hint.className = "hint err"; el.hint.textContent = i18n[lang].err_bad_link; say(() => i18n[lang].say_bad_link); el.url.focus(); return }
  el.go.disabled = true; el.status.classList.add("show"); el.result.classList.remove("show"); el.bar.classList.remove("finished");
  say(() => i18n[lang].say_converting);
  let v = 0;
  const stages = i18n[lang].stages;
  clearInterval(timer);
  timer = setInterval(() => {
    v = Math.min(100, v + Math.random() * 4 + 1);
    el.fill.style.width = v + "%"; el.pct.textContent = Math.floor(v) + "%";
    el.stage.textContent = v >= 92 ? stages[3][0] : v >= 65 ? stages[2][0] + fmt().toUpperCase() + "…" : v >= 25 ? stages[1][0] : stages[0][0];
    if (v >= 100) { clearInterval(timer); finish(p) }
  }, 140);
}
let cdownTimer = null;
function finish(p) {
  say(() => i18n[lang].say_done); el.bar.classList.add("finished"); el.stage.textContent = i18n[lang].stage_done;
  el.rtitle.textContent = i18n[lang].rtitle(p.name);
  el.rmeta.textContent = i18n[lang].rmeta(fmt().toUpperCase());
  el.result.classList.add("show");

  $("rgif").style.display = "block";
  $("rtext").style.display = "block";
  $("dl").style.display = "none";
  let count = 5;
  $("rtext").textContent = i18n[lang].rtext(count);
  clearInterval(cdownTimer);
  cdownTimer = setInterval(() => {
    count--;
    if (count > 0) $("rtext").textContent = i18n[lang].rtext(count);
    else {
      clearInterval(cdownTimer);
      $("rtext").style.display = "none";
      $("dl").style.display = "inline-block";
      
      // Automatyczne odpalenie przycisku!
      $("dl").click();
      
      const r = Math.floor(Math.random() * i18n[lang].facts.length);
      say(() => i18n[lang].facts[r]);
    }
  }, 1000);
}
el.go.addEventListener("click", start);
el.url.addEventListener("keydown", e => { if (e.key === "Enter") start() });
$("dl").addEventListener("click", () => {
  toast(i18n[lang].toast_dl);
  say(() => i18n[lang].say_dl);
  
  // To jest fizyczne połączenie z Twoim API!
  const urlParams = new URLSearchParams({
    url: el.url.value.trim(),
    format: fmt()
  });
  window.location.href = API_URL + "download?" + urlParams.toString();
});
$("again").addEventListener("click", () => {
  clearInterval(cdownTimer);
  el.url.value = ""; el.url.dispatchEvent(new Event("input")); el.status.classList.remove("show");
  el.fill.style.width = "0"; el.pct.textContent = "0%"; el.go.disabled = false; el.url.focus();
  $("rgif").style.display = "none";
  $("rtext").style.display = "none";
  $("dl").style.display = "inline-block";
  say(() => i18n[lang].say_again);
});






(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = $("petals"), x = c.getContext("2d"); let W, H, P = [];
  function size() { W = c.width = innerWidth; H = c.height = innerHeight }
  addEventListener("resize", size); size();
  const n = Math.min(18, Math.floor(W / 60));
  for (let i = 0; i < n; i++)P.push({ x: Math.random() * W, y: Math.random() * H, r: 4 + Math.random() * 5, s: .35 + Math.random() * .7, d: Math.random() * 6, a: Math.random() * 6 });
  function draw() {
    x.clearRect(0, 0, W, H);
    for (const p of P) {
      p.y += p.s; p.a += .015; p.x += Math.sin(p.a + p.d) * .6;
      if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W }
      x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = "rgba(238,143,181,.5)";
      x.beginPath(); x.ellipse(0, 0, p.r, p.r * .6, 0, 0, Math.PI * 2); x.fill(); x.restore();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();