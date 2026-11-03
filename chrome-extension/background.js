// HelpGate Extension - Background Service Worker
// Manages media downloads, CSV export, tab screenshots, and background messaging
// 100% Client-Side Privacy — Zero external server uploads

const LOG_PREFIX = '[HelpGate Tools]'
const VERSION = chrome.runtime.getManifest().version

console.log(LOG_PREFIX, 'Service worker active — v' + VERSION)

// ─── Visible Tab Screenshot Helper ───────────────────────────────────────────
function captureVisibleTab() {
  return new Promise((resolve) => {
    chrome.tabs.captureVisibleTab(null, { format: 'png', quality: 100 }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        resolve({ success: false, error: chrome.runtime.lastError.message })
      } else if (dataUrl) {
        resolve({ success: true, dataUrl, source: 'screenshot' })
      } else {
        resolve({ success: false, error: 'Could not capture current tab' })
      }
    })
  })
}

// ─── Message Router ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const { action } = message || {}

  switch (action) {
    // ── Health Check ──
    case 'ping': {
      sendResponse({ success: true, version: VERSION, brand: 'HelpGate' })
      return true
    }

    // ── Visible-tab Screenshot ──
    case 'captureVisibleTab': {
      captureVisibleTab().then(sendResponse)
      return true
    }

    // ── Image / Screenshot Download ──
    case 'downloadImage': {
      const filename = message.filename || `HelpGate-Capture-${Date.now()}.png`
      chrome.downloads.download(
        { url: message.dataUrl, filename, saveAs: false },
        (downloadId) => {
          sendResponse(
            chrome.runtime.lastError
              ? { success: false, error: chrome.runtime.lastError.message }
              : { success: true, downloadId }
          )
        }
      )
      return true
    }

    // ── Universal CSV Download (WhatsApp Contacts, Spendo Intel Reports) ──
    case 'downloadCSV': {
      const csvContent = message.csv || ''
      const filename = message.filename || `helpgate-export-${Date.now()}.csv`
      const dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent)
      chrome.downloads.download(
        { url: dataUrl, filename, saveAs: true },
        (downloadId) => {
          sendResponse(
            chrome.runtime.lastError
              ? { success: false, error: chrome.runtime.lastError.message }
              : { success: true, downloadId }
          )
        }
      )
      return true
    }

    // ── HD Video & Image Media Downloader (Spendo Feature) ──
    case 'downloadMedia': {
      ;(async () => {
        try {
          const { url, filename } = message
          if (!url) return sendResponse({ success: false, error: 'No media URL provided' })

          const targetFilename = filename || `HelpGate-Spendo-Creative-${Date.now()}.mp4`

          // Attempt direct chrome.downloads first
          chrome.downloads.download(
            { url, filename: targetFilename, saveAs: false },
            async (downloadId) => {
              if (chrome.runtime.lastError) {
                // If direct download fails (e.g. cross-origin CDN constraints), fallback to blob
                try {
                  const res = await fetch(url)
                  const blob = await res.blob()
                  const reader = new FileReader()
                  reader.onloadend = () => {
                    chrome.downloads.download(
                      { url: reader.result, filename: targetFilename, saveAs: false },
                      (fallbackId) => {
                        if (chrome.runtime.lastError) {
                          sendResponse({ success: false, error: chrome.runtime.lastError.message })
                        } else {
                          sendResponse({ success: true, downloadId: fallbackId })
                        }
                      }
                    )
                  }
                  reader.onerror = () => sendResponse({ success: false, error: 'Blob conversion failed' })
                  reader.readAsDataURL(blob)
                } catch (fetchErr) {
                  sendResponse({ success: false, error: fetchErr.message })
                }
              } else {
                sendResponse({ success: true, downloadId })
              }
            }
          )
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
