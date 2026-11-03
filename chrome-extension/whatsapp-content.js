// HelpGate Extension - WhatsApp Web Content Script
// Extracts contacts (name + phone) from WhatsApp Web chat list
// Injected into web.whatsapp.com — 100% Client-Side Privacy

const LOG_PREFIX = '[HelpGate WA Tools]'
const VERSION = chrome.runtime.getManifest().version

console.log(LOG_PREFIX, 'Content script active — v' + VERSION)

// ─── Phone Utilities & Normalization ─────────────────────────────────────────

function isPhoneNumber(str) {
  if (!str) return false
  const t = str.trim()
  if (/[a-zA-Z]/.test(t)) return false
  const d = t.replace(/\D/g, '')
  return d.length >= 7 && d.length <= 15 && /^[\+]?[\d\s\-\(\)]{7,25}$/.test(t)
}

/** Normalize to standard digits (e.g., 91XXXXXXXXXX or clean international) */
function normalizePhone(str) {
  if (!str) return ''
  const c = str.replace(/\D/g, '')
  if (c.length === 10 && /^[6-9]/.test(c)) return '91' + c
  if (c.length === 11 && c.startsWith('0')) return '91' + c.substring(1)
  if (c.length === 12 && c.startsWith('91')) return c
  if (c.length === 13 && c.startsWith('91')) return c.substring(0, 12)
  if (c.length >= 10 && c.length <= 15) {
    if (!c.startsWith('91') && c.length === 10) return '91' + c
    return c
  }
  return c
}

function isValidPhone(n) {
  if (!n || n.length < 10) return false
  if (n.startsWith('91') && n.length === 12) {
    const d = n.substring(2)
    return /^[6-9]\d{9}$/.test(d) && !/^(\d)\1{9}$/.test(d)
  }
  return n.length >= 10 && n.length <= 15
}

const SYSTEM_ENTRIES = new Set([
  'status', 'communities', 'channels', 'archived', 'meta ai', 'you',
  'all', 'unread', 'favorites', 'groups', 'labels',
  'yesterday', 'today'
])

function isSystemEntry(title) {
  if (!title) return true
  const t = title.trim().toLowerCase()
  if (SYSTEM_ENTRIES.has(t)) return true
  if (/^\d{1,2}[\/:]\d{2}/.test(t)) return true
  if (/^(voice call|video call|photo|video|audio|document|sticker|gif|contact card|location|live location|missed|incoming|outgoing|waiting for this message)$/i.test(t)) return true
  return false
}

// ─── Fast Extraction Engine ──────────────────────────────────────────────────

function extractVisible(masterMap) {
  const pane = document.querySelector('#pane-side')
  if (!pane) return 0

  let newCount = 0

  let rows = pane.querySelectorAll('[data-testid="cell-frame-container"]')
  if (!rows.length) rows = pane.querySelectorAll('[role="listitem"]')
  if (!rows.length) rows = pane.querySelectorAll('[role="row"]')
  if (!rows.length) rows = pane.querySelectorAll('div[tabindex="-1"]')

  if (rows.length > 0) {
    for (const row of rows) {
      try {
        const added = processRowFast(row, masterMap)
        if (added) newCount++
      } catch (e) { /* ignore */ }
    }
    return newCount
  }

  // Fallback: scan all span[title] directly
  const spans = pane.querySelectorAll('span[title]')
  for (const span of spans) {
    try {
      const raw = (span.getAttribute('title') || '').trim()
      if (!raw || raw.length > 80 || isSystemEntry(raw)) continue

      if (isPhoneNumber(raw)) {
        const phone = normalizePhone(raw)
        if (isValidPhone(phone) && !masterMap.has(phone)) {
          masterMap.set(phone, { name: '', phone, type: 'Unsaved' })
          newCount++
        }
      }
    } catch (e) { /* ignore */ }
  }

  return newCount
}

