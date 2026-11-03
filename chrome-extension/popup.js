// HelpGate Extension - Popup Script
// Manages Spendo Ad Intel, WhatsApp Web tools, and HelpGate utilities
// 100% Free Forever — Zero Logins, Zero Cloud Sync, Pure Client-Side Privacy

document.addEventListener('DOMContentLoaded', async () => {
  const $ = (id) => document.getElementById(id)
  const statusDot = $('statusDot')
  const statusText = $('statusText')
  const versionLabel = $('versionLabel')
  const toast = $('toast')

  const manifest = chrome.runtime.getManifest()
  versionLabel.textContent = `HelpGate Tools v${manifest.version}`

  // ─── Toast Notification ────────────────────────────────────────────────────
  let toastTimer = null
  function showToast(message, type = 'info') {
    clearTimeout(toastTimer)
    toast.textContent = message
    toast.className = 'toast show' + (type === 'error' ? ' error' : type === 'success' ? ' success' : '')
    const delay = type === 'error' ? 4500 : 3000
    toastTimer = setTimeout(() => { toast.className = 'toast' }, delay)
  }

  // ─── Button Loading State ──────────────────────────────────────────────────
  function setLoading(btn, loading) {
    if (!btn) return
    btn.disabled = loading
    btn.classList.toggle('loading', loading)
  }

  // ─── Tab Switching ─────────────────────────────────────────────────────────
  const tabButtons = document.querySelectorAll('.nav-tab-btn')
  const panes = {
    'tab-spendo': $('pane-spendo'),
    'tab-wa': $('pane-wa'),
    'tab-tools': $('pane-tools'),
  }

  function switchTab(tabKey) {
    tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabKey))
    Object.entries(panes).forEach(([k, pane]) => {
      if (pane) pane.classList.toggle('active', k === tabKey)
    })
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab))
  })

  // ─── Active Tab Inspection ─────────────────────────────────────────────────
  let currentTab = null
  let isOnWhatsApp = false
  let isOnMetaAds = false

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    currentTab = tab
    const url = tab?.url || ''

    isOnWhatsApp = url.includes('web.whatsapp.com')
    isOnMetaAds = url.includes('facebook.com/ads/library')

    if (isOnMetaAds) {
      statusDot.className = 'status-dot'
      statusText.textContent = 'Active on Meta Ads Library (Spendo Mode)'
      switchTab('tab-spendo')
      fetchMetaAdsStats(tab.id)
    } else if (isOnWhatsApp) {
      statusDot.className = 'status-dot'
      statusText.textContent = 'Active on WhatsApp Web'
      switchTab('tab-wa')
    } else {
      statusDot.className = 'status-dot inactive'
      statusText.textContent = 'Ready — Open Meta Ads or WhatsApp Web'
    }
  } catch (err) {
    console.error('[HelpGate Popup] Tab query error:', err)
    statusDot.className = 'status-dot error'
    statusText.textContent = 'Ready (Standalone Mode)'
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── TAB 1: SPENDO AD INTEL SUITE ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════

  function formatMoneyINR(num) {
    if (num >= 10000000) return '₹' + (num / 10000000).toFixed(2) + ' Cr'
    if (num >= 100000) return '₹' + (num / 100000).toFixed(2) + ' L'
    if (num >= 1000) return '₹' + (num / 1000).toFixed(1) + ' K'
    return '₹' + Math.round(num)
  }

  async function fetchMetaAdsStats(tabId) {
    try {
      chrome.tabs.sendMessage(tabId, { action: 'spendo_get_stats' }, (res) => {
        if (chrome.runtime.lastError || !res?.success) return
        $('spendoAdsCount').textContent = res.count || 0
        $('spendoTotalSpend').textContent = formatMoneyINR(res.totalSpend || 0)
        $('spendoWinningCount').textContent = res.winning || 0
      })
    } catch { /* Content script still loading */ }
  }

  // Open Meta Ads Library
  $('openMetaAds').addEventListener('click', () => {
    chrome.tabs.create({
      url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=IN&media_type=all',
    })
    window.close()
  })

  // Export CSV
  $('exportSpendoCSV').addEventListener('click', async () => {
    if (isOnMetaAds && currentTab?.id) {
      chrome.tabs.sendMessage(currentTab.id, { action: 'spendo_export_csv' }, (res) => {
        if (chrome.runtime.lastError || !res?.success) {
          exportVaultCSV()
        } else {
          showToast('CSV export downloaded!', 'success')
        }
      })
    } else {
      exportVaultCSV()
    }
  })

  // Saved Vault Management
  const toggleVaultBtn = $('toggleVaultBtn')
  const vaultContainer = $('vaultContainer')
  const vaultList = $('vaultList')
  const vaultCount = $('vaultCount')

  async function loadVault() {
    try {
      const { saved_spendo_ads = [] } = await chrome.storage.local.get('saved_spendo_ads')
      vaultCount.textContent = saved_spendo_ads.length

      if (saved_spendo_ads.length === 0) {
        vaultList.innerHTML = `<div style="color:#71717a;font-size:11px;text-align:center;padding:12px;">No saved ads yet. Click ⭐ Save on any ad card in Meta Ad Library.</div>`
        return
      }

      vaultList.innerHTML = saved_spendo_ads.map(ad => `
        <div class="vault-item">
          <div>
            <div class="vault-item-title">${escapeHTML(ad.advertiserName || 'Ad')} (${ad.adId})</div>
            <div class="vault-item-sub">Spend: ${formatMoneyINR(ad.totalSpend || 0)} · ROAS: ${ad.roas || 'N/A'} · ${ad.status || ''}</div>
          </div>
          <div style="display:flex;gap:6px;align-items:center;">
            ${ad.mediaUrl ? `<a href="${ad.mediaUrl}" target="_blank" style="font-size:10px;color:#38bdf8;text-decoration:none;">🔗 Media</a>` : ''}
            <button class="vault-del-btn" data-id="${ad.adId}" title="Delete">✕</button>
          </div>
        </div>
      `).join('')

      vaultList.querySelectorAll('.vault-del-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id
          const { saved_spendo_ads = [] } = await chrome.storage.local.get('saved_spendo_ads')
          const updated = saved_spendo_ads.filter(a => a.adId !== id)
          await chrome.storage.local.set({ saved_spendo_ads: updated })
          loadVault()
          showToast('Removed from vault')
        })
      })
    } catch (e) {
      console.error(e)
    }
  }

  loadVault()

  toggleVaultBtn.addEventListener('click', () => {
    const isHidden = vaultContainer.style.display === 'none'
    vaultContainer.style.display = isHidden ? 'block' : 'none'
    if (isHidden) loadVault()
  })

  $('clearVaultBtn').addEventListener('click', async () => {
    if (confirm('Clear all saved competitor ads from vault?')) {
      await chrome.storage.local.set({ saved_spendo_ads: [] })
      loadVault()
      showToast('Vault cleared')
    }
  })

  async function exportVaultCSV() {
    const { saved_spendo_ads = [] } = await chrome.storage.local.get('saved_spendo_ads')
    if (saved_spendo_ads.length === 0) {
      showToast('No saved ads in vault to export. Open Meta Ads to inspect ads.', 'error')
      return
    }

    const headers = 'Ad ID,Brand,Status,Spend (INR),Revenue (INR),ROAS,Orders,Format,Media URL,CTA Link,Saved At'
    const rows = saved_spendo_ads.map(a =>
      `"${a.adId}","${(a.advertiserName || '').replace(/"/g, '""')}","${a.status || ''}",${a.totalSpend || 0},${a.revenue || 0},"${a.roas || ''}",${a.orders || 0},"${a.isVideo ? 'Video' : 'Image'}","${a.mediaUrl || ''}","${a.ctaUrl || ''}","${a.savedAt || ''}"`
    )
    const csv = headers + '\n' + rows.join('\n')

    await chrome.runtime.sendMessage({
      action: 'downloadCSV',
      csv,
      filename: `helpgate-saved-ads-${new Date().toISOString().slice(0, 10)}.csv`,
    })
    showToast(`Exported ${saved_spendo_ads.length} saved ads to CSV!`, 'success')
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]))
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── TAB 2: WHATSAPP SUITE ─────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════

  const waExtractQuickBtn = $('waExtractQuick')
  const waExtractFullBtn = $('waExtractFull')
  const waProgress = $('waProgress')
  const waProgressFill = $('waProgressFill')
  const waProgressText = $('waProgressText')
  const waStats = $('waStats')
  const statTotal = $('statTotal')
  const statWithPhone = $('statWithPhone')
  const copyNumbersBtn = $('copyNumbersBtn')
  const directPhoneInput = $('directPhoneInput')
  const directMsgInput = $('directMsgInput')
  const directChatBtn = $('directChatBtn')

  let lastExtractResult = null

  try {
    const saved = await chrome.storage.local.get(['waExtractResult', 'waStats'])
    if (saved.waExtractResult) {
      lastExtractResult = saved.waExtractResult
      if (saved.waStats) {
        showWaStats(saved.waStats.total, saved.waStats.withPhone)
      }
    }
  } catch (e) { /* storage unavailable */ }

  function showWaStats(totalFound, withPhone) {
    statTotal.textContent = totalFound
    statWithPhone.textContent = withPhone
    waStats.style.display = 'flex'
  }

  function showProgress(show, text, percent) {
    if (show) {
      waProgress.classList.add('active')
      waProgressText.textContent = text || 'Scanning…'
      if (percent !== undefined) waProgressFill.style.width = Math.min(100, percent) + '%'
    } else {
      waProgress.classList.remove('active')
    }
  }

  async function sendToContentScript(action) {
    if (!currentTab?.id) throw new Error('No active tab found')
    return await chrome.tabs.sendMessage(currentTab.id, { action })
  }

  // Quick Extract
  waExtractQuickBtn.addEventListener('click', async () => {
    if (!isOnWhatsApp) return showToast('Open web.whatsapp.com first', 'error')

    setLoading(waExtractQuickBtn, true)
    statusText.textContent = 'Extracting visible contacts…'

    try {
      const result = await sendToContentScript('wa_extract_quick')

      if (result?.success) {
        lastExtractResult = result
        showWaStats(result.totalFound, result.withPhone)
        await chrome.storage.local.set({
          waExtractResult: result,
          waStats: { total: result.totalFound, withPhone: result.withPhone },
        })

        if (result.withPhone > 0) {
          await chrome.runtime.sendMessage({
            action: 'downloadCSV',
            csv: result.csv,
            filename: `whatsapp-contacts-quick-${new Date().toISOString().slice(0, 10)}.csv`,
          })
          showToast(`${result.withPhone} contacts exported to CSV!`, 'success')
          statusText.textContent = `${result.withPhone} contacts extracted`
        } else {
          showToast('No contacts with phone numbers found in view', 'error')
        }
      } else {
        showToast(result?.error || 'Extraction failed', 'error')
      }
    } catch (err) {
      console.error('[HelpGate Popup] WA extract error:', err)
      showToast('Error: ' + err.message, 'error')
    } finally {
      setLoading(waExtractQuickBtn, false)
    }
  })

  // Full Extract
  waExtractFullBtn.addEventListener('click', async () => {
    if (!isOnWhatsApp) return showToast('Open web.whatsapp.com first', 'error')

    setLoading(waExtractFullBtn, true)
    setLoading(waExtractQuickBtn, true)
    showProgress(true, 'Scrolling through chats…', 0)
    statusText.textContent = 'Auto-scroll extraction in progress…'

    const progressListener = (message) => {
      if (message.action === 'wa_extract_progress') {
        const pct = Math.min(95, (message.total / 1500) * 95)
        showProgress(true, `Found ${message.total} chats (${message.withPhone || message.total} with phone)…`, pct)
        showWaStats(message.total, message.withPhone || message.total)
      }
    }
    chrome.runtime.onMessage.addListener(progressListener)

    try {
      const result = await sendToContentScript('wa_extract_full')
      chrome.runtime.onMessage.removeListener(progressListener)
      showProgress(true, 'Extraction complete!', 100)

      if (result?.success) {
        lastExtractResult = result
        showWaStats(result.totalFound, result.withPhone)
        await chrome.storage.local.set({
          waExtractResult: result,
          waStats: { total: result.totalFound, withPhone: result.withPhone },
        })

        if (result.withPhone > 0) {
          await chrome.runtime.sendMessage({
            action: 'downloadCSV',
            csv: result.csv,
            filename: `whatsapp-contacts-full-${new Date().toISOString().slice(0, 10)}.csv`,
          })
          showToast(`${result.withPhone} contacts extracted & exported!`, 'success')
          statusText.textContent = `${result.withPhone} contacts extracted`
        } else {
          showToast('No contacts with phone numbers found', 'error')
        }
      } else {
        showToast(result?.error || 'Full extraction failed', 'error')
      }
    } catch (err) {
      chrome.runtime.onMessage.removeListener(progressListener)
      console.error('[HelpGate Popup] WA full extract error:', err)
      showToast('Error: ' + err.message, 'error')
    } finally {
      setLoading(waExtractFullBtn, false)
      setLoading(waExtractQuickBtn, false)
      setTimeout(() => showProgress(false), 2500)
    }
  })

  // Copy Numbers to Clipboard
  copyNumbersBtn.addEventListener('click', async () => {
    if (!lastExtractResult?.contacts?.length) {
      return showToast('Extract contacts first to copy numbers', 'error')
    }
    const phones = lastExtractResult.contacts
      .map(c => c.phone)
      .filter(p => p && p.length >= 10)

    if (phones.length === 0) {
      return showToast('No valid phone numbers found', 'error')
    }

    const text = phones.join(', ')
    await navigator.clipboard.writeText(text)
    showToast(`Copied ${phones.length} numbers to clipboard!`, 'success')
  })

  // Direct WhatsApp Chat (No Contact Save)
  directChatBtn.addEventListener('click', () => {
    let phone = (directPhoneInput.value || '').trim().replace(/\D/g, '')
    if (!phone) return showToast('Please enter a phone number', 'error')

    // If 10 digits Indian number, prefix 91
    if (phone.length === 10 && /^[6-9]/.test(phone)) {
      phone = '91' + phone
    }

    const message = (directMsgInput.value || '').trim()
    const encodedMsg = encodeURIComponent(message)

    const targetUrl = `https://web.whatsapp.com/send?phone=${phone}${encodedMsg ? `&text=${encodedMsg}` : ''}`
    chrome.tabs.create({ url: targetUrl })
    showToast('Opening WhatsApp Chat…', 'success')
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── TAB 3: HELPGATE WEB TOOLS & SCREENSHOT ────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════

  // Tool Tiles Launcher
  document.querySelectorAll('.tool-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      const url = tile.dataset.url
      if (url) {
        chrome.tabs.create({ url })
      }
    })
  })

  // Screenshot Tab
  const captureScreenBtn = $('captureScreen')
  captureScreenBtn.addEventListener('click', async () => {
    if (!currentTab) return showToast('No active tab found', 'error')

    setLoading(captureScreenBtn, true)
    statusText.textContent = 'Capturing screenshot…'

    try {
      const response = await chrome.runtime.sendMessage({ action: 'captureVisibleTab' })

      if (response?.success && response.dataUrl) {
        const ts = new Date().toISOString().slice(0, 10)
        await chrome.downloads.download({
          url: response.dataUrl,
          filename: `HelpGate-Screenshot-${ts}-${Date.now()}.png`,
          saveAs: false,
        })
        showToast('Screenshot saved!', 'success')
        statusText.textContent = 'Screenshot saved'
      } else {
        showToast(response?.error || 'Failed to capture screenshot', 'error')
        statusText.textContent = 'Screenshot failed'
      }
    } catch (err) {
      console.error('[HelpGate Popup] Screenshot error:', err)
      showToast('Error: ' + err.message, 'error')
    } finally {
      setLoading(captureScreenBtn, false)
    }
  })

  // Open HelpGate.in
  $('openHelpgate').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://helpgate.in/' })
    window.close()
  })
})
