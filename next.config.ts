import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Fall back to Babel if SWC native binaries are unavailable (e.g. Raspberry Pi armv7).
  // On arm64 (Pi 4/5) SWC binaries are available and this flag has no effect.
  experimental: {
    forceSwcTransforms: false,
  },
}

export default nextConfig
