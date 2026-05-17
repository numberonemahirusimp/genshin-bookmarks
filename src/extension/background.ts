const YOUTUBE_REFERER_RULE_ID = 1001
const YOUTUBE_EMBED_REFERRER = 'https://www.youtube.com/'

async function ensureYouTubeEmbedRefererRule() {
  if (!chrome.declarativeNetRequest?.updateDynamicRules) return

  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [YOUTUBE_REFERER_RULE_ID],
      addRules: [
        {
          id: YOUTUBE_REFERER_RULE_ID,
          priority: 1,
          action: {
            type: 'modifyHeaders' as chrome.declarativeNetRequest.RuleActionType,
            requestHeaders: [
              {
                header: 'Referer',
                operation: 'set' as chrome.declarativeNetRequest.HeaderOperation,
                value: YOUTUBE_EMBED_REFERRER,
              },
            ],
          },
          condition: {
            regexFilter: '^https://www\\.youtube(?:-nocookie)?\\.com/embed/',
            resourceTypes: ['sub_frame' as chrome.declarativeNetRequest.ResourceType],
          },
        },
      ],
    })
  } catch (error) {
    console.warn('Unable to install YouTube embed referrer rule', error)
  }
}

ensureYouTubeEmbedRefererRule()

chrome.runtime.onInstalled.addListener(() => {
  ensureYouTubeEmbedRefererRule()

  chrome.contextMenus.create({
    id: 'save-to-teyvat',
    title: 'Save to Teyvat Archive',
    contexts: ['page', 'link'],
  })
})

chrome.runtime.onStartup.addListener(() => {
  ensureYouTubeEmbedRefererRule()
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'save-to-teyvat' && tab?.url) {
    chrome.storage.local.set({
      pendingBookmark: {
        title: tab.title || 'Untitled',
        url: tab.url,
        description: '',
        favicon: tab.favIconUrl || '',
      },
    })
  }
})

chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-archive') {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })
  }
})