function processRowFast(row, masterMap) {
  const titleSpan = row.querySelector('span[title]')
  if (!titleSpan) return false

  const primaryTitle = (titleSpan.getAttribute('title') || '').trim()
  if (!primaryTitle || primaryTitle.length > 80 || isSystemEntry(primaryTitle)) return false

  let name = ''
  let phone = ''
  let type = 'Saved'

  if (isPhoneNumber(primaryTitle)) {
    // ── Unsaved contact: title = phone number ──
    phone = normalizePhone(primaryTitle)
    type = 'Unsaved'
    if (!isValidPhone(phone)) return false

    if (masterMap.has(phone) && masterMap.get(phone).name) return false

    // Method 1: Check aria-label on ancestor container
    const clickable = row.closest('[role="listitem"]')
      || row.closest('[role="row"]')
      || row.closest('div[tabindex="-1"]')
      || row

    const ariaLabel = clickable.getAttribute('aria-label') || ''
    if (ariaLabel) {
      const ariaName = ariaLabel.split(',')[0].trim()
      if (ariaName && !isPhoneNumber(ariaName) && ariaName.length < 60) {
        name = ariaName
      }
    }

    // Method 2: Check ~PushName in row text
    if (!name) {
      const allSpans = row.querySelectorAll('span')
      for (const sp of allSpans) {
        const text = (sp.textContent || '').trim()
        if (text.startsWith('~') && text.length > 1 && text.length < 60) {
          name = text.substring(1).trim()
          break
        }
      }
    }

    // Method 3: Secondary title span
    if (!name) {
      const allTitleSpans = row.querySelectorAll('span[title]')
      for (let i = 1; i < allTitleSpans.length; i++) {
        const t = (allTitleSpans[i].getAttribute('title') || '').trim()
        if (t && t !== primaryTitle && !isPhoneNumber(t) && !isSystemEntry(t) && t.length < 60) {
          name = t
          break
        }
      }
    }
  } else {
    // ── Saved contact: title = display name ──
    name = primaryTitle
    type = 'Saved'

    // Look for phone in other spans
    const allTitleSpans = row.querySelectorAll('span[title]')
    for (let i = 1; i < allTitleSpans.length; i++) {
      const t = (allTitleSpans[i].getAttribute('title') || '').trim()
      if (t !== primaryTitle && isPhoneNumber(t)) {
        phone = normalizePhone(t)
        break
      }
    }
    if (!phone) {
      const autoSpans = row.querySelectorAll('span[dir="auto"]')
      for (const sp of autoSpans) {
        const text = (sp.textContent || '').trim()
        if (text !== primaryTitle && isPhoneNumber(text)) {
          phone = normalizePhone(text)
          break
        }
      }
    }
    if (phone && !isValidPhone(phone)) phone = ''
  }

  if (!phone && !name) return false

  const key = phone || ('name:' + name)
  if (!masterMap.has(key)) {
    masterMap.set(key, { name, phone, type })
    return true
  }

  // Merge name if found for existing entry
  if (name && !masterMap.get(key).name) {
    masterMap.get(key).name = name
    return true
  }

  return false
}

// ─── Scroll & Extract (Optimized for 2500+ chats) ─────────────────────────────

