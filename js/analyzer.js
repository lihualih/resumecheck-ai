/**
 * Resume Analyzer Engine
 * Rule-based analysis — no external API required.
 * Provides comprehensive resume scoring and feedback.
 */

const ResumeAnalyzer = (function() {

  // ===== Role-specific keywords =====
  const ROLE_KEYWORDS = {
    'software-engineer': {
      required: ['software', 'develop', 'code', 'programming', 'test', 'debug'],
      preferred: ['agile', 'scrum', 'git', 'CI/CD', 'API', 'microservices', 'cloud', 'AWS', 'docker', 'kubernetes', 'SQL', 'database', 'algorithm', 'data structure', 'REST', 'design pattern', 'refactor', 'performance', 'scalability'],
      bonus: ['open source', 'contributed', 'led', 'mentored', 'architected', 'system design']
    },
    'frontend-developer': {
      required: ['frontend', 'JavaScript', 'HTML', 'CSS', 'responsive', 'UI'],
      preferred: ['React', 'Vue', 'Angular', 'TypeScript', 'Next.js', 'webpack', 'Vite', 'SASS', 'Tailwind', 'accessibility', 'cross-browser', 'performance', 'SPA', 'PWA', 'component', 'state management'],
      bonus: ['design system', 'animation', 'SVG', 'canvas', 'WebGL', 'mobile-first']
    },
    'backend-developer': {
      required: ['backend', 'API', 'database', 'server', 'authentication'],
      preferred: ['Node.js', 'Python', 'Java', 'Go', 'PostgreSQL', 'MongoDB', 'Redis', 'REST', 'GraphQL', 'microservices', 'docker', 'kubernetes', 'AWS', 'message queue', 'caching', 'load balancing'],
      bonus: ['distributed system', 'high availability', 'event-driven', 'CQRS', 'DDD']
    },
    'fullstack-developer': {
      required: ['full stack', 'frontend', 'backend', 'database', 'API'],
      preferred: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'CI/CD', 'REST', 'GraphQL', 'Git', 'agile', 'deployment', 'testing'],
      bonus: ['end-to-end', 'architecture', 'DevOps', 'infrastructure', 'system design']
    },
    'data-scientist': {
      required: ['data', 'machine learning', 'model', 'analysis', 'Python'],
      preferred: ['TensorFlow', 'PyTorch', 'scikit-learn', 'pandas', 'numpy', 'SQL', 'statistics', 'regression', 'classification', 'NLP', 'deep learning', 'feature engineering', 'A/B test', 'visualization', 'Jupyter'],
      bonus: ['published', 'research', 'production model', 'big data', 'Spark', 'MLOps']
    },
    'data-analyst': {
      required: ['data', 'analysis', 'SQL', 'Excel', 'report'],
      preferred: ['Tableau', 'Power BI', 'Python', 'R', 'visualization', 'dashboard', 'KPI', 'metrics', 'database', 'ETL', 'statistics', 'trend', 'forecast', 'business intelligence'],
      bonus: ['automated', 'pipeline', 'stakeholder', 'presented', 'insight', 'decision']
    },
    'product-manager': {
      required: ['product', 'roadmap', 'stakeholder', 'user', 'strategy'],
      preferred: ['agile', 'scrum', 'sprint', 'backlog', 'A/B test', 'metrics', 'KPI', 'user research', 'wireframe', 'PRD', 'prioritize', 'cross-functional', 'launch', 'market', 'competitive'],
      bonus: ['revenue', 'growth', 'retention', 'conversion', 'NPS', 'OKR']
    },
    'designer': {
      required: ['design', 'UI', 'UX', 'user', 'wireframe', 'prototype'],
      preferred: ['Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'user research', 'usability', 'accessibility', 'design system', 'typography', 'color theory', 'responsive', 'interaction design', 'information architecture'],
      bonus: ['design thinking', 'A/B test', 'user testing', 'motion design', 'brand']
    },
    'general': {
      required: ['experience', 'skills', 'education', 'work', 'project'],
      preferred: ['team', 'lead', 'manage', 'improve', 'develop', 'create', 'implement', 'analyze', 'collaborate', 'communicate', 'problem', 'solution', 'result', 'achieve', 'deliver'],
      bonus: ['award', 'promotion', 'exceeded', 'top performer', 'recognized']
    }
  };

  // ===== Power Action Verbs =====
  const STRONG_VERBS = [
    'achieved', 'accelerated', 'accomplished', 'administered', 'analyzed', 'architected',
    'automated', 'built', 'collaborated', 'consolidated', 'constructed', 'converted',
    'coordinated', 'created', 'decreased', 'delivered', 'demonstrated', 'designed',
    'developed', 'directed', 'drove', 'eliminated', 'engineered', 'established',
    'executed', 'expanded', 'facilitated', 'generated', 'grew', 'implemented',
    'improved', 'increased', 'influenced', 'initiated', 'innovated', 'integrated',
    'introduced', 'launched', 'led', 'managed', 'maximized', 'mentored', 'migrated',
    'modernized', 'negotiated', 'optimized', 'orchestrated', 'pioneered', 'produced',
    'programmed', 'proposed', 'reduced', 'refactored', 'redesigned', 'resolved',
    'revamped', 'scaled', 'spearheaded', 'streamlined', 'strengthened', 'supervised',
    'transformed', 'unified', 'upgraded'
  ];

  const WEAK_VERBS = [
    'helped', 'worked on', 'was responsible for', 'assisted', 'participated in',
    'involved in', 'handled', 'dealt with', 'did', 'made', 'got', 'went'
  ];

  const CLICHES = [
    'team player', 'hard worker', 'detail-oriented', 'self-starter', 'go-getter',
    'think outside the box', 'synergy', 'leverage', 'passionate', 'results-driven',
    'dynamic', 'proven track record', 'excellent communication skills', 'fast learner',
    'hit the ground running', 'wear many hats', 'value add', 'best practice'
  ];

  // ===== Section Detection =====
  const SECTION_PATTERNS = {
    contact_email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    contact_phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
    contact_linkedin: /linkedin\.com/i,
    contact_github: /github\.com/i,
    section_experience: /\b(experience|employment|work history|professional experience)\b/i,
    section_education: /\b(education|degree|university|college|academic)\b/i,
    section_skills: /\b(skills|technologies|competencies|technical skills|expertise)\b/i,
    section_projects: /\b(projects|portfolio|personal projects)\b/i,
    section_certifications: /\b(certifications?|certificates?|licenses?)\b/i,
    section_summary: /\b(summary|objective|profile|about)\b/i
  };

  // ===== Scoring Weights =====
  const WEIGHTS = {
    contact: 10,
    structure: 15,
    content: 20,
    actionVerbs: 10,
    quantification: 15,
    keywords: 15,
    readability: 10,
    clichePenalty: 5
  };

  // ===== Analysis Functions =====

  function analyzeContact(text) {
    const results = { score: 0, max: 100, items: [] };
    const has = (key) => SECTION_PATTERNS[key].test(text);

    if (has('contact_email')) {
      results.score += 30;
      results.items.push({ type: 'strength', text: 'Email address found' });
    } else {
      results.items.push({ type: 'issue', text: 'No email address detected. Include a professional email.' });
    }

    if (has('contact_phone')) {
      results.score += 20;
      results.items.push({ type: 'strength', text: 'Phone number found' });
    } else {
      results.items.push({ type: 'warning', text: 'No phone number detected. Consider adding one.' });
    }

    if (has('contact_linkedin')) {
      results.score += 25;
      results.items.push({ type: 'strength', text: 'LinkedIn profile linked' });
    } else {
      results.items.push({ type: 'suggestion', text: 'Add your LinkedIn profile URL for better professional visibility.' });
    }

    if (has('contact_github')) {
      results.score += 25;
      results.items.push({ type: 'strength', text: 'GitHub profile linked' });
    }

    return results;
  }

  function analyzeStructure(text) {
    const results = { score: 0, max: 100, items: [] };
    let sectionCount = 0;

    const checks = [
      { key: 'section_experience', label: 'Work Experience section', critical: true },
      { key: 'section_education', label: 'Education section', critical: true },
      { key: 'section_skills', label: 'Skills section', critical: true },
      { key: 'section_projects', label: 'Projects section', critical: false },
      { key: 'section_summary', label: 'Summary/Objective section', critical: false },
      { key: 'section_certifications', label: 'Certifications section', critical: false }
    ];

    for (const check of checks) {
      if (SECTION_PATTERNS[check.key].test(text)) {
        sectionCount++;
        results.score += check.critical ? 25 : 10;
        results.items.push({ type: 'strength', text: `${check.label} found` });
      } else if (check.critical) {
        results.items.push({ type: 'issue', text: `Missing ${check.label}. This is essential for most resumes.` });
      }
    }

    // Check for bullet points
    const bullets = (text.match(/^[\s]*[•\-\*]\s/gm) || []).length;
    if (bullets >= 5) {
      results.score += 15;
      results.items.push({ type: 'strength', text: `Good use of bullet points (${bullets} found)` });
    } else {
      results.items.push({ type: 'warning', text: 'Use more bullet points to describe your experience (aim for 3-5 per role).' });
    }

    results.score = Math.min(100, results.score);
    return results;
  }

  function analyzeContent(text) {
    const results = { score: 0, max: 100, items: [] };
    const words = text.trim().split(/\s+/);

    // Word count
    if (words.length >= 300 && words.length <= 800) {
      results.score += 30;
      results.items.push({ type: 'strength', text: `Good resume length (${words.length} words)` });
    } else if (words.length < 300) {
      results.items.push({ type: 'issue', text: `Resume is too short (${words.length} words). Aim for 300-800 words.` });
    } else if (words.length > 1200) {
      results.items.push({ type: 'warning', text: `Resume is quite long (${words.length} words). Consider trimming to 1-2 pages.` });
    } else {
      results.score += 15;
      results.items.push({ type: 'warning', text: `Resume length is acceptable (${words.length} words) but could be more concise.` });
    }

    // Check for quantified achievements
    const numbers = text.match(/\b\d+(\.\d+)?%?\b/g) || [];
    const dollarAmounts = text.match(/\$[\d,]+/g) || [];
    const quantified = numbers.length + dollarAmounts.length;

    if (quantified >= 5) {
      results.score += 35;
      results.items.push({ type: 'strength', text: `Strong quantification — ${quantified} numbers/metrics found. Data-driven resumes stand out!` });
    } else if (quantified >= 2) {
      results.score += 20;
      results.items.push({ type: 'warning', text: `Some quantification found (${quantified} metrics). Add more numbers to strengthen your achievements.` });
    } else {
      results.items.push({ type: 'issue', text: 'Very few quantified achievements. Add numbers, percentages, and dollar amounts to show impact.' });
    }

    // Check for dates/timeline
    const years = text.match(/\b(19|20)\d{2}\b/g) || [];
    if (years.length >= 2) {
      results.score += 20;
      results.items.push({ type: 'strength', text: 'Timeline/dates present for work history' });
    } else {
      results.items.push({ type: 'warning', text: 'Add dates to your work experience and education.' });
    }

    // Check sentence variety
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const avgLen = sentences.reduce((s, e) => s + e.split(/\s+/).length, 0) / (sentences.length || 1);
    if (avgLen > 8 && avgLen < 25) {
      results.score += 15;
    }

    results.score = Math.min(100, results.score);
    return results;
  }

  function analyzeActionVerbs(text) {
    const results = { score: 0, max: 100, items: [], used: [], suggested: [] };
    const lowerText = text.toLowerCase();

    const usedVerbs = STRONG_VERBS.filter(v => lowerText.includes(v));
    const usedWeak = WEAK_VERBS.filter(v => lowerText.includes(v));

    results.used = usedVerbs;

    if (usedVerbs.length >= 8) {
      results.score += 60;
      results.items.push({ type: 'strength', text: `Excellent action verb variety — ${usedVerbs.length} strong verbs found` });
    } else if (usedVerbs.length >= 4) {
      results.score += 35;
      results.items.push({ type: 'warning', text: `Good start with ${usedVerbs.length} action verbs. Aim for 8+ different strong verbs.` });
    } else {
      results.items.push({ type: 'issue', text: `Only ${usedVerbs.length} strong action verbs found. Start bullet points with powerful verbs.` });
    }

    // Penalize weak verbs
    if (usedWeak.length > 0) {
      results.score -= usedWeak.length * 5;
      results.items.push({ type: 'issue', text: `Weak verbs detected: "${usedWeak.join('", "')}". Replace with stronger alternatives.` });
    }

    // Suggest unused verbs
    const unused = STRONG_VERBS.filter(v => !lowerText.includes(v));
    results.suggested = unused.sort(() => Math.random() - 0.5).slice(0, 8);

    results.score = Math.max(0, Math.min(100, results.score + 40));
    return results;
  }

  function analyzeKeywords(text, role) {
    const results = { score: 0, max: 100, found: [], missing: [], items: [] };
    const keywords = ROLE_KEYWORDS[role] || ROLE_KEYWORDS['general'];
    const lowerText = text.toLowerCase();

    // Check required keywords
    for (const kw of keywords.required) {
      if (lowerText.includes(kw.toLowerCase())) {
        results.found.push(kw);
      } else {
        results.missing.push(kw);
      }
    }

    // Check preferred keywords
    for (const kw of keywords.preferred) {
      if (lowerText.includes(kw.toLowerCase())) {
        results.found.push(kw);
      } else {
        results.missing.push(kw);
      }
    }

    // Check bonus keywords
    for (const kw of keywords.bonus) {
      if (lowerText.includes(kw.toLowerCase())) {
        results.found.push(kw);
      }
    }

    const totalRequired = keywords.required.length;
    const foundRequired = keywords.required.filter(k => lowerText.includes(k.toLowerCase())).length;
    const totalPreferred = keywords.preferred.length;
    const foundPreferred = keywords.preferred.filter(k => lowerText.includes(k.toLowerCase())).length;

    results.score = Math.round(
      (foundRequired / totalRequired) * 50 +
      (foundPreferred / totalPreferred) * 40 +
      (keywords.bonus.filter(k => lowerText.includes(k.toLowerCase())).length / keywords.bonus.length) * 10
    );

    if (results.missing.length <= 3) {
      results.items.push({ type: 'strength', text: 'Excellent keyword coverage for your target role!' });
    } else {
      results.items.push({ type: 'suggestion', text: `Consider adding these keywords: ${results.missing.slice(0, 5).join(', ')}` });
    }

    results.score = Math.min(100, results.score);
    return results;
  }

  function analyzeReadability(text) {
    const results = { score: 0, max: 100, items: [] };

    // Average sentence length
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const avgWords = sentences.reduce((s, e) => s + e.split(/\s+/).length, 0) / (sentences.length || 1);

    if (avgWords <= 20) {
      results.score += 40;
      results.items.push({ type: 'strength', text: 'Good sentence length — easy to read' });
    } else if (avgWords <= 30) {
      results.score += 25;
      results.items.push({ type: 'warning', text: 'Some sentences are long. Break them up for better readability.' });
    } else {
      results.items.push({ type: 'issue', text: 'Many sentences are too long. Keep sentences under 20 words for bullet points.' });
    }

    // Paragraph length
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    if (paragraphs.length >= 3) {
      results.score += 30;
      results.items.push({ type: 'strength', text: `Well-structured with ${paragraphs.length} sections` });
    }

    // Check for ALL CAPS abuse
    const capsWords = text.match(/\b[A-Z]{4,}\b/g) || [];
    if (capsWords.length > 5) {
      results.items.push({ type: 'warning', text: 'Excessive use of ALL CAPS. Use sparingly for emphasis only.' });
    } else {
      results.score += 30;
    }

    results.score = Math.min(100, results.score);
    return results;
  }

  function analyzeCliches(text) {
    const lowerText = text.toLowerCase();
    const found = CLICHES.filter(c => lowerText.includes(c));

    return {
      score: Math.max(0, 100 - found.length * 20),
      max: 100,
      found,
      items: found.length > 0
        ? [{ type: 'warning', text: `Clichés detected: "${found.join('", "')}". Replace with specific, concrete examples.` }]
        : [{ type: 'strength', text: 'No common clichés detected — great specificity!' }]
    };
  }

  // ===== Main Analysis =====
  function analyze(text, role) {
    if (!text || text.trim().length < 50) {
      return { error: 'Please paste at least a few sentences of your resume.' };
    }

    role = role || 'general';

    const contact = analyzeContact(text);
    const structure = analyzeStructure(text);
    const content = analyzeContent(text);
    const actionVerbs = analyzeActionVerbs(text);
    const keywords = analyzeKeywords(text, role);
    const readability = analyzeReadability(text);
    const cliches = analyzeCliches(text);

    // Calculate weighted overall score
    const categories = {
      contact: { result: contact, weight: WEIGHTS.contact },
      structure: { result: structure, weight: WEIGHTS.structure },
      content: { result: content, weight: WEIGHTS.content },
      actionVerbs: { result: actionVerbs, weight: WEIGHTS.actionVerbs },
      quantification: { result: content, weight: WEIGHTS.quantification }, // reuse content
      keywords: { result: keywords, weight: WEIGHTS.keywords },
      readability: { result: readability, weight: WEIGHTS.readability },
      clichePenalty: { result: cliches, weight: WEIGHTS.clichePenalty }
    };

    let totalWeight = 0;
    let weightedSum = 0;
    for (const key of Object.keys(categories)) {
      const cat = categories[key];
      weightedSum += cat.result.score * cat.weight;
      totalWeight += cat.weight;
    }

    const overallScore = Math.round(weightedSum / totalWeight);

    // Collect all feedback
    const strengths = [];
    const issues = [];
    const suggestions = [];

    const allResults = [contact, structure, content, actionVerbs, keywords, readability, cliches];
    for (const r of allResults) {
      for (const item of r.items) {
        if (item.type === 'strength') strengths.push(item.text);
        else if (item.type === 'issue') issues.push(item.text);
        else if (item.type === 'warning') issues.push(item.text);
        else if (item.type === 'suggestion') suggestions.push(item.text);
      }
    }

    return {
      overallScore,
      categories: {
        contact: { score: contact.score, label: 'Contact Info', weight: WEIGHTS.contact },
        structure: { score: structure.score, label: 'Resume Structure', weight: WEIGHTS.structure },
        content: { score: content.score, label: 'Content Quality', weight: WEIGHTS.content },
        actionVerbs: { score: actionVerbs.score, label: 'Action Verbs', weight: WEIGHTS.actionVerbs },
        keywords: { score: keywords.score, label: 'Keyword Match', weight: WEIGHTS.keywords },
        readability: { score: readability.score, label: 'Readability', weight: WEIGHTS.readability },
        clicheFree: { score: cliches.score, label: 'Originality', weight: WEIGHTS.clichePenalty }
      },
      strengths,
      issues,
      suggestions,
      keywords: {
        found: keywords.found,
        missing: keywords.missing
      },
      actionVerbs: {
        used: actionVerbs.used,
        suggested: actionVerbs.suggested
      },
      cliches: cliches.found
    };
  }

  return { analyze };
})();
