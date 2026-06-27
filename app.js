// State Management
let guitarists = [];
let activeEraFilter = 'all';
let searchQuery = '';

// DOM Elements
const container = document.getElementById('guitarists-container');
const searchInput = document.getElementById('search-input');
const eraFilterContainer = document.getElementById('era-filter');

// View Containers
const homeView = document.getElementById('home-view');
const profileView = document.getElementById('profile-view');
const profileBackBtn = document.getElementById('profile-back-btn');

// Profile Elements
const profilePhoto = document.getElementById('profile-photo');
const profileEra = document.getElementById('profile-era');
const profileName = document.getElementById('profile-name');
const profileHistory = document.getElementById('profile-history');
const profileImportance = document.getElementById('profile-importance');
const profileTracksContainer = document.getElementById('profile-tracks-container');
const profileVideosContainer = document.getElementById('profile-videos-container');

// Load Data
async function loadGuitaristsData() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) {
      throw new Error(`Erro ao carregar dados: ${response.statusText}`);
    }
    guitarists = await response.json();
    renderGuitarists();
    router(); // Handle deep-linked URLs on initial load
  } catch (error) {
    console.error('Falha ao inicializar dados do site:', error);
    container.innerHTML = `
      <div style="width: 100%; text-align: center; padding: 3rem; color: #ef4444;">
        <p>Não foi possível carregar os dados dos guitarristas. Por favor, verifique se o arquivo data.json foi gerado com sucesso.</p>
        <p style="font-size: 0.85rem; margin-top: 1rem; color: var(--text-secondary);">${error.message}</p>
      </div>
    `;
  }
}

// Router for Hash-based Navigation
function router() {
  const hash = window.location.hash.substring(1); // Extract guitarist ID from hash
  
  if (!hash) {
    // Show home page timeline
    profileView.classList.add('hidden');
    homeView.classList.remove('hidden');
    
    // Trigger fade-in animation
    homeView.classList.remove('fade-in');
    void homeView.offsetWidth; // Trigger reflow
    homeView.classList.add('fade-in');
    
    document.title = "6 Strings Lab - Linha do Tempo dos Guitarristas Históricos";
  } else {
    // Show guitarist profile page
    const guitarist = guitarists.find(g => g.id === hash);
    if (guitarist) {
      showGuitaristProfile(guitarist);
    } else {
      // If guitarist id doesn't exist, reset hash to go home
      window.location.hash = '';
    }
  }
}

