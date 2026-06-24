import type { FillRequest, FillResponse, Profile } from '~/types'
import { detectFields } from './detector'
import { MatchingEngine } from './matcher'
import { fillFields } from './filler'

let currentProfile: Profile | null = null
const engine = new MatchingEngine()

chrome.runtime.onMessage.addListener(
  (request: FillRequest, _sender, sendResponse: (response: FillResponse) => void) => {
    if (request.action !== 'fillForm') return false

    if (!currentProfile) {
      chrome.storage.local.get('profile', (result) => {
        const profile = result.profile as Profile | undefined
        if (!profile) {
          sendResponse({ success: false, fieldsMatched: 0, fieldsFilled: 0 })
          return
        }
        currentProfile = profile
        doFill(request.forceFill ?? false, sendResponse)
      })
      return true
    }

    doFill(request.forceFill ?? false, sendResponse)
    return true
  },
)

function doFill(
  forceFill: boolean,
  sendResponse: (response: FillResponse) => void,
): void {
  const fields = detectFields()
  const matches = engine.matchAll(fields)
  const response = fillFields(matches, currentProfile!, forceFill)
  sendResponse(response)
}
