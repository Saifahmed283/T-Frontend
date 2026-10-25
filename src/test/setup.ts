import "@testing-library/jest-dom/vitest"

import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"

// jsdom does not implement the native dialog methods. The dashboard modal calls
// showModal() on mount and close() on unmount, so give tests the same contract.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true
  }
}

if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function () {
    this.open = false
    this.dispatchEvent(new Event("close"))
  }
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.clearAllTimers()
})
