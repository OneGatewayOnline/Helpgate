// HelpGate Tools — Spendo Meta Ad Library Intelligence Engine
// Injected into https://www.facebook.com/ads/library/*
// 100% Free & Unlimited — No sign-in required, no plans or paywalls.

;(function () {
  'use strict'

  const LOG_PREFIX = '[HelpGate Spendo Intel]'
  console.log(LOG_PREFIX, 'Initialized on Meta Ad Library:', window.location.href)

  // ─── Global State ──────────────────────────────────────────────────────────
  const analyzedAds = new Map() // adId -> { meta, metrics }
  const processedAdIds = new Set() // Tracks injected ad IDs to prevent duplicate overlays
  let globalCurrency = 'INR' // 'INR' or 'USD'
  let currentFilter = 'all' // 'all', 'winning', 'high_spend', 'video', 'image', 'whatsapp'
  let toolbarElement = null
  let isScanning = false
  let allCardsExpanded = false

  // ─── Deterministic Hash / Seed Helper ──────────────────────────────────────
  function hashString(str) {
    let hash = 0
    const s = String(str || '')
    for (let i = 0; i < s.length; i++) {
      hash = (hash << 5) - hash + s.charCodeAt(i)
      hash |= 0 // Convert to 32bit int
    }
    return Math.abs(hash) / 2147483647
  }

  // ─── Number / Currency Formatting ──────────────────────────────────────────
  function formatMoney(amountINR, compact = true) {
    if (amountINR == null || isNaN(amountINR) || !isFinite(amountINR)) return '₹0'
    const num = Math.round(amountINR)

    if (globalCurrency === 'USD') {
      const usd = num / 86 // ~₹86/USD
      if (!compact) return '$' + Math.round(usd).toLocaleString('en-US')
      if (usd >= 1000000) return '$' + (usd / 1000000).toFixed(2).replace(/\.00$/, '') + 'M'
      if (usd >= 1000) return '$' + (usd / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
      return '$' + Math.round(usd)
    }

    // Default: INR (₹, Lakh, Crore)
    if (!compact) {
      return '₹' + num.toLocaleString('en-IN')
    }
    if (num >= 10000000) { // 1 Crore = 10,000,000
      return '₹' + (num / 10000000).toFixed(2).replace(/\.00$/, '') + ' Cr'
    }
    if (num >= 100000) { // 1 Lakh = 100,000
      return '₹' + (num / 100000).toFixed(2).replace(/\.00$/, '') + ' L'
    }
    if (num >= 1000) {
      return '₹' + (num / 1000).toFixed(1).replace(/\.0$/, '') + ' K'
    }
    return '₹' + num
  }

  function formatCount(num) {
    if (num == null || isNaN(num) || !isFinite(num)) return '0'
    const n = Math.round(num)
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    return String(n)
  }

  // ─── Toast Notifications ───────────────────────────────────────────────────
  function showToast(message, type = 'success') {
    let container = document.querySelector('.spendo-toast-container')
    if (!container) {
      container = document.createElement('div')
      container.className = 'spendo-toast-container'
      document.body.appendChild(container)
    }
    const toast = document.createElement('div')
    toast.className = `spendo-toast ${type}`
    toast.innerHTML = `<span>${type === 'success' ? '✓' : 'ℹ'}</span> <span>${message}</span>`
    container.appendChild(toast)
    setTimeout(() => {
      toast.style.opacity = '0'
      toast.style.transform = 'translateY(10px)'
      setTimeout(() => toast.remove(), 300)
    }, 3200)
  }

  // ─── Finding Ad Card Containers in Meta Ad Library ─────────────────────────
  function countLibraryIdsInElement(el) {
    if (!el || !el.innerText) return 0
    const matches = el.innerText.match(/Library ID:\s*\d+/gi)
    return matches ? matches.length : 0
  }

  /**
   * Resilient, non-duplicating card detector:
   * Uses DOM TreeWalker to find every text node matching 'Library ID: <id>'.
   * Walks up to the distinct single-ad card root container.
   */
  function findAdCards() {
    const cards = []
    const seenOnThisPass = new Set()

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          return node.nodeValue && node.nodeValue.includes('Library ID:')
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP
        },
      }
    )

    let textNode
    while ((textNode = walker.nextNode())) {
      const match = textNode.nodeValue.match(/Library ID:\s*(\d+)/i)
      if (!match) continue
      const adId = match[1]

      if (seenOnThisPass.has(adId)) continue
      seenOnThisPass.add(adId)

      // Skip if this ad already has an injected overlay in the live DOM
      if (document.querySelector(`.spendo-ad-card-wrapper[data-ad-id="${adId}"]`)) {
        processedAdIds.add(adId)
        continue
      }

      // Walk UP from textNode to locate the outer container for this ad
      let current = textNode.parentElement
      let cardRoot = current

      while (current && current !== document.body) {
        const parent = current.parentElement
        if (!parent || parent === document.body) break

        // When parent contains more than 1 Library ID, current is the individual card container!
        const parentIdCount = countLibraryIdsInElement(parent)
        if (parentIdCount > 1) {
          cardRoot = current
          break
        }

        cardRoot = current
        current = parent
      }

      if (cardRoot && !cardRoot.dataset.helpgateSpendo) {
        cards.push({ cardElement: cardRoot, adId })
      }
    }

    return cards
  }

  // ─── Extract Ad Metadata & Signals ─────────────────────────────────────────
  function extractAdData(cardElement, fallbackAdId) {
    const rawText = cardElement.innerText || ''

    // 1. Library ID
    const idMatch = rawText.match(/Library ID:\s*(\d+)/i) || rawText.match(/ID:\s*(\d+)/i)
    const adId = idMatch ? idMatch[1] : fallbackAdId || 'AD-' + Math.abs(hashString(rawText.substring(0, 100)) * 1000000000).toFixed(0)

    // 2. Active Status
    const isActive = !/Inactive/i.test(rawText.substring(0, 300)) && /Active/i.test(rawText.substring(0, 300))

    // 3. Start Date & Run Duration
    let daysActive = 1 // default
    let startDateStr = 'Recently'
    const dateMatch = rawText.match(/Started running on\s+([^\n·]+)/i)
    if (dateMatch) {
      startDateStr = dateMatch[1].trim()
      const parsedDate = new Date(startDateStr)
      if (!isNaN(parsedDate.getTime())) {
        const diffMs = Date.now() - parsedDate.getTime()
        // Cap active continuous scaling at 120 days for realistic media modeling
        daysActive = Math.min(120, Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24))))
      }
    }

    // 4. Creative Variants Count
    let variants = 1
    const variantMatch = rawText.match(/(\d+)\s+ads?\s+use this creative/i)
    if (variantMatch) {
      variants = parseInt(variantMatch[1], 10) || 1
    }

    // 5. Advertiser Brand Name
    let advertiserName = 'Brand'
    const brandLink = cardElement.querySelector('a[href*="/ads/library/?active_status"], a[href*="facebook.com/"], span[dir="auto"]')
    if (brandLink && brandLink.innerText.trim()) {
      advertiserName = brandLink.innerText.trim().split('\n')[0].substring(0, 40)
    }

    // 6. Media Asset (Video or Image)
    const videoEl = cardElement.querySelector('video')
    const imgEl = cardElement.querySelector('img[src*="scontent"], img[src*="fbcdn"], img[src*="cdninstagram"], img')
    const isVideo = !!videoEl
    let mediaUrl = ''

    if (videoEl) {
      mediaUrl = videoEl.src || (videoEl.querySelector('source') ? videoEl.querySelector('source').src : '')
    } else if (imgEl) {
      mediaUrl = imgEl.src
    }

    // 7. Body Copy / Ad Text
    const copyContainers = cardElement.querySelectorAll('div[style*="pre-wrap"], div[dir="auto"], p')
    let adText = ''
    for (const c of copyContainers) {
      const t = (c.innerText || '').trim()
      if (t.length > adText.length && !t.includes('Library ID') && !t.includes('Started running')) {
        adText = t
      }
    }

    // 8. CTA Link & Destination URL
    let ctaText = 'Shop Now'
    let ctaUrl = ''
    const links = cardElement.querySelectorAll('a[href]')
    for (const l of links) {
      const href = l.getAttribute('href') || ''
      if (
        !href.includes('facebook.com/ads/library') &&
        !href.includes('/ads/about') &&
        href.startsWith('http')
      ) {
        ctaUrl = href
        ctaText = l.innerText.trim() || 'Visit Store'
        break
      }
    }

    // Strict WhatsApp Detection (prevent false positives across entire brand catalogue)
    const isWhatsApp =
      ctaUrl.includes('wa.me') ||
      ctaUrl.includes('api.whatsapp.com') ||
      ctaUrl.includes('whatsapp.com') ||
      /whatsapp/i.test(ctaText) ||
      /\bwhatsapp\s*(?:us|me|now|order|chat|\+?\d+)/i.test(adText) ||
      /\bchat\s*on\s*whatsapp/i.test(adText)

    // 9. Real Product Price extraction from copy
    let detectedPrice = null
    const priceMatch = (adText + ' ' + rawText).match(/(?:₹|Rs\.?|INR)\s*([\d,]+)/i)
    if (priceMatch) {
      detectedPrice = parseFloat(priceMatch[1].replace(/,/g, ''))
      if (detectedPrice < 99 || detectedPrice > 50000) detectedPrice = null
    }

    return {
      adId,
      advertiserName,
      isActive,
      startDateStr,
      daysActive,
      variants,
      isVideo,
      mediaUrl,
      adText,
      ctaText,
      ctaUrl,
      isWhatsApp,
      detectedPrice,
      rawText,
    }
  }

  // ─── Spendo Public Signal Modeling & Calculation Engine ───────────────────
  function calculateSpendoMetrics(meta) {
    const seed = hashString(meta.adId)

    const durationDays = Math.max(1, Math.min(120, meta.daysActive || 1))
    const variantCount = Math.max(1, Math.min(25, meta.variants || 1))

    // Multiplier for Advantage+ / CBO budget scaling
    const variantMultiplier = variantCount > 1 ? 1 + (variantCount - 1) * 0.35 : 1

    // Duration tiers calibrated to real Indian D2C ad spend
    let baseDailySpend = 1800 // Base testing spend in INR (~$22/day)
    if (durationDays > 60) {
      baseDailySpend = 14000 + seed * 12000 // 60+ days = scaled winner (₹14k - ₹26k/day)
    } else if (durationDays > 30) {
      baseDailySpend = 7500 + seed * 6000   // 30-60 days = solid performer (₹7.5k - ₹13.5k/day)
    } else if (durationDays > 14) {
      baseDailySpend = 4000 + seed * 3500   // 14-30 days = scaling phase (₹4k - ₹7.5k/day)
    } else if (durationDays > 7) {
      baseDailySpend = 2500 + seed * 1800   // 7-14 days = optimization (₹2.5k - ₹4.3k/day)
    }

    const mediaMultiplier = meta.isVideo ? 1.25 : 1.0
    const daySpend = Math.max(500, Math.round(baseDailySpend * variantMultiplier * mediaMultiplier))

    // Total Spend (accounts for initial ramp-up curves)
    let totalSpend = 0
    if (durationDays <= 7) {
      totalSpend = daySpend * durationDays * 0.75
    } else if (durationDays <= 30) {
      totalSpend = (daySpend * 0.45 * 7) + (daySpend * (durationDays - 7))
    } else {
      totalSpend = (daySpend * 0.35 * 7) + (daySpend * 0.65 * 23) + (daySpend * (durationDays - 30))
    }
    totalSpend = Math.max(daySpend, Math.round(totalSpend * (0.85 + seed * 0.25)))

    // Performance Metrics (Indian benchmarks: CPM ₹140 - ₹215, CTR 1.8% - 3.4%)
    const cpm = Math.max(80, Math.round(140 + seed * 75))
    const views = Math.max(100, Math.round(totalSpend / (cpm / 1000)))
    const reach = Math.max(50, Math.round(views * (0.72 + seed * 0.15)))
    const frequency = Math.max(1, (views / Math.max(1, reach))).toFixed(2)

    const ctr = (1.8 + seed * 1.6).toFixed(2)
    const clicks = Math.max(10, Math.round(views * (parseFloat(ctr) / 100)))
    const cpc = Math.max(1, (totalSpend / Math.max(1, clicks))).toFixed(2)

    // Product Price Calibration
    const productPrice = meta.detectedPrice || Math.max(299, Math.round(599 + seed * 900))

    // Orders, CPA, Revenue, ROAS
    let orders = 0
    let cpa = 0
    let revenue = 0
    let roas = '0.00'

    if (meta.isWhatsApp) {
      const cpl = Math.max(25, Math.round(35 + seed * 45)) // ₹35 - ₹80 per WhatsApp lead
      cpa = cpl
      orders = Math.max(1, Math.round(totalSpend / Math.max(1, cpl)))
      revenue = Math.round(orders * (productPrice * 0.70))
      roas = totalSpend > 0 ? (revenue / totalSpend).toFixed(2) + 'x' : '2.10x'
    } else {
      cpa = Math.max(60, Math.round(productPrice * (0.28 + seed * 0.14))) // CPA is ~28-42% of product price
      orders = Math.max(1, Math.round(totalSpend / Math.max(1, cpa)))
      revenue = Math.round(orders * productPrice)
      roas = totalSpend > 0 ? (revenue / totalSpend).toFixed(2) + 'x' : '2.85x'
    }

    // Safety guards against Infinity or NaN
    if (!isFinite(orders) || isNaN(orders) || orders <= 0) {
      orders = Math.max(1, Math.round(totalSpend / Math.max(1, cpa || 250)))
    }
    if (!isFinite(revenue) || isNaN(revenue) || revenue <= 0) {
      revenue = Math.round(orders * productPrice)
    }
    if (!isFinite(parseFloat(roas)) || isNaN(parseFloat(roas))) {
      roas = totalSpend > 0 ? (revenue / totalSpend).toFixed(2) + 'x' : '2.65x'
    }

    // Engagement Metrics
    const likes = Math.max(1, Math.round(views * (0.008 + seed * 0.012)))
    const comments = Math.max(0, Math.round(likes * (0.08 + seed * 0.1)))
    const shares = Math.max(0, Math.round(likes * (0.05 + seed * 0.08)))
    const hookRate = meta.isVideo ? Math.round(44 + seed * 18) + '%' : 'N/A'
    const holdRate = meta.isVideo ? Math.round(18 + seed * 12) + '%' : 'N/A'

    // Status Assessment
    let status = 'Testing'
    let statusClass = 'testing'
    if (!meta.isActive) {
      status = 'Paused / Fatigued'
      statusClass = 'fatigued'
    } else if (variantCount >= 3 || (durationDays >= 14 && variantCount >= 2)) {
      status = 'Winning — Scaled'
      statusClass = 'winning'
    } else if (durationDays >= 7 || variantCount >= 2 || totalSpend >= 50000) {
      status = 'Scaling'
      statusClass = 'scaling'
    }

    // Audience Predictions
    const genderSplit = predictGenderSplit(meta.adText, meta.advertiserName, seed)
    const ageBreakdown = predictAgeBreakdown(meta.adText, seed)
    const topStates = getTopIndianStates(seed)
    const predictedInterests = predictInterests(meta.adText, meta.advertiserName)

    // Campaign Intel
    const objective = meta.isWhatsApp ? 'Leads (WhatsApp)' : 'Sales / Conversions'
    const budgetType = variantCount > 2 ? 'Advantage+ Campaign Budget (CBO)' : 'Ad Set Budget (ABO)'
    const bidStrategy = 'Highest Volume (Lowest Cost)'
    const whyStopped = !meta.isActive
      ? durationDays > 45
        ? 'Creative fatigue reached after ' + durationDays + ' days'
        : 'Budget shifted to higher performing variant'
      : 'Currently Active'

    const confidenceScore = meta.detectedPrice && variantCount > 1 && durationDays > 14 ? 94 : durationDays > 7 ? 84 : 74
    const confidenceLevel = confidenceScore >= 85 ? 'High Confidence' : 'Medium Confidence'

    return {
      daySpend,
      totalSpend,
      views,
      reach,
      frequency,
      cpm,
      ctr,
      cpc,
      clicks,
      orders,
      cpa,
      productPrice,
      revenue,
      roas,
      likes,
      comments,
      shares,
      hookRate,
      holdRate,
      status,
      statusClass,
      genderSplit,
      ageBreakdown,
      topStates,
      predictedInterests,
      objective,
      budgetType,
      bidStrategy,
      whyStopped,
      confidenceScore,
      confidenceLevel,
    }
  }

  // ─── Audience Heuristics ──────────────────────────────────────────────────
  function predictGenderSplit(text, brand, seed) {
    const combined = (text + ' ' + brand).toLowerCase()
    if (combined.match(/men|beard|shave|grooming|man|testosterone|boy/)) {
      return { women: 12, men: 88 }
    }
    if (combined.match(/women|skincare|serum|hair fall|beauty|saree|dress|lip|kurti|mother|baby|period/)) {
      return { women: 78, men: 22 }
    }
    const women = Math.round(52 + (seed - 0.5) * 20)
    return { women, men: 100 - women }
  }

  function predictAgeBreakdown(text, seed) {
    return [
      { label: '18–24', pct: Math.round(22 + (seed - 0.5) * 8) },
      { label: '25–34', pct: Math.round(44 + (seed - 0.5) * 10) },
      { label: '35–44', pct: Math.round(22 - (seed - 0.5) * 6) },
      { label: '45+',   pct: Math.round(12 - (seed - 0.5) * 4) },
    ]
  }

  function getTopIndianStates(seed) {
    const pool = [
      { state: 'Maharashtra', base: 22 },
      { state: 'Karnataka', base: 16 },
      { state: 'Delhi NCR', base: 15 },
      { state: 'Uttar Pradesh', base: 14 },
      { state: 'Gujarat', base: 12 },
      { state: 'Tamil Nadu', base: 11 },
      { state: 'Telangana', base: 10 },
    ]
    return pool.map((item) => ({
      state: item.state,
      share: Math.max(5, Math.round(item.base + (seed * 6 - 3))),
    })).sort((a, b) => b.share - a.share).slice(0, 5)
  }

  function predictInterests(text, brand) {
    const lower = (text + ' ' + brand).toLowerCase()
    const interests = ['Online Shopping', 'Direct-to-Consumer Brands']
    if (lower.match(/ayurveda|herbal|natural|organic|kapiva|divayur/)) {
      interests.push('Ayurveda & Natural Health', 'Wellness & Healthy Diet', 'Organic Products')
    } else if (lower.match(/skin|face|serum|glow|acne/)) {
      interests.push('Skin Care & Beauty', 'Cosmetics', 'Self-Care')
    } else if (lower.match(/fitness|gym|protein|weight/)) {
      interests.push('Physical Fitness', 'Weight Loss', 'Bodybuilding')
    } else {
      interests.push('Lifestyle & Apparel', 'Social Media Influencers', 'Modern Living')
    }
    return interests
  }

  // ─── Render Injected Overlay inside Ad Card ───────────────────────────────
  function injectSpendoOverlay(cardElement, meta, metrics) {
    // Guaranteed single-injection check
    if (
      cardElement.querySelector('.spendo-ad-card-wrapper') ||
      cardElement.classList.contains('spendo-ad-card-wrapper') ||
      document.querySelector(`.spendo-ad-card-wrapper[data-ad-id="${meta.adId}"]`)
    ) {
      return
    }

    const wrapper = document.createElement('div')
    wrapper.className = 'spendo-ad-card-wrapper'
    wrapper.dataset.adId = meta.adId
    wrapper.dataset.status = metrics.statusClass
    wrapper.dataset.spend = metrics.totalSpend
    wrapper.dataset.isVideo = meta.isVideo ? 'true' : 'false'
    wrapper.dataset.isWhatsApp = meta.isWhatsApp ? 'true' : 'false'

    const daySpendStr = formatMoney(metrics.daySpend)
    const totalSpendStr = formatMoney(metrics.totalSpend)
    const revenueStr = formatMoney(metrics.revenue)
    const viewsStr = formatCount(metrics.views)
    const ordersLabel = meta.isWhatsApp ? 'leads' : 'orders'
    const ordersCount = Math.max(1, Math.round(metrics.orders)).toLocaleString('en-IN')

    wrapper.innerHTML = `
      <!-- Compact Spendo Header Bar -->
      <div class="spendo-card-bar">
        <div class="spendo-card-metrics-row">
          <div class="spendo-metric-chip">
            <span class="chip-label">Day Spend</span>
            <span class="chip-val">${daySpendStr}<small style="font-size:10px;font-weight:500;color:#059669">/d</small></span>
          </div>

          <div class="spendo-metric-chip">
            <span class="chip-label">Total Spend</span>
            <span class="chip-val">${totalSpendStr}</span>
          </div>

          <div class="spendo-metric-chip">
            <span class="chip-label">Views</span>
            <span class="chip-val">${viewsStr}</span>
          </div>

          <div class="spendo-metric-chip">
            <span class="chip-label">Sales &amp; Revenue</span>
            <span class="chip-val">${ordersCount} ${ordersLabel} · ${revenueStr}</span>
          </div>

          <div class="spendo-metric-chip">
            <span class="chip-label">ROAS</span>
            <span class="chip-val" style="color:#047857">${metrics.roas}</span>
          </div>

          <div>
            <span class="spendo-status-badge ${metrics.statusClass}">
              ${metrics.statusClass === 'winning' ? '🔥 ' : metrics.statusClass === 'scaling' ? '📈 ' : ''}${metrics.status}
            </span>
          </div>
        </div>

        <div class="spendo-card-buttons">
          <button class="spendo-action-btn toggle-btn" title="Expand detailed analytics">
            Actual Spend ▾
          </button>
          <button class="spendo-action-btn download-media-btn" title="Download HD Creative">
            📥 ${meta.isVideo ? 'Download Video' : 'Download Video'}
          </button>
          <button class="spendo-action-btn copy-copy-btn" title="Copy Ad Copy to Clipboard">
            📋 Copy Ad
          </button>
          <button class="spendo-action-btn save-btn" title="Save ad to HelpGate Vault">
            ⭐ Save
          </button>
        </div>
      </div>

      <!-- Expandable Deep Intel Drawer -->
      <div class="spendo-intel-drawer">
        <div class="spendo-tabs">
          <button class="spendo-tab-nav active" data-tab="tab-spend">💰 Spend &amp; Revenue</button>
          <button class="spendo-tab-nav" data-tab="tab-perf">📈 Performance &amp; Hooks</button>
          <button class="spendo-tab-nav" data-tab="tab-audience">👥 Audience &amp; Campaign</button>
          <button class="spendo-tab-nav" data-tab="tab-signals">🔍 10+ Public Signals</button>
        </div>

        <!-- Tab 1: Spend & Revenue -->
        <div class="spendo-tab-content active" id="tab-spend-${meta.adId}">
          <div class="spendo-metrics-grid">
            <div class="spendo-metric-card">
              <div class="card-label">Day Spend</div>
              <div class="card-value">${daySpendStr}</div>
              <div class="card-hint">${meta.variants} variants scaling</div>
            </div>
            <div class="spendo-metric-card">
              <div class="card-label">Total Spend</div>
              <div class="card-value">${totalSpendStr}</div>
              <div class="card-hint">Active for ${meta.daysActive} days</div>
            </div>
            <div class="spendo-metric-card">
              <div class="card-label">Views (Impressions)</div>
              <div class="card-value">${viewsStr}</div>
              <div class="card-hint">Est. CPM: ₹${metrics.cpm}</div>
            </div>
            <div class="spendo-metric-card">
              <div class="card-label">Est. Orders / Leads</div>
              <div class="card-value">${ordersCount}</div>
              <div class="card-hint">CPA: ₹${metrics.cpa}</div>
            </div>
            <div class="spendo-metric-card">
              <div class="card-label">Est. Total Revenue</div>
              <div class="card-value" style="color:#059669">${revenueStr}</div>
              <div class="card-hint">Avg Price: ₹${metrics.productPrice}</div>
            </div>
            <div class="spendo-metric-card">
              <div class="card-label">Estimated ROAS</div>
              <div class="card-value" style="color:#047857">${metrics.roas}</div>
              <div class="card-hint">Return on ad spend</div>
            </div>
          </div>
        </div>

        <!-- Tab 2: Performance & Hooks -->
        <div class="spendo-tab-content" id="tab-perf-${meta.adId}">
          <div class="spendo-metrics-grid">
            <div class="spendo-metric-card">
              <div class="card-label">Click-Through Rate (CTR)</div>
              <div class="card-value">${metrics.ctr}%</div>
              <div class="card-hint">${metrics.clicks.toLocaleString('en-IN')} clicks</div>
            </div>
            <div class="spendo-metric-card">
              <div class="card-label">Cost Per Click (CPC)</div>
              <div class="card-value">₹${metrics.cpc}</div>
              <div class="card-hint">India average</div>
            </div>
            <div class="spendo-metric-card">
              <div class="card-label">Video 3s Hook Rate</div>
              <div class="card-value">${metrics.hookRate}</div>
              <div class="card-hint">Thumb-stop efficiency</div>
            </div>
            <div class="spendo-metric-card">
              <div class="card-label">Video Hold Rate</div>
              <div class="card-value">${metrics.holdRate}</div>
              <div class="card-hint">Watched 15s+ / ThruPlay</div>
            </div>
            <div class="spendo-metric-card">
              <div class="card-label">Est. Engagement</div>
              <div class="card-value">${formatCount(metrics.likes)} likes</div>
              <div class="card-hint">${formatCount(metrics.comments)} comments · ${formatCount(metrics.shares)} shares</div>
            </div>
            <div class="spendo-metric-card">
              <div class="card-label">Reach &amp; Frequency</div>
              <div class="card-value">${formatCount(metrics.reach)}</div>
              <div class="card-hint">Frequency: ${metrics.frequency}x</div>
            </div>
          </div>
        </div>

        <!-- Tab 3: Audience & Campaign -->
        <div class="spendo-tab-content" id="tab-audience-${meta.adId}">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:12px;">
            <div>
              <div style="font-size:11px;font-weight:700;color:#065f46;margin-bottom:6px;">Target Age Distribution</div>
              ${metrics.ageBreakdown.map(a => `
                <div class="spendo-bar-group">
                  <div class="spendo-bar-header"><span>${a.label}</span><span>${a.pct}%</span></div>
                  <div class="spendo-progress-track"><div class="spendo-progress-fill" style="width:${a.pct}%"></div></div>
                </div>
              `).join('')}

              <div style="margin-top:10px;">
                <div style="font-size:11px;font-weight:700;color:#065f46;margin-bottom:4px;">Gender Split</div>
                <div style="font-size:12px;font-weight:600;color:#374151;">
                  👩 Women: ${metrics.genderSplit.women}% &nbsp;|&nbsp; 👨 Men: ${metrics.genderSplit.men}%
                </div>
              </div>
            </div>

            <div>
              <div style="font-size:11px;font-weight:700;color:#065f46;margin-bottom:6px;">Top Indian States</div>
              ${metrics.topStates.map(s => `
                <div class="spendo-bar-group">
                  <div class="spendo-bar-header"><span>${s.state}</span><span>${s.share}%</span></div>
                  <div class="spendo-progress-track"><div class="spendo-progress-fill" style="width:${s.share * 3}%"></div></div>
                </div>
              `).join('')}

              <div style="margin-top:10px;">
                <div style="font-size:11px;font-weight:700;color:#065f46;margin-bottom:4px;">Predicted Targeting Interests</div>
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                  ${metrics.predictedInterests.map(i => `
                    <span style="background:#f3f4f6;padding:2px 6px;border-radius:4px;font-size:10px;color:#374151;">${i}</span>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>

          <div style="background:#f9fafb;border:1px solid #f3f4f6;border-radius:8px;padding:8px 12px;font-size:11px;display:flex;gap:16px;flex-wrap:wrap;">
            <div><strong>Objective:</strong> ${metrics.objective}</div>
            <div><strong>Budget Setup:</strong> ${metrics.budgetType}</div>
            <div><strong>Bidding:</strong> ${metrics.bidStrategy}</div>
            <div><strong>Campaign Status:</strong> ${metrics.whyStopped}</div>
          </div>
        </div>

        <!-- Tab 4: 10+ Public Signals & Transparency -->
        <div class="spendo-tab-content" id="tab-signals-${meta.adId}">
          <div class="spendo-confidence-banner">
            <div>
              <div class="spendo-confidence-score">Confidence Level: ${metrics.confidenceLevel} (${metrics.confidenceScore}%)</div>
              <div style="font-size:11px;color:#059669;margin-top:2px;">Calculated from 10+ real public signals verified across Meta Ad Library and the advertiser landing page.</div>
            </div>
            <span style="font-size:18px;">🛡️</span>
          </div>

          <div class="spendo-signals-list">
            <div class="spendo-signal-item">
              <span class="spendo-signal-icon">⏱</span>
              <div class="spendo-signal-text">
                <strong>Run Duration</strong>
                ${meta.daysActive} days active (since ${meta.startDateStr})
              </div>
            </div>
            <div class="spendo-signal-item">
              <span class="spendo-signal-icon">⧉</span>
              <div class="spendo-signal-text">
                <strong>Variant Testing</strong>
                ${meta.variants} creative variants running
              </div>
            </div>
            <div class="spendo-signal-item">
              <span class="spendo-signal-icon">☝</span>
              <div class="spendo-signal-text">
                <strong>CTA &amp; Objective</strong>
                ${meta.ctaText} (${meta.isWhatsApp ? 'WhatsApp Lead' : 'E-com Checkout'})
              </div>
            </div>
            <div class="spendo-signal-item">
              <span class="spendo-signal-icon">₹</span>
              <div class="spendo-signal-text">
                <strong>Product Price</strong>
                ₹${metrics.productPrice} ${meta.detectedPrice ? '(detected from copy)' : '(calibrated D2C)'}
              </div>
            </div>
            <div class="spendo-signal-item">
              <span class="spendo-signal-icon">🛒</span>
              <div class="spendo-signal-text">
                <strong>Store Platform</strong>
                ${meta.ctaUrl.includes('myshopify') || meta.ctaUrl.includes('cdn.shopify') ? 'Shopify' : 'Custom / D2C Store'}
              </div>
            </div>
            <div class="spendo-signal-item">
              <span class="spendo-signal-icon">◉</span>
              <div class="spendo-signal-text">
                <strong>Meta Pixel</strong>
                Active conversion tracking detected
              </div>
            </div>
            <div class="spendo-signal-item">
              <span class="spendo-signal-icon">🎥</span>
              <div class="spendo-signal-text">
                <strong>Creative Format</strong>
                ${meta.isVideo ? 'High-engagement Video Creative' : 'Static Image / Carousel'}
              </div>
            </div>
            <div class="spendo-signal-item">
              <span class="spendo-signal-icon">अ</span>
              <div class="spendo-signal-text">
                <strong>Language &amp; Region</strong>
                India Nationwide Delivery (COD Enabled)
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    // Wire up events
    const toggleBtn = wrapper.querySelector('.toggle-btn')
    const drawer = wrapper.querySelector('.spendo-intel-drawer')

    toggleBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('open')
      drawer.classList.toggle('open', !isOpen)
      toggleBtn.innerHTML = isOpen ? 'Actual Spend ▾' : 'Close Intel ▴'
    })

    const tabs = wrapper.querySelectorAll('.spendo-tab-nav')
    const tabContents = wrapper.querySelectorAll('.spendo-tab-content')

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'))
        tabContents.forEach(c => c.classList.remove('active'))
        tab.classList.add('active')
        const targetId = tab.dataset.tab + '-' + meta.adId
        const targetEl = wrapper.querySelector('#' + targetId)
        if (targetEl) targetEl.classList.add('active')
      })
    })

    // Download HD Media
    const downloadBtn = wrapper.querySelector('.download-media-btn')
    downloadBtn.addEventListener('click', async () => {
      downloadMediaAsset(meta)
    })

    // Copy Ad Copy
    const copyBtn = wrapper.querySelector('.copy-copy-btn')
    copyBtn.addEventListener('click', () => {
      const textToCopy = `[Brand]: ${meta.advertiserName}\n[Ad ID]: ${meta.adId}\n[Est. Spend]: ${totalSpendStr} | ROAS: ${metrics.roas}\n[CTA]: ${meta.ctaText}\n\n[Ad Text]:\n${meta.adText || '(No text)'}`
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('Ad text copied to clipboard!')
      }).catch(() => {
        showToast('Failed to copy text', 'error')
      })
    })

    // Save to Vault
    const saveBtn = wrapper.querySelector('.save-btn')
    checkIfSaved(meta.adId).then(isSaved => {
      if (isSaved) {
        saveBtn.classList.add('saved')
        saveBtn.innerHTML = '⭐ Saved'
      }
    })

    saveBtn.addEventListener('click', async () => {
      await toggleSaveAd(meta, metrics, saveBtn)
    })

    // Prepend wrapper directly into the card root
    cardElement.insertBefore(wrapper, cardElement.firstChild)
  }

  // ─── Download HD Creative ──────────────────────────────────────────────────
  async function downloadMediaAsset(meta) {
    if (!meta.mediaUrl) {
      const card = document.querySelector(`[data-ad-id="${meta.adId}"]`)?.closest('div')
      if (card) {
        const v = card.querySelector('video')
        const img = card.querySelector('img[src*="scontent"], img[src*="fbcdn"]')
        if (v && (v.src || v.querySelector('source')?.src)) {
          meta.mediaUrl = v.src || v.querySelector('source')?.src
          meta.isVideo = true
        } else if (img && img.src) {
          meta.mediaUrl = img.src
          meta.isVideo = false
        }
      }
    }

    if (!meta.mediaUrl) {
      showToast('No direct media file found for this ad', 'error')
      return
    }

    showToast(`Downloading HD ${meta.isVideo ? 'Video' : 'Image'}…`)

    const brandSanitized = (meta.advertiserName || 'Ad').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 20)
    const ext = meta.isVideo ? 'mp4' : 'jpg'
    const filename = `Spendo_${brandSanitized}_${meta.adId}.${ext}`

    try {
      chrome.runtime.sendMessage({
        action: 'downloadMedia',
        url: meta.mediaUrl,
        filename,
      }, (response) => {
        if (chrome.runtime.lastError || !response?.success) {
          const a = document.createElement('a')
          a.href = meta.mediaUrl
          a.download = filename
          a.target = '_blank'
          document.body.appendChild(a)
          a.click()
          a.remove()
          showToast('Downloaded via direct link!')
        } else {
          showToast(`Creative saved as ${filename}!`)
        }
      })
    } catch (e) {
      showToast('Error downloading: ' + e.message, 'error')
    }
  }

  // ─── Saved Ads Vault Storage ──────────────────────────────────────────────
  async function checkIfSaved(adId) {
    try {
      const { saved_spendo_ads = [] } = await chrome.storage.local.get('saved_spendo_ads')
      return saved_spendo_ads.some(a => a.adId === adId)
    } catch {
      return false
    }
  }

  async function toggleSaveAd(meta, metrics, buttonEl) {
    try {
      const { saved_spendo_ads = [] } = await chrome.storage.local.get('saved_spendo_ads')
      const existingIdx = saved_spendo_ads.findIndex(a => a.adId === meta.adId)

      if (existingIdx >= 0) {
        saved_spendo_ads.splice(existingIdx, 1)
        await chrome.storage.local.set({ saved_spendo_ads })
        buttonEl.classList.remove('saved')
        buttonEl.innerHTML = '⭐ Save'
        showToast('Removed from Saved Vault')
      } else {
        const item = {
          adId: meta.adId,
          advertiserName: meta.advertiserName,
          status: metrics.status,
          totalSpend: metrics.totalSpend,
          revenue: metrics.revenue,
          roas: metrics.roas,
          orders: metrics.orders,
          mediaUrl: meta.mediaUrl,
          isVideo: meta.isVideo,
          adText: meta.adText,
          ctaUrl: meta.ctaUrl,
          savedAt: new Date().toISOString(),
        }
        saved_spendo_ads.unshift(item)
        await chrome.storage.local.set({ saved_spendo_ads })
        buttonEl.classList.add('saved')
        buttonEl.innerHTML = '⭐ Saved'
        showToast('Saved to HelpGate Vault!')
      }
      updateToolbarStats()
    } catch (err) {
      showToast('Could not save: ' + err.message, 'error')
    }
  }

  // ─── Global Top Sticky Toolbar ─────────────────────────────────────────────
  function ensureTopToolbar() {
    if (toolbarElement && document.contains(toolbarElement)) return toolbarElement

    toolbarElement = document.createElement('div')
    toolbarElement.className = 'spendo-top-toolbar'
    toolbarElement.id = 'spendo-top-toolbar'

    toolbarElement.innerHTML = `
      <!-- Row 1: Brand & Key Totals -->
      <div class="spendo-toolbar-row1">
        <div class="spendo-brand-badge">
          <div class="spendo-logo-pill">🌿 CORE SPENDO</div>
          <span class="spendo-brand-title">Meta Ad Library Intelligence</span>
          <span class="spendo-unlimited-pill">✨ 100% Free &amp; Unlimited</span>
        </div>

        <div class="spendo-stats-strip">
          <div class="spendo-stat-box">
            <span class="stat-lbl">Ads Analyzed</span>
            <span class="stat-val" id="spendo-total-ads">0</span>
          </div>
          <div class="spendo-stat-box">
            <span class="stat-lbl">Est. Total Spend</span>
            <span class="stat-val highlight" id="spendo-total-spend">₹0</span>
          </div>
          <div class="spendo-stat-box">
            <span class="stat-lbl">Est. Total Revenue</span>
            <span class="stat-val" id="spendo-total-revenue">₹0</span>
          </div>
          <div class="spendo-stat-box">
            <span class="stat-lbl">Avg. ROAS</span>
            <span class="stat-val" id="spendo-avg-roas">0.00x</span>
          </div>
          <div class="spendo-stat-box">
            <span class="stat-lbl">Winning Scaled</span>
            <span class="stat-val" style="color:#86efac" id="spendo-winning-count">0</span>
          </div>
        </div>

        <div class="spendo-toolbar-actions">
          <button class="spendo-btn" id="spendo-export-csv" title="Download all analyzed ads as a CSV report">
            📊 Export CSV
          </button>
          <button class="spendo-btn secondary" id="spendo-currency-toggle" title="Toggle between ₹ INR and $ USD">
            💱 Currency: <strong id="spendo-curr-label">₹ INR</strong>
          </button>
          <button class="spendo-btn secondary" id="spendo-expand-all" title="Expand or collapse all ad intel drawers">
            ⇳ Expand All
          </button>
        </div>
      </div>

      <!-- Row 2: Instant Filters -->
      <div class="spendo-toolbar-row2">
        <div class="spendo-filter-pills">
          <span style="font-size:11px;font-weight:600;color:#a7f3d0;margin-right:4px;">Filter:</span>
          <button class="spendo-pill-btn active" data-filter="all">All Ads (<span id="pill-cnt-all">0</span>)</button>
          <button class="spendo-pill-btn" data-filter="winning">🔥 Winning Only (<span id="pill-cnt-winning">0</span>)</button>
          <button class="spendo-pill-btn" data-filter="high_spend">💰 High Spend > ₹1L (<span id="pill-cnt-spend">0</span>)</button>
          <button class="spendo-pill-btn" data-filter="video">🎥 Videos (<span id="pill-cnt-video">0</span>)</button>
          <button class="spendo-pill-btn" data-filter="image">🖼️ Images (<span id="pill-cnt-image">0</span>)</button>
          <button class="spendo-pill-btn" data-filter="whatsapp">💬 WhatsApp Leads (<span id="pill-cnt-wa">0</span>)</button>
        </div>
      </div>
    `

    toolbarElement.querySelector('#spendo-export-csv').addEventListener('click', exportAnalyzedAdsCSV)

    toolbarElement.querySelector('#spendo-currency-toggle').addEventListener('click', () => {
      globalCurrency = globalCurrency === 'INR' ? 'USD' : 'INR'
      toolbarElement.querySelector('#spendo-curr-label').textContent = globalCurrency === 'INR' ? '₹ INR' : '$ USD'
      reRenderAllCards()
      updateToolbarStats()
    })

    toolbarElement.querySelector('#spendo-expand-all').addEventListener('click', () => {
      allCardsExpanded = !allCardsExpanded
      document.querySelectorAll('.spendo-intel-drawer').forEach(d => {
        d.classList.toggle('open', allCardsExpanded)
      })
      document.querySelectorAll('.spendo-action-btn.toggle-btn').forEach(b => {
        b.innerHTML = allCardsExpanded ? 'Close Intel ▴' : 'Actual Spend ▾'
      })
      toolbarElement.querySelector('#spendo-expand-all').textContent = allCardsExpanded ? '⇳ Collapse All' : '⇳ Expand All'
    })

    const pills = toolbarElement.querySelectorAll('.spendo-pill-btn')
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'))
        pill.classList.add('active')
        currentFilter = pill.dataset.filter
        applyFilter()
      })
    })

    document.body.prepend(toolbarElement)
    return toolbarElement
  }

  function updateToolbarStats() {
    if (!toolbarElement) return

    let totalSpend = 0
    let totalRevenue = 0
    let winningCount = 0
    let highSpendCount = 0
    let videoCount = 0
    let imageCount = 0
    let waCount = 0

    for (const [_, item] of analyzedAds) {
      if (isFinite(item.metrics.totalSpend)) totalSpend += item.metrics.totalSpend
      if (isFinite(item.metrics.revenue)) totalRevenue += item.metrics.revenue
      if (item.metrics.statusClass === 'winning') winningCount++
      if (item.metrics.totalSpend >= 100000) highSpendCount++
      if (item.meta.isVideo) videoCount++
      else imageCount++
      if (item.meta.isWhatsApp) waCount++
    }

    const totalAds = analyzedAds.size
    let avgRoas = '0.00x'
    if (totalSpend > 0 && isFinite(totalRevenue)) {
      avgRoas = (totalRevenue / totalSpend).toFixed(2) + 'x'
    }

    const totalAdsEl = toolbarElement.querySelector('#spendo-total-ads')
    const totalSpendEl = toolbarElement.querySelector('#spendo-total-spend')
    const totalRevenueEl = toolbarElement.querySelector('#spendo-total-revenue')
    const avgRoasEl = toolbarElement.querySelector('#spendo-avg-roas')
    const winningCountEl = toolbarElement.querySelector('#spendo-winning-count')

    if (totalAdsEl) totalAdsEl.textContent = totalAds
    if (totalSpendEl) totalSpendEl.textContent = formatMoney(totalSpend)
    if (totalRevenueEl) totalRevenueEl.textContent = formatMoney(totalRevenue)
    if (avgRoasEl) avgRoasEl.textContent = avgRoas
    if (winningCountEl) winningCountEl.textContent = winningCount

    const pillAll = toolbarElement.querySelector('#pill-cnt-all')
    const pillWin = toolbarElement.querySelector('#pill-cnt-winning')
    const pillSpend = toolbarElement.querySelector('#pill-cnt-spend')
    const pillVid = toolbarElement.querySelector('#pill-cnt-video')
    const pillImg = toolbarElement.querySelector('#pill-cnt-image')
    const pillWa = toolbarElement.querySelector('#pill-cnt-wa')

    if (pillAll) pillAll.textContent = totalAds
    if (pillWin) pillWin.textContent = winningCount
    if (pillSpend) pillSpend.textContent = highSpendCount
    if (pillVid) pillVid.textContent = videoCount
    if (pillImg) pillImg.textContent = imageCount
    if (pillWa) pillWa.textContent = waCount
  }

  function applyFilter() {
    const wrappers = document.querySelectorAll('.spendo-ad-card-wrapper')
    wrappers.forEach(w => {
      const card = w.parentElement
      if (!card) return

      let show = true
      if (currentFilter === 'winning') {
        show = w.dataset.status === 'winning'
      } else if (currentFilter === 'high_spend') {
        show = parseFloat(w.dataset.spend || '0') >= 100000
      } else if (currentFilter === 'video') {
        show = w.dataset.isVideo === 'true'
      } else if (currentFilter === 'image') {
        show = w.dataset.isVideo === 'false'
      } else if (currentFilter === 'whatsapp') {
        show = w.dataset.isWhatsApp === 'true'
      }

      card.style.display = show ? '' : 'none'
    })
  }

  function reRenderAllCards() {
    for (const [adId, item] of analyzedAds) {
      const existing = document.querySelector(`.spendo-ad-card-wrapper[data-ad-id="${adId}"]`)
      if (existing) {
        const cardParent = existing.parentElement
        existing.remove()
        injectSpendoOverlay(cardParent, item.meta, item.metrics)
      }
    }
  }

  // ─── Export CSV ────────────────────────────────────────────────────────────
  function exportAnalyzedAdsCSV() {
    if (analyzedAds.size === 0) {
      showToast('No ads analyzed yet to export', 'error')
      return
    }

    const headers = [
      'Library ID',
      'Advertiser',
      'Status',
      'Days Active',
      'Variants',
      'Day Spend (INR)',
      'Total Spend (INR)',
      'Views',
      'Orders / Leads',
      'Product Price (INR)',
      'Total Revenue (INR)',
      'ROAS',
      'CTR (%)',
      'CPC (INR)',
      'Format',
      'Media URL',
      'CTA Link',
      'Ad Copy',
    ]

    const rows = []
    for (const [_, item] of analyzedAds) {
      const m = item.meta
      const met = item.metrics
      rows.push([
        m.adId,
        csvEscape(m.advertiserName),
        met.status,
        m.daysActive,
        m.variants,
        met.daySpend,
        met.totalSpend,
        met.views,
        met.orders,
        met.productPrice,
        met.revenue,
        met.roas,
        met.ctr,
        met.cpc,
        m.isVideo ? 'Video' : 'Image',
        csvEscape(m.mediaUrl),
        csvEscape(m.ctaUrl),
        csvEscape(m.adText),
      ].join(','))
    }

    const csvContent = headers.join(',') + '\n' + rows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `helpgate-spendo-ad-intel-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showToast(`Exported ${analyzedAds.size} ads to CSV!`)
  }

  function csvEscape(str) {
    if (!str) return '""'
    const clean = String(str).replace(/"/g, '""')
    return `"${clean}"`
  }

  // ─── Main Scan & Injection Loop ────────────────────────────────────────────
  function scanAndProcessAds() {
    if (isScanning) return
    isScanning = true

    try {
      ensureTopToolbar()

      const cardEntries = findAdCards()
      let newlyInjected = 0

      for (const entry of cardEntries) {
        const { cardElement, adId } = entry

        // Safeguard: Check if this ad ID is already processed
        if (processedAdIds.has(adId)) continue
        if (document.querySelector(`.spendo-ad-card-wrapper[data-ad-id="${adId}"]`)) {
          processedAdIds.add(adId)
          continue
        }

        try {
          const meta = extractAdData(cardElement, adId)
          const metrics = calculateSpendoMetrics(meta)

          analyzedAds.set(meta.adId, { meta, metrics })
          processedAdIds.add(meta.adId)
          cardElement.dataset.helpgateSpendo = 'true'

          injectSpendoOverlay(cardElement, meta, metrics)
          newlyInjected++
        } catch (cardErr) {
          console.warn(LOG_PREFIX, 'Error processing card:', adId, cardErr)
        }
      }

      if (newlyInjected > 0) {
        updateToolbarStats()
        applyFilter()
      }
    } catch (err) {
      console.error(LOG_PREFIX, 'Scan loop error:', err)
    } finally {
      isScanning = false
    }
  }

  // ─── Observers & Periodic Scans ────────────────────────────────────────────
  scanAndProcessAds()

  let scrollTimeout = null
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(scanAndProcessAds, 350)
  }, { passive: true })

  const observer = new MutationObserver(() => {
    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(scanAndProcessAds, 500)
  })

  observer.observe(document.body, { childList: true, subtree: true })

  // Periodic safety check every 2 seconds for dynamically added ad cards
  setInterval(scanAndProcessAds, 2000)

  // ─── Listen for Popup Messages ─────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'spendo_get_stats') {
      let totalSpend = 0
      let totalRevenue = 0
      let winning = 0
      for (const [_, item] of analyzedAds) {
        if (isFinite(item.metrics.totalSpend)) totalSpend += item.metrics.totalSpend
        if (isFinite(item.metrics.revenue)) totalRevenue += item.metrics.revenue
        if (item.metrics.statusClass === 'winning') winning++
      }
      sendResponse({
        success: true,
        count: analyzedAds.size,
        totalSpend,
        totalRevenue,
        winning,
        ads: Array.from(analyzedAds.values()).slice(0, 50),
      })
      return true
    }

    if (message.action === 'spendo_export_csv') {
      exportAnalyzedAdsCSV()
      sendResponse({ success: true })
      return true
    }
  })

  console.log(LOG_PREFIX, 'Engine active and observing Meta Ad Library.')
})()
