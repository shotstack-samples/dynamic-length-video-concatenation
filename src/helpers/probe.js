module.exports = async (videoUrl) => {
  const response = await fetch(`https://api.shotstack.io/edit/stage/probe/${encodeURIComponent(videoUrl)}`);
  const data = await response.json();
  return parseFloat(data.response.metadata.format.duration);
};
