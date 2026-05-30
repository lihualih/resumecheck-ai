/**
 * Shared Monetization Script
 * Add this to all projects for: Analytics, AdSense, Affiliate links
 *
 * SETUP INSTRUCTIONS:
 * 1. Replace 'G-XXXXXXXXXX' with your Google Analytics 4 ID
 * 2. Replace 'ca-pub-XXXXXXXXXXXXXXXX' with your AdSense Publisher ID
 * 3. Get GA4 ID: https://analytics.google.com → Create Property → Data Streams
 * 4. Get AdSense: https://adsense.google.com → Apply (need traffic first)
 */

(function() {
  'use strict';

  // ===== Configuration =====
  const CONFIG = {
    GA_ID: 'G-XXXXXXXXXX',           // Replace with your GA4 Measurement ID
    ADSENSE_ID: 'ca-pub-XXXXXXXXXXXXXXXX', // Replace with your AdSense Publisher ID
    AFFILIATE_TAG: 'freetool-20',     // Amazon affiliate tag (if applicable)
  };

  // ===== Google Analytics 4 =====
  if (CONFIG.GA_ID !== 'G-XXXXXXXXXX') {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.GA_ID;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', CONFIG.GA_ID, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });
  }

  // ===== Google AdSense =====
  if (CONFIG.ADSENSE_ID !== 'ca-pub-XXXXXXXXXXXXXXXX') {
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + CONFIG.ADSENSE_ID;
    document.head.appendChild(script);
  }

  // ===== Auto-inject Ad Slots =====
  function injectAds() {
    // Replace placeholder divs with actual AdSense code
    document.querySelectorAll('.ad-slot, .ad-placeholder').forEach(slot => {
      if (CONFIG.ADSENSE_ID !== 'ca-pub-XXXXXXXXXXXXXXXX') {
        slot.innerHTML = '';
        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.display = 'block';
        ins.setAttribute('data-ad-client', CONFIG.ADSENSE_ID);
        ins.setAttribute('data-ad-slot', 'auto');
        ins.setAttribute('data-ad-format', 'auto');
        ins.setAttribute('data-full-width-responsive', 'true');
        slot.appendChild(ins);
        try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
      }
    });
  }

  // ===== Affiliate Recommendation Box =====
  function injectAffiliateBox() {
    const footer = document.querySelector('footer, .footer');
    if (!footer) return;

    const box = document.createElement('div');
    box.className = 'affiliate-box';
    box.innerHTML = `
      <div style="max-width:800px;margin:20px auto;padding:20px;background:var(--bg-card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;text-align:center;">
        <p style="font-size:0.85rem;color:var(--text-secondary,#64748b);margin:0;">
          💡 <strong>Recommended:</strong>
          <a href="https://www.digitalocean.com/?refcode=yourcode" target="_blank" rel="noopener" style="color:var(--primary,#2563eb);margin:0 8px;">DigitalOcean</a> •
          <a href="https://www.namecheap.com/?aff=yourcode" target="_blank" rel="noopener" style="color:var(--primary,#2563eb);margin:0 8px;">Namecheap</a> •
          <a href="https://www.buymeacoffee.com" target="_blank" rel="noopener" style="color:var(--primary,#2563eb);margin:0 8px;">☕ Buy Me a Coffee</a>
        </p>
      </div>
    `;
    footer.parentNode.insertBefore(box, footer);
  }

  // ===== Donate Button =====
  function injectDonateButton() {
    const footer = document.querySelector('footer, .footer');
    if (!footer) return;

    const donate = document.createElement('div');
    donate.style.cssText = 'text-align:center;margin:16px 0;';
    donate.innerHTML = `
      <a href="https://www.buymeacoffee.com/yourusername" target="_blank" rel="noopener"
         style="display:inline-block;padding:10px 24px;background:#FFDD00;color:#000;border-radius:8px;font-weight:700;font-size:0.9rem;text-decoration:none;transition:transform 0.2s;"
         onmouseover="this.style.transform='scale(1.05)'"
         onmouseout="this.style.transform='scale(1)'">
        ☕ Buy Me a Coffee
      </a>
    `;
    footer.parentNode.insertBefore(donate, footer);
  }

  // ===== Init =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    injectAds();
    injectDonateButton();
  }
})();
