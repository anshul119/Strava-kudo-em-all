document.addEventListener('DOMContentLoaded', async () => {
  const sendKudosButton = document.getElementById('kudosButton');
  const stopKudosButton = document.getElementById('stopKudosButton');
  const errorMessages = document.getElementById('errorMessages');

  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!activeTab?.url || !activeTab.url.includes('strava.com')) {
    errorMessages.textContent = 'Please open Strava first';
    sendKudosButton.disabled = true;
    return;
  }

  sendKudosButton.addEventListener('click', async () => {
    try {
      const response = await chrome.tabs.sendMessage(activeTab.id, {
        action: 'sendKudos',
      });
      if (response) {
        console.log(response.status);
        stopKudosButton.disabled = false;
        sendKudosButton.disabled = true;
      }
    } catch (error) {
      console.log('Error:', error.message);
      errorMessages.textContent = 'Error - Please refresh page';
      sendKudosButton.disabled = true;
    }
  });

  stopKudosButton.addEventListener('click', async () => {
    try {
      const response = await chrome.tabs.sendMessage(activeTab.id, {
        action: 'stopKudos',
      });
      if (response) {
        console.log(response.status);
        stopKudosButton.disabled = true;
        sendKudosButton.disabled = false;
      }
    } catch (error) {
      console.log('Error:', error.message);
      errorMessages.textContent = 'Error - Please refresh page';
      stopKudosButton.disabled = true;
    }
  });
});