// Render Guitarists Cards
function renderGuitarists() {
  // Filter the guitarists list based on active filters
  const filtered = guitarists.filter((guitarist) => {
    const matchesEra = activeEraFilter === 'all' || guitarist.era === activeEraFilter;
    const matchesSearch = 
      guitarist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guitarist.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guitarist.era.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEra && matchesSearch;
  });

  // Clear container
  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="width: 100%; text-align: center; padding: 4rem; color: var(--text-secondary);">
        <h3>Nenhum guitarrista encontrado</h3>
        <p style="font-size: 0.9rem; margin-top: 0.5rem;">Tente ajustar seus filtros ou busca.</p>
      </div>
    `;
    return;
  }

  // Render rows
  filtered.forEach((guitarist) => {
    // Find the true global index (chronological position) of this guitarist
    const globalIndex = guitarists.findIndex(g => g.id === guitarist.id) + 1;
    const formattedIndex = globalIndex.toString().padStart(2, '0');

    const row = document.createElement('article');
    row.className = 'guitarist-row';
    row.tabIndex = 0;
    row.setAttribute('role', 'article');
    row.setAttribute('aria-label', `${guitarist.name}, era ${guitarist.era}`);
    
    row.innerHTML = `
      <div class="row-header">
        <span class="row-index">#${formattedIndex}</span>
        <span class="era-badge">${guitarist.era}</span>
      </div>
      <div class="row-info">
        <h3 class="guitarist-name">${guitarist.name}</h3>
        <p class="guitarist-snippet">${guitarist.bio}</p>
      </div>
      <div class="row-action">
        <span>Ver História</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </div>
    `;

    // Event Listeners to navigate to guitarist hash page
    const openProfile = () => {
      window.location.hash = guitarist.id;
    };
    row.addEventListener('click', openProfile);
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openProfile();
      }
    });

    container.appendChild(row);
  });
}

// Show Profile Page content
function showGuitaristProfile(guitarist) {
  // Populate UI elements
  profilePhoto.src = guitarist.image || 'images/guitar_hero.png';
  profilePhoto.alt = `Retrato artístico de ${guitarist.name}`;
  profileEra.textContent = guitarist.era;
  profileName.textContent = guitarist.name;
  profileHistory.textContent = guitarist.history || guitarist.bio;
  profileImportance.textContent = guitarist.importance || 'Informação sobre a importância histórica em breve.';

  // Render Spotify Tracks
  profileTracksContainer.innerHTML = '';
  guitarist.songs.forEach((song, i) => {
    const trackItem = document.createElement('div');
    trackItem.className = 'track-item';

    const isDirectTrack = song.url.includes('/track/');
    const buttonText = isDirectTrack ? 'Ouvir no Spotify' : 'Buscar no Spotify';

    trackItem.innerHTML = `
      <div class="track-left">
        <span class="track-number">${(i + 1).toString().padStart(2, '0')}</span>
        <span class="track-title" title="${song.title}">${song.title}</span>
      </div>
      <a href="${song.url}" target="_blank" rel="noopener noreferrer" class="spotify-link-btn" aria-label="Ouvir ${song.title} no Spotify">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-.982-.336.077-.67-.137-.747-.473-.077-.336.137-.67.473-.747 3.85-.88 7.14-.51 9.82.1.282.2.374.585.195.895zm1.223-2.723c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.076-1.183-.412.125-.845-.108-.97-.52-.125-.413.108-.847.52-.97 3.668-1.11 8.243-.572 11.34 1.33.367.227.487.708.26 1.074zm.106-2.833C14.475 8.8 8.79 8.612 5.503 9.61c-.506.153-1.04-.136-1.193-.642-.153-.507.137-1.04.643-1.193 3.775-1.147 10.05-.93 14.015 1.423.456.27.607.86.337 1.317-.27.457-.86.608-1.317.338z"/>
        </svg>
        <span>${buttonText}</span>
      </a>
    `;
    profileTracksContainer.appendChild(trackItem);
  });

  // Render YouTube Videos Timeline
  profileVideosContainer.innerHTML = '';
  if (!guitarist.videos || guitarist.videos.length === 0) {
    const emptyCard = document.createElement('div');
    emptyCard.className = 'no-videos-card';
    emptyCard.innerHTML = `
      <div class="no-videos-icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      </div>
      <h3 class="no-videos-title">Sem registros de vídeo conhecidos</h3>
      <p class="no-videos-text">
        Infelizmente, devido à época histórica em que este artista viveu e atuou, não existem registros em vídeo conhecidos de ${guitarist.name} performando. Sua obra fantástica sobrevive através de suas gravações históricas de áudio.
      </p>
    `;
    profileVideosContainer.appendChild(emptyCard);
  } else {
    // Sort videos by year
    const sortedVideos = [...guitarist.videos].sort((a, b) => parseInt(a.year) - parseInt(b.year));
    
    sortedVideos.forEach((video) => {
      const timelineItem = document.createElement('div');
      timelineItem.className = 'video-timeline-item';
      
      timelineItem.innerHTML = `
        <div class="video-timeline-node"></div>
        <div class="video-timeline-year">${video.year}</div>
        <div class="video-timeline-content">
          <h4 class="video-timeline-title-text">${video.title}</h4>
          <p class="video-timeline-description">${video.description}</p>
          <div class="video-player-wrapper">
            <div class="video-thumbnail-placeholder" style="background-image: url('https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg');" data-video-id="${video.youtubeId}" aria-label="Reproduzir vídeo: ${video.title}">
              <div class="video-play-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      `;
      
      const placeholder = timelineItem.querySelector('.video-thumbnail-placeholder');
      placeholder.addEventListener('click', function() {
        const videoId = this.dataset.videoId;
        const wrapper = this.parentElement;
        wrapper.innerHTML = `
          <iframe 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen>
          </iframe>
        `;
      });
      
      profileVideosContainer.appendChild(timelineItem);
    });
  }

  // Toggle views
  homeView.classList.add('hidden');
  profileView.classList.remove('hidden');

  // Trigger fade-in animation
  profileView.classList.remove('fade-in');
  void profileView.offsetWidth; // Trigger reflow
  profileView.classList.add('fade-in');

  // Smooth scroll page to the top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update SEO Document Title
  document.title = `6 Strings Lab - ${guitarist.name}`;
}

// Event Listeners
profileBackBtn.addEventListener('click', () => {
  window.location.hash = ''; // Navigates back home
});

window.addEventListener('hashchange', router);

// Search input handling
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderGuitarists();
});

// Era filter buttons handling
eraFilterContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;

  // Update active state in UI
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Update filter state and render
  activeEraFilter = btn.dataset.era;
  renderGuitarists();
});

// App Initialization
document.addEventListener('DOMContentLoaded', loadGuitaristsData);
