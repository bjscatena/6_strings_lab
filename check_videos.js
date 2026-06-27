const fs = require('fs');
const path = require('path');

async function checkVideos() {
  const dataPath = path.join(__dirname, 'data.json');
  if (!fs.existsSync(dataPath)) {
    console.error(`Error: data.json not found at ${dataPath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const broken = [];

  console.log('Starting verification of YouTube videos...');
  
  for (const guitarist of data) {
    if (guitarist.videos) {
      for (const video of guitarist.videos) {
        const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${video.youtubeId}&format=json`;
        try {
          const res = await fetch(url);
          if (res.status !== 200) {
            console.log(`❌ BROKEN: ${guitarist.name} - "${video.title}" (ID: ${video.youtubeId}) - status: ${res.status}`);
            broken.push({
              guitaristId: guitarist.id,
              guitaristName: guitarist.name,
              youtubeId: video.youtubeId,
              title: video.title,
              status: res.status
            });
          } else {
            console.log(`✅ OK: ${guitarist.name} - "${video.title}"`);
          }
        } catch (err) {
          console.log(`⚠️ ERROR checking ${guitarist.name} - "${video.title}" (ID: ${video.youtubeId}): ${err.message}`);
          broken.push({
            guitaristId: guitarist.id,
            guitaristName: guitarist.name,
            youtubeId: video.youtubeId,
            title: video.title,
            error: err.message
          });
        }
        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  }

  console.log('\n--- Summary ---');
  if (broken.length === 0) {
    console.log('🎉 All videos are working perfectly!');
  } else {
    console.log(`Found ${broken.length} broken video(s):`);
    console.log(JSON.stringify(broken, null, 2));
  }
}

checkVideos();
