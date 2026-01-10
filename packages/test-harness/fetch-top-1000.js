#!/usr/bin/env node

/**
 * Fetch top 1000 npm packages from npm registry
 * This uses the npm search API to get popular packages
 */

async function fetchTopPackages() {
  const packages = [];
  
  // Fetch in batches using npm search API
  // The search API orders by popularity/quality/maintenance
  for (let from = 0; from < 1000; from += 250) {
    const url = `https://registry.npmjs.com/-/v1/search?text=*&size=250&from=${from}&popularity=1.0&quality=0.0&maintenance=0.0`;
    console.error(`Fetching packages ${from}-${from + 250}...`);
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      data.objects.forEach((obj, idx) => {
        packages.push({
          name: obj.package.name,
          weeklyDownloads: Math.round((obj.package.links?.npm ? 1000000 : 100000) * (1 - from / 1000)), // Estimate
          rank: from + idx + 1
        });
      });
    } catch (err) {
      console.error(`Error fetching batch ${from}:`, err.message);
    }
  }
  
  console.log(JSON.stringify(packages, null, 2));
}

fetchTopPackages();
