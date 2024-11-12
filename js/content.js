let kudosController = null;

async function giveKudos(signal) {
  const kudosButtons = Array.from(
    document.querySelectorAll(
      'button[title="Give kudos"], button[title="Be the first to give kudos!"]'
    )
  );

  if (kudosButtons.length === 0) {
    console.log('No new activities to give kudos to.');
    return false;
  }

  for (let index = 0; index < kudosButtons.length; index++) {
    // Check if aborted
    if (signal.aborted) {
      console.log('Kudos process interrupted.');
      return false;
    }

    const button = kudosButtons[index];
    try {
      await Promise.race([
        new Promise((resolve) => setTimeout(resolve, 5000)),
        new Promise((_, reject) => {
          signal.addEventListener('abort', () =>
            reject('Kudos process aborted')
          );
        }),
      ]);
      button.click();
      console.log(`Gave kudos to activity #${index + 1}`);
    } catch (error) {
      console.log('Stopping kudos process:', error);
      return false;
    }
  }

  return true;
}

async function autoScrollAndKudos() {
  // Create new controller for this session
  kudosController = new AbortController();
  const { signal } = kudosController;
  let lastScrollTop = 0;

  try {
    while (!signal.aborted) {
      // Give kudos to all currently visible unclicked activities
      const kudosGiven = await giveKudos(signal);

      if (!kudosGiven) {
        console.log(
          'No more new activities with unclicked kudos buttons, scrolling down...'
        );
      }

      // Check abort signal again before scrolling
      if (signal.aborted) break;

      // Scroll down to load additional activities
      window.scrollTo(0, document.body.scrollHeight);

      try {
        await Promise.race([
          new Promise((resolve) => setTimeout(resolve, 5000)),
          new Promise((_, reject) => {
            signal.addEventListener('abort', () =>
              reject('Scroll process aborted')
            );
          }),
        ]);
      } catch (error) {
        console.log('Stopping scroll process:', error);
        break;
      }

      // Check if we've reached the end of the page
      const currentScrollTop = document.documentElement.scrollTop;
      if (currentScrollTop === lastScrollTop) {
        console.log('Reached the end of the page.');
        break;
      }
      lastScrollTop = currentScrollTop;
    }
  } catch (error) {
    console.log('Process stopped:', error);
  } finally {
    kudosController = null;
  }
}

function stopKudos() {
  if (kudosController) {
    kudosController.abort();
    kudosController = null;
    console.log('Stopping kudos process...');
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'sendKudos') {
    autoScrollAndKudos();
    sendResponse({ status: 'Kudos sent!' });
  } else if (request.action === 'stopKudos') {
    stopKudos();
    sendResponse({ status: 'Kudos stopped!' });
  }
});
