const fs = require('fs');
const { apiKey } = require('../config');
const pollStatus = require('./helpers/poll');
const fetchVideoLength = require('./helpers/probe');

const videos = [
  'https://shotstack-assets.s3.amazonaws.com/footage/property-tour-entrance.mp4',
  'https://shotstack-assets.s3.amazonaws.com/footage/property-tour-home-office-b-roll.mp4',
  'https://shotstack-assets.s3.amazonaws.com/footage/property-tour-home-office.mp4',
  'https://shotstack-assets.s3.amazonaws.com/footage/property-tour-living-room-b-roll.mp4',
  'https://shotstack-assets.s3.amazonaws.com/footage/property-tour-living-room.mp4',
  'https://shotstack-assets.s3.amazonaws.com/footage/property-tour-main-bedroom-b-roll.mp4',
  'https://shotstack-assets.s3.amazonaws.com/footage/property-tour-main-bedroom.mp4',
  'https://shotstack-assets.s3.amazonaws.com/footage/property-tour-second-bedroom-b-roll.mp4',
  'https://shotstack-assets.s3.amazonaws.com/footage/property-tour-second-bedroom.mp4',
];

const createClips = async (videos) => {
  let accumulatedLength = 0;
  const clips = [];
  for (const videoUrl of videos) {
    const length = await fetchVideoLength(videoUrl);
    clips.push({
      asset: { type: 'video', src: videoUrl },
      start: accumulatedLength,
      length,
      transition: { in: 'fade', out: 'fade' },
    });
    accumulatedLength += length;
  }

  return clips;
};

const createVideo = async () => {
  try {
    const clips = await createClips(videos);

    const template = JSON.parse(fs.readFileSync('./templates/timeline.json', 'utf8'));
    template.timeline.tracks[0].clips = clips;

    const response = await fetch('https://api.shotstack.io/edit/stage/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(template),
    });
    const renderData = await response.json();
    // console.log(renderData);
    console.log('Render started, polling for status with ID:', renderData.response.id);
    await pollStatus(renderData.response.id);
  } catch (error) {
    console.error('Error creating video:', error);
  }
};

createVideo();
