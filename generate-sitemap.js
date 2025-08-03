// generate-sitemap.js
const fs = require('fs');
const { SitemapStream, streamToPromise } = require('sitemap');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase config (use same as firebaseConfig.js)
const firebaseConfig = {
  apiKey: "AIzaSyANMLjscPssWyu6fJR15JcP2AL_8Xwocv4",
  authDomain: "mysurian09.firebaseapp.com",
  projectId: "mysurian09",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function generateSitemap() {
  const smStream = new SitemapStream({ hostname: 'https://mysurian09.web.app' });

  // Static pages
  smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
  smStream.write({ url: '/hotels', changefreq: 'weekly', priority: 0.8 });
  smStream.write({ url: '/gyms', changefreq: 'weekly', priority: 0.8 });
  smStream.write({ url: '/restaurants', changefreq: 'weekly', priority: 0.8 });
  smStream.write({ url: '/events', changefreq: 'weekly', priority: 0.8 });

  // Dynamic pages from Firestore
  const categories = ['hotels', 'gyms', 'restaurants', 'events'];
  for (const category of categories) {
    const snapshot = await getDocs(collection(db, category));
    snapshot.forEach(doc => {
      smStream.write({
        url: `/${category}/${doc.id}`,
        changefreq: 'monthly',
        priority: 0.6
      });
    });
  }

  smStream.end();
  const sitemapOutput = await streamToPromise(smStream);

  // Save to public folder
  fs.writeFileSync('./public/sitemap.xml', sitemapOutput.toString());
  console.log('✅ Sitemap generated at public/sitemap.xml');
}

generateSitemap().catch(console.error);
