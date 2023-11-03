const { apiKey } = require('../../config');

module.exports = async (id, interval = 5000) => {
  const checkStatus = async () => {
    try {
      const response = await fetch(`https://api.shotstack.io/edit/stage/render/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Checking status: ${data.response.status}`); // Logging each status check for visibility

      if (data.response.status === 'done') {
        console.log('Render complete:', data.response.url);
      } else if (data.response.status === 'failed') {
        console.error('Render failed:', data);
      } else {
        setTimeout(checkStatus, interval);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  checkStatus();
};
