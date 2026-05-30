// ===== ResumeCheck.ai App =====

// Theme
function initTheme() {
  const saved = localStorage.getItem('rc-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('rc-theme', next);
}

// Toast
function showToast(msg, ms = 2500) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), ms);
}

// Usage tracking (localStorage)
const USAGE_KEY = 'rc-usage';
const FREE_LIMIT = 3;

function getUsage() {
  try {
    const data = JSON.parse(localStorage.getItem(USAGE_KEY));
    const today = new Date().toDateString();
    if (data && data.date === today) return data.count;
    return 0;
  } catch { return 0; }
}

function incrementUsage() {
  const today = new Date().toDateString();
  const count = getUsage() + 1;
  localStorage.setItem(USAGE_KEY, JSON.stringify({ date: today, count }));
  return count;
}

function updateUsageBadge() {
  const used = getUsage();
  const remaining = Math.max(0, FREE_LIMIT - used);
  document.getElementById('remaining').textContent = remaining;
  const badge = document.getElementById('usage-badge');
  if (remaining === 0) {
    badge.style.background = 'var(--error-light)';
    badge.style.color = 'var(--error)';
    badge.innerHTML = 'Daily limit reached — <strong>resets tomorrow</strong>';
  }
}

// ===== Analysis =====
function analyzeResume() {
  const text = document.getElementById('resume-text').value.trim();
  const role = document.getElementById('target-role').value;

  if (!text) {
    showToast('Please paste your resume text');
    return;
  }

  if (text.length < 50) {
    showToast('Please paste more of your resume (at least 50 characters)');
    return;
  }

  // Check usage
  const used = getUsage();
  if (used >= FREE_LIMIT) {
    showToast('Daily free limit reached. Come back tomorrow for more!');
    return;
  }

  // Show loading
  const btn = document.getElementById('analyze-btn');
  const origText = btn.innerHTML;
  btn.innerHTML = '<span class="loading-spinner"></span> Analyzing...';
  btn.disabled = true;

  // Simulate brief processing time for UX
  setTimeout(() => {
    try {
      const result = ResumeAnalyzer.analyze(text, role);
      if (result.error) {
        showToast(result.error);
        btn.innerHTML = origText;
        btn.disabled = false;
        return;
      }

      incrementUsage();
      updateUsageBadge();
      displayResults(result);
    } catch (e) {
      showToast('Analysis error: ' + e.message);
    }

    btn.innerHTML = origText;
    btn.disabled = false;
  }, 800);
}

// ===== Display Results =====
function displayResults(result) {
  // Show results section
  document.getElementById('results-section').style.display = 'block';
  document.querySelector('.input-section').style.display = 'none';

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Animate score
  animateScore(result.overallScore);

  // Score label
  const label = document.getElementById('score-label');
  const sublabel = document.getElementById('score-sublabel');
  if (result.overallScore >= 80) {
    label.textContent = 'Excellent Resume! 🎉';
    label.style.color = 'var(--success)';
    sublabel.textContent = 'Your resume is well-optimized. Minor tweaks could make it even better.';
  } else if (result.overallScore >= 60) {
    label.textContent = 'Good Resume 👍';
    label.style.color = 'var(--primary)';
    sublabel.textContent = 'Solid foundation with room for improvement.';
  } else if (result.overallScore >= 40) {
    label.textContent = 'Needs Improvement 📝';
    label.style.color = 'var(--warning)';
    sublabel.textContent = 'Several areas need attention. Follow the suggestions below.';
  } else {
    label.textContent = 'Significant Work Needed ⚠️';
    label.style.color = 'var(--error)';
    sublabel.textContent = 'Your resume needs major improvements. Address the issues below.';
  }

  // Category scores
  renderCategories(result.categories);

  // Strengths
  renderList('strengths-list', result.strengths, 'strength');

  // Issues
  renderList('issues-list', result.issues, 'issue');

  // Suggestions
  renderList('suggestions-list', result.suggestions, 'suggestion');

  // Keywords
  renderKeywords(result.keywords);

  // Action Verbs
  renderActionVerbs(result.actionVerbs);
}

function animateScore(score) {
  const ring = document.getElementById('score-ring');
  const value = document.getElementById('score-value');
  const circumference = 2 * Math.PI * 54; // r=54

  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference;

  // Color based on score
  let color;
  if (score >= 80) color = 'var(--success)';
  else if (score >= 60) color = 'var(--primary)';
  else if (score >= 40) color = 'var(--warning)';
  else color = 'var(--error)';

  ring.style.stroke = color;

  // Animate
  setTimeout(() => {
    const offset = circumference - (score / 100) * circumference;
    ring.style.strokeDashoffset = offset;
  }, 100);

  // Counter animation
  let current = 0;
  const step = Math.max(1, Math.floor(score / 40));
  const interval = setInterval(() => {
    current += step;
    if (current >= score) { current = score; clearInterval(interval); }
    value.textContent = current;
    value.style.color = color;
  }, 30);
}

function renderCategories(categories) {
  const container = document.getElementById('category-scores');
  container.innerHTML = '';

  for (const [key, cat] of Object.entries(categories)) {
    let color;
    if (cat.score >= 80) color = 'var(--success)';
    else if (cat.score >= 60) color = 'var(--primary)';
    else if (cat.score >= 40) color = 'var(--warning)';
    else color = 'var(--error)';

    container.innerHTML += `
      <div class="category-item">
        <div class="category-header">
          <span class="category-name">${cat.label}</span>
          <span class="category-score" style="color:${color}">${cat.score}%</span>
        </div>
        <div class="category-bar">
          <div class="category-fill" style="width:${cat.score}%;background:${color}"></div>
        </div>
      </div>
    `;
  }
}

function renderList(elementId, items, className) {
  const list = document.getElementById(elementId);
  list.innerHTML = '';
  if (items.length === 0) {
    list.innerHTML = `<li class="${className}" style="opacity:0.6">No items to display</li>`;
    return;
  }
  for (const item of items) {
    list.innerHTML += `<li class="${className}">${item}</li>`;
  }
}

function renderKeywords(keywords) {
  const container = document.getElementById('keyword-analysis');
  let html = '';

  if (keywords.found.length > 0) {
    html += '<div class="keyword-section"><h4>✅ Found in your resume</h4><div class="keyword-tags">';
    for (const kw of keywords.found) {
      html += `<span class="keyword-tag found">${kw}</span>`;
    }
    html += '</div></div>';
  }

  if (keywords.missing.length > 0) {
    html += '<div class="keyword-section"><h4>❌ Missing (consider adding)</h4><div class="keyword-tags">';
    for (const kw of keywords.missing) {
      html += `<span class="keyword-tag missing">${kw}</span>`;
    }
    html += '</div></div>';
  }

  container.innerHTML = html;
}

function renderActionVerbs(verbs) {
  const container = document.getElementById('action-verbs');
  let html = '';

  if (verbs.used.length > 0) {
    html += '<div class="keyword-section"><h4>💪 Strong verbs you used</h4><div class="verb-grid">';
    for (const v of verbs.used) {
      html += `<span class="verb-item used">${v}</span>`;
    }
    html += '</div></div>';
  }

  if (verbs.suggested.length > 0) {
    html += '<div class="keyword-section"><h4>💡 Suggested verbs to add</h4><div class="verb-grid">';
    for (const v of verbs.suggested) {
      html += `<span class="verb-item suggested">${v}</span>`;
    }
    html += '</div></div>';
  }

  container.innerHTML = html;
}

function resetAnalyzer() {
  document.getElementById('results-section').style.display = 'none';
  document.querySelector('.input-section').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateUsageBadge();

  document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
});
