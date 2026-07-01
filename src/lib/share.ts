import { toast } from 'sonner'

export const SHARE_URL = 'https://studio-esagames.itch.io/exponential-emergence'
const SHARE_TEXT = 'I clawed my way up the tree of life in Exponential Emergence — how far can you get?'

// Uses the native Web Share sheet when available (great on mobile),
// falling back to copying the link on desktop.
export async function shareGame(): Promise<void> {
  const data = { title: 'Exponential Emergence', text: SHARE_TEXT, url: SHARE_URL }
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(data)
    } catch {
      // user cancelled or share failed — do nothing
    }
    return
  }
  const fallback = `${SHARE_TEXT} ${SHARE_URL}`
  try {
    await navigator.clipboard.writeText(fallback)
    toast.success('Share link copied to clipboard')
  } catch {
    window.prompt('Copy and share this link:', fallback)
  }
}
