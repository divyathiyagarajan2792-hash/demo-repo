// 0 → Shipped Resume Parser
// Everything runs in the browser: pdf.js extracts the text from the uploaded
// PDF, then a plain string match against a skill list builds the score.

// The skills the matcher looks for. Add or remove freely — this one list
// drives both "present" and "missing" sections and the score.
const SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
  'HTML', 'CSS', 'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express',
  'Django', 'Flask', 'Spring',
  'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git',
  'REST', 'GraphQL', 'Linux', 'Figma', 'Jest', 'Cypress', 'Terraform',
];

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const fileNameEl = document.getElementById('file-name');
const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');

const ringFill = document.getElementById('ring-fill');
const scoreNum = document.getElementById('score-num');
const scoreNote = document.getElementById('score-note');
const presentList = document.getElementById('present-skills');
const presentEmpty = document.getElementById('present-empty');
const missingList = document.getElementById('missing-skills');
const presentCount = document.getElementById('present-count');
const missingCount = document.getElementById('missing-count');

const RING_CIRCUMFERENCE = 326.7; // keep in sync with .ring-fill in style.css

// ---------- dropzone wiring ----------
dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fileInput.click();
  }
});
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

['dragover', 'dragenter'].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  })
);

['dragleave', 'drop'].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
  })
);

dropzone.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

// ---------- main flow ----------
async function handleFile(file) {
  if (file.type !== 'application/pdf') {
    setStatus('That is not a PDF — please upload a .pdf file.', true);
    return;
  }

  fileNameEl.textContent = file.name;
  fileNameEl.hidden = false;
  setStatus('Reading PDF…');

  try {
    const text = await extractText(file);
    if (!text.trim()) {
      setStatus('No text found in this PDF (it may be a scan — images have no text layer).', true);
      return;
    }

    render(text);
    setStatus('Parsed locally. Nothing was uploaded.');
  } catch (err) {
    console.error(err);
    setStatus('Could not read that PDF — try another file.', true);
  }
}

// pdf.js gives us one text item per line; join and count how many pages were read
async function extractText(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(' ') + ' ';
  }
  return text;
}

// ---------- parsing + scoring ----------
function render(text) {
  const haystack = text.toLowerCase();
  const present = [];
  const missing = [];

  for (const skill of SKILLS) {
    if (haystack.includes(skill.toLowerCase())) present.push(skill);
    else missing.push(skill);
  }

  const score = Math.round((present.length / SKILLS.length) * 100);
  drawScore(score);
  drawChips(presentList, present, presentEmpty);
  drawChips(missingList, missing, null);
  presentCount.textContent = `· ${present.length}`;
  missingCount.textContent = `· ${missing.length}`;

  statusEl.hidden = false;
  resultsEl.hidden = false;
}

function drawScore(score) {
  scoreNum.textContent = score;
  ringFill.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - score / 100);
  // colour shifts as the score climbs: red → amber → green
  ringFill.style.stroke = score < 40 ? 'var(--bad)' : score < 70 ? '#fbbf24' : 'var(--good)';
  scoreNote.textContent =
    score === 0 ? 'No known skills detected.' :
    score < 40 ? 'Light coverage — good enough to see the flow, thin for a real role.' :
    score < 70 ? 'Decent coverage. Adding a few more tools would help.' :
    'Strong coverage across the board.';
}

function drawChips(listEl, skills, emptyEl) {
  listEl.textContent = '';
  if (skills.length === 0) {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }
  if (emptyEl) emptyEl.hidden = true;
  for (const skill of skills) {
    const li = document.createElement('li');
    li.textContent = skill;
    listEl.appendChild(li);
  }
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
  statusEl.hidden = false;
}
