chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_PAGE_INFO') {
    sendResponse({
      title: document.title,
      url: window.location.href,
      description: getMetaContent('description'),
      favicon: getFavicon(),
    })
  }
})

function getMetaContent(name: string): string {
  const el = document.querySelector(`meta[name="${name}"], meta[property="og:${name}"]`)
  return el?.getAttribute('content') || ''
}

function getFavicon(): string {
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"], link[rel="shortcut icon"]')
  if (link?.href) return link.href
  return `${window.location.origin}/favicon.ico`
}

export {}
