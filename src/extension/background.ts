chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'save-to-teyvat',
    title: 'Save to Teyvat Archive',
    contexts: ['page', 'link'],
  })
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
