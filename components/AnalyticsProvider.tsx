'use client' // 1. CRITICAL: Tells Next.js this ONLY runs in the browser, not on the server.

import * as FullStory from '@fullstory/browser'
import { useEffect } from 'react'

export default function AnalyticsProvider() {
  useEffect(() => {
    // 2. THE INITIALIZER: This pulls the FullStory "recorder" into your site.
    // Without this, FullStory doesn't exist on your page.
    FullStory.init({ 
        orgId: 'o-24G7VJ-na1', // Your unique 'license plate' from FullStory
        devMode: process.env.NODE_ENV !== 'production' // Optional: Tells FS if you are testing locally
    });

    // 3. THE CONFIRMATION: This shows up in your browser's Inspect -> Console.
    // If you see this message but NO data in FullStory, you know the code ran, 
    // but the OrgID might be wrong.
    console.log("🛠️ FULLSTORY STATUS: Engine started and recording.");
    
  }, []); // 4. THE ONCE-ONLY RULE: The [] means "only run this when the site first loads."

  return null; // 5. THE GHOST: This component doesn't need to show a button or text.
}