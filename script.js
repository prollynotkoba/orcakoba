// Typewriter effect for the tab title
const tabText = "prollynotkoba";
let i = 0;

function typeWriter() {
  if (i === 0) document.title = "";
  if (i < tabText.length) {
    document.title += tabText.charAt(i);
    i++;
    setTimeout(typeWriter, 200); // speed
  } else {
    setTimeout(() => {
      i = 0;
      typeWriter();
    }, 1200); // Wait before restarting
  }
}
document.addEventListener("DOMContentLoaded", typeWriter);

// Custom Lanyard Status
const userIds = {
  'index.html': '1365623461749456976',
};
function getStatusClass(status) {
  switch (status.toLowerCase()) {
    case 'online': return 'status-online';
    case 'idle': return 'status-idle';
    case 'dnd': return 'status-dnd';
    case 'offline': return 'status-offline';
    default: return 'status-offline';
  }
}

function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const startTime = new Date(timestamp);
  const now = new Date();
  const diffMs = now - startTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffSecs = Math.floor((diffMs % 60000) / 1000);
  return `⏱️ ${diffMins}m ${diffSecs}s`;
}

async function updateDiscordStatus() {
  const discordStatusDiv = document.querySelector('.discord-status');
  const discordActivityContainer = document.querySelector('.discord-activity-container');
  const discordNoteDiv = document.querySelector('.discord-note');
  if (!discordStatusDiv || !discordActivityContainer || !discordNoteDiv) return;

  discordActivityContainer.innerHTML = '';
  discordNoteDiv.innerText = '';
  discordNoteDiv.style.display = 'none';

  const currentPage = window.location.pathname.split('/').pop();
  const userId = userIds[currentPage] || Object.values(userIds)[0];

  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
    const data = await response.json();

    if (!data || !data.data) {
      discordActivityContainer.innerText = 'No data available';
      return;
    }

    const statusRaw = data.data.discord_status || 'offline';
    const status = statusRaw.toLowerCase();

    discordStatusDiv.classList.remove('status-online', 'status-idle', 'status-dnd', 'status-offline');
    discordStatusDiv.classList.add(getStatusClass(status));
    discordStatusDiv.innerText = '';

    if (status === 'offline') {
      discordActivityContainer.innerText = 'User is offline';
      return;
    }

    const activities = data.data.activities || [];
    if (activities.length === 0) {
      discordActivityContainer.innerText = 'No activity';
      return;
    }

    activities.forEach(activity => {
      const card = document.createElement('div');
      card.className = 'activity-card';

      let activityIconUrl = '';
      if (activity.assets && activity.assets.large_image) {
        const largeImage = activity.assets.large_image;
        if (activity.application_id === 'spotify' || activity.application_id === 'spotify:') {
          const parts = largeImage.split(':');
          const spotifyId = parts[parts.length - 1];
          activityIconUrl = `https://i.scdn.co/image/${spotifyId}`;
        } else if (largeImage.startsWith('mp:')) {
          activityIconUrl = `https://cdn.discordapp.com/${largeImage.substring(3)}.png`;
        } else if (largeImage.startsWith('http')) {
          activityIconUrl = largeImage;
        } else {
          activityIconUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${largeImage}.png`;
        }
      }
      if (activityIconUrl) {
        const iconImg = document.createElement('img');
        iconImg.src = activityIconUrl;
        iconImg.alt = 'Activity Icon';
        iconImg.className = 'activity-icon-img';
        iconImg.style.width = '48px';
        iconImg.style.height = '48px';
        card.appendChild(iconImg);
      }

      const title = document.createElement('div');
      title.className = 'activity-title';
      title.innerText = activity.name || 'Activity';
      card.appendChild(title);

      if (activity.details) {
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'activity-detail';
        detailsDiv.innerText = activity.details;
        card.appendChild(detailsDiv);
      }

      if (activity.state) {
        const stateDiv = document.createElement('div');
        stateDiv.className = 'activity-state';
        stateDiv.innerText = activity.state;
        card.appendChild(stateDiv);
      }

      if (activity.timestamps && activity.timestamps.start) {
        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'activity-timestamp';
        timestampDiv.innerText = formatTimestamp(activity.timestamps.start);
        card.appendChild(timestampDiv);
      }

      if (activity.buttons && activity.buttons.length > 0) {
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'activity-buttons';
        activity.buttons.forEach(buttonText => {
          const button = document.createElement('button');
          button.className = 'activity-button';
          button.innerText = buttonText;
          buttonsDiv.appendChild(button);
        });
        card.appendChild(buttonsDiv);
      }

      discordActivityContainer.appendChild(card);
    });

    const note = data.data.discord_note || '';
    if (note) {
      discordNoteDiv.innerText = `Note: ${note}`;
      discordNoteDiv.style.display = 'block';
    }

  } catch (error) {
    console.error('Failed to fetch Discord status:', error);
    discordActivityContainer.innerText = 'Error loading activity';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  updateDiscordStatus();
  setInterval(updateDiscordStatus, 60000);
});