async function scrollAndExtract(onProgress) {
  const allContacts = new Map()
  const pane = document.querySelector('#pane-side')
  if (!pane) throw new Error('WhatsApp chat list not found. Please log in to WhatsApp Web.')

  let scrollTarget = null
  const divs = pane.querySelectorAll('div')
  for (const div of divs) {
    const style = getComputedStyle(div)
    if (div.scrollHeight > div.clientHeight + 50 &&
        (style.overflowY === 'auto' || style.overflowY === 'scroll')) {
      scrollTarget = div
      break
    }
  }
  if (!scrollTarget) {
    for (const div of divs) {
      if (div.scrollHeight > div.clientHeight + 50) {
        scrollTarget = div
        break
      }
    }
  }
  if (!scrollTarget) scrollTarget = pane.querySelector('[role="list"]') || pane

  const MAX_ROUNDS = 500
  const SCROLL_DELAY = 150
  const PATIENCE = 15
  let dryRounds = 0
  let lastScrollTop = -1

  scrollTarget.scrollTop = 0
  await sleep(300)

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const newCount = extractVisible(allContacts)

    if (onProgress && round % 3 === 0) {
      const withPhone = countWithPhone(allContacts)
      onProgress({ total: allContacts.size, withPhone, round: round + 1, newInRound: newCount })
    }

    const currentScroll = scrollTarget.scrollTop
    const atBottom = (scrollTarget.scrollTop + scrollTarget.clientHeight >= scrollTarget.scrollHeight - 20)

    if (newCount === 0) {
      dryRounds++
      if (atBottom && dryRounds >= 5) break
      if (dryRounds >= PATIENCE) break
      if (currentScroll === lastScrollTop && dryRounds >= 5) break
    } else {
      dryRounds = 0
    }

    lastScrollTop = currentScroll
    scrollTarget.scrollTop += scrollTarget.clientHeight
    await sleep(SCROLL_DELAY)
  }

  if (onProgress) {
    const withPhone = countWithPhone(allContacts)
    onProgress({ total: allContacts.size, withPhone, round: -1, newInRound: 0 })
  }

  return Array.from(allContacts.values())
}

function countWithPhone(map) {
  let count = 0
  for (const v of map.values()) { if (v.phone) count++ }
  return count
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function quickExtract() {
  const map = new Map()
  extractVisible(map)
  return Array.from(map.values())
}

// ─── Universal CSV Generator ─────────────────────────────────────────────────

function contactsToCSV(contacts) {
  const header = 'Phone,Name,Type,Formatted,Notes'
  const today = new Date().toISOString().slice(0, 10)
  const rows = contacts.map((c) => {
    const phone = c.phone || ''
    const formattedPhone = phone ? `"+${phone}"` : '""'
    const name = csvEscape(c.name || '')
    const type = c.type || (phone && !c.name ? 'Unsaved' : 'Saved')
    return `${phone},${name},${type},${formattedPhone},"Extracted via HelpGate Tools (${today})"`
  })
  return header + '\n' + rows.join('\n')
}

function csvEscape(str) {
  if (!str) return '""'
  const clean = String(str).replace(/"/g, '""')
  return `"${clean}"`
}

// ─── Message Listener ────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action } = message || {}

  switch (action) {
    case 'wa_ping': {
      const pane = document.querySelector('#pane-side')
      sendResponse({ success: true, loggedIn: !!pane, version: VERSION })
      return true
    }

    case 'wa_extract_quick': {
      try {
        const contacts = quickExtract()
        const csv = contactsToCSV(contacts)
        sendResponse({
          success: true,
          contacts,
          csv,
          totalFound: contacts.length,
          withPhone: contacts.filter((c) => c.phone).length,
          withName: contacts.filter((c) => c.name).length,
        })
      } catch (err) {
        sendResponse({ success: false, error: err.message })
      }
      return true
    }

    case 'wa_extract_full': {
      ;(async () => {
        try {
          const contacts = await scrollAndExtract((progress) => {
            chrome.runtime.sendMessage({
              action: 'wa_extract_progress',
              ...progress,
            }).catch(() => {})
          })
          const csv = contactsToCSV(contacts)
          sendResponse({
            success: true,
            contacts,
            csv,
            totalFound: contacts.length,
            withPhone: contacts.filter((c) => c.phone).length,
            withName: contacts.filter((c) => c.name).length,
          })
        } catch (err) {
          sendResponse({ success: false, error: err.message })
        }
      })()
      return true
    }

    default:
      return false
  }
})

console.log(LOG_PREFIX, 'WhatsApp engine ready.')
