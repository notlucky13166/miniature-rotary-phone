// StreamHub - Main JavaScript File
class StreamHub {
    constructor() {
        this.apiKey = 'af9948790c4e5a90eadd97d97530a9c1';
        this.baseUrl = 'https://api.themoviedb.org/3';
        this.imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
        this.currentPage = 1;
        this.watchlist = JSON.parse(localStorage.getItem('streamhub_watchlist') || '[]');
        this.currentVideoQuality = '1080p';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFeaturedMovies();
        this.loadLiveSports();
        this.loadTrendingContent();
        this.initializeSplide();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
            searchInput.addEventListener('focus', () => this.showSearchResults());
            searchInput.addEventListener('blur', () => setTimeout(() => this.hideSearchResults(), 200));
        }

        // Filter event listeners
        const genreFilter = document.getElementById('genreFilter');
        const yearFilter = document.getElementById('yearFilter');
        const sportFilter = document.getElementById('sportFilter');

        if (genreFilter) genreFilter.addEventListener('change', () => this.filterMovies());
        if (yearFilter) yearFilter.addEventListener('change', () => this.filterMovies());
        if (sportFilter) sportFilter.addEventListener('change', () => this.filterSports());

        // Load more movies
        const loadMoreBtn = document.getElementById('loadMoreMovies');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreMovies());
        }
    }

    async loadFeaturedMovies() {
        try {
            const response = await fetch(`${this.baseUrl}/movie/popular?api_key=${this.apiKey}&page=1`);
            const data = await response.json();
            this.displayFeaturedMovies(data.results.slice(0, 10));
        } catch (error) {
            console.error('Error loading featured movies:', error);
            this.displayFeaturedMovies(this.getMockMovies());
        }
    }

    displayFeaturedMovies(movies) {
        const container = document.getElementById('featuredMoviesList');
        if (!container) return;

        container.innerHTML = movies.map(movie => `
            <li class="splide__slide">
                <div class="movie-card rounded-xl overflow-hidden cursor-pointer hover-scale" onclick="streamHub.showMovieDetail(${movie.id})">
                    <div class="relative">
                        <img src="${movie.poster_path ? this.imageBaseUrl + movie.poster_path : 'https://via.placeholder.com/300x450?text=No+Image'}" 
                             alt="${movie.title}" class="w-full h-80 object-cover">
                        <div class="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                            <i class="fas fa-star text-yellow-400 mr-1"></i>
                            ${movie.vote_average.toFixed(1)}
                        </div>
                        <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
                            <div class="absolute bottom-4 left-4 right-4">
                                <button class="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    <i class="fas fa-play mr-2"></i>Watch Now
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="p-4">
                        <h4 class="text-white font-semibold truncate mb-2">${movie.title}</h4>
                        <p class="text-gray-400 text-sm">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
                    </div>
                </div>
            </li>
        `).join('');

        this.initializeSplide();
    }

    async loadLiveSports() {
        try {
            // Mock sports data since Streamed.pk API requires authentication
            const mockSports = this.getMockSports();
            this.displayLiveSports(mockSports);
        } catch (error) {
            console.error('Error loading live sports:', error);
            this.displayLiveSports(this.getMockSports());
        }
    }

    displayLiveSports(sports) {
        const container = document.getElementById('liveSportsGrid');
        if (!container) return;

        container.innerHTML = sports.map(sport => `
            <div class="glass-effect rounded-xl p-6 cursor-pointer hover:bg-gray-800 transition-colors" onclick="streamHub.watchSport('${sport.id}')">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <i class="fas fa-${sport.icon} text-white text-xl"></i>
                        </div>
                        <div>
                            <h4 class="text-white font-semibold">${sport.sport}</h4>
                            <p class="text-gray-400 text-sm">${sport.league}</p>
                        </div>
                    </div>
                    <div class="stream-indicator">
                        <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                </div>
                <div class="flex items-center justify-between mb-4">
                    <div class="text-center">
                        <img src="${sport.team1Logo}" alt="${sport.team1}" class="w-12 h-12 rounded-full mx-auto mb-2">
                        <p class="text-white text-sm font-medium">${sport.team1}</p>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-white">${sport.score}</div>
                        <div class="text-gray-400 text-sm">${sport.time}</div>
                    </div>
                    <div class="text-center">
                        <img src="${sport.team2Logo}" alt="${sport.team2}" class="w-12 h-12 rounded-full mx-auto mb-2">
                        <p class="text-white text-sm font-medium">${sport.team2}</p>
                    </div>
                </div>
                <button class="w-full py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all">
                    <i class="fas fa-play mr-2"></i>Watch Live
                </button>
            </div>
        `).join('');
    }

    async loadTrendingContent() {
        try {
            const response = await fetch(`${this.baseUrl}/trending/movie/week?api_key=${this.apiKey}&page=1`);
            const data = await response.json();
            this.displayTrendingContent(data.results.slice(0, 12));
        } catch (error) {
            console.error('Error loading trending content:', error);
            this.displayTrendingContent(this.getMockMovies().slice(0, 12));
        }
    }

    displayTrendingContent(movies) {
        const container = document.getElementById('trendingGrid');
        if (!container) return;

        container.innerHTML = movies.map(movie => `
            <div class="movie-card rounded-lg overflow-hidden cursor-pointer hover-scale" onclick="streamHub.showMovieDetail(${movie.id})">
                <div class="relative">
                    <img src="${movie.poster_path ? this.imageBaseUrl + movie.poster_path : 'https://via.placeholder.com/200x300?text=No+Image'}" 
                         alt="${movie.title}" class="w-full h-48 object-cover">
                    <div class="absolute top-1 right-1 bg-black bg-opacity-70 text-white px-1 py-0.5 rounded text-xs">
                        ${movie.vote_average.toFixed(1)}
                    </div>
                </div>
                <div class="p-3">
                    <h5 class="text-white font-medium text-sm truncate">${movie.title}</h5>
                    <p class="text-gray-400 text-xs">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
                </div>
            </div>
        `).join('');
    }

    async loadMovies(page = 1) {
        try {
            const genre = document.getElementById('genreFilter')?.value || '';
            const year = document.getElementById('yearFilter')?.value || '';
            
            let url = `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&page=${page}&sort_by=popularity.desc`;
            if (genre) url += `&with_genres=${genre}`;
            if (year) url += `&primary_release_year=${year}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (page === 1) {
                this.displayMovies(data.results);
            } else {
                this.appendMovies(data.results);
            }
        } catch (error) {
            console.error('Error loading movies:', error);
            if (page === 1) {
                this.displayMovies(this.getMockMovies());
            } else {
                this.appendMovies(this.getMockMovies());
            }
        }
    }

    displayMovies(movies) {
        const container = document.getElementById('moviesGrid');
        if (!container) return;

        container.innerHTML = movies.map(movie => `
            <div class="movie-card rounded-xl overflow-hidden cursor-pointer hover-scale" onclick="streamHub.showMovieDetail(${movie.id})">
                <div class="relative">
                    <img src="${movie.poster_path ? this.imageBaseUrl + movie.poster_path : 'https://via.placeholder.com/300x450?text=No+Image'}" 
                         alt="${movie.title}" class="w-full h-80 object-cover">
                    <div class="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                        <i class="fas fa-star text-yellow-400 mr-1"></i>
                        ${movie.vote_average.toFixed(1)}
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
                        <div class="absolute bottom-4 left-4 right-4 space-y-2">
                            <button class="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onclick="event.stopPropagation(); streamHub.playMovie(${movie.id})">
                                <i class="fas fa-play mr-2"></i>Watch Now
                            </button>
                            <button class="w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors" onclick="event.stopPropagation(); streamHub.toggleWatchlist(${movie.id})">
                                <i class="fas fa-bookmark mr-2"></i>Add to Watchlist
                            </button>
                        </div>
                    </div>
                </div>
                <div class="p-4">
                    <h4 class="text-white font-semibold truncate mb-2">${movie.title}</h4>
                    <p class="text-gray-400 text-sm mb-2">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">HD</span>
                        <span class="text-xs text-gray-400">${Math.floor(Math.random() * 60 + 90)} min</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    appendMovies(movies) {
        const container = document.getElementById('moviesGrid');
        if (!container) return;

        const newMovies = movies.map(movie => `
            <div class="movie-card rounded-xl overflow-hidden cursor-pointer hover-scale" onclick="streamHub.showMovieDetail(${movie.id})">
                <div class="relative">
                    <img src="${movie.poster_path ? this.imageBaseUrl + movie.poster_path : 'https://via.placeholder.com/300x450?text=No+Image'}" 
                         alt="${movie.title}" class="w-full h-80 object-cover">
                    <div class="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                        <i class="fas fa-star text-yellow-400 mr-1"></i>
                        ${movie.vote_average.toFixed(1)}
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
                        <div class="absolute bottom-4 left-4 right-4 space-y-2">
                            <button class="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onclick="event.stopPropagation(); streamHub.playMovie(${movie.id})">
                                <i class="fas fa-play mr-2"></i>Watch Now
                            </button>
                            <button class="w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors" onclick="event.stopPropagation(); streamHub.toggleWatchlist(${movie.id})">
                                <i class="fas fa-bookmark mr-2"></i>Add to Watchlist
                            </button>
                        </div>
                    </div>
                </div>
                <div class="p-4">
                    <h4 class="text-white font-semibold truncate mb-2">${movie.title}</h4>
                    <p class="text-gray-400 text-sm mb-2">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">HD</span>
                        <span class="text-xs text-gray-400">${Math.floor(Math.random() * 60 + 90)} min</span>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML += newMovies;
    }

    loadMoreMovies() {
        this.currentPage++;
        this.loadMovies(this.currentPage);
    }

    filterMovies() {
        this.currentPage = 1;
        this.loadMovies(1);
    }

    filterSports() {
        // Implement sports filtering logic
        this.loadLiveSports();
    }

    async handleSearch(query) {
        if (query.length < 2) {
            this.hideSearchResults();
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`);
            const data = await response.json();
            this.displaySearchResults(data.results.slice(0, 8));
        } catch (error) {
            console.error('Error searching movies:', error);
            this.displaySearchResults(this.getMockMovies().slice(0, 8));
        }
    }

    displaySearchResults(results) {
        const container = document.getElementById('searchResults');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = '<div class="p-4 text-gray-400 text-center">No results found</div>';
        } else {
            container.innerHTML = results.map(movie => `
                <div class="p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-700 last:border-b-0" onclick="streamHub.showMovieDetail(${movie.id}); streamHub.hideSearchResults();">
                    <div class="flex items-center space-x-3">
                        <img src="${movie.poster_path ? this.imageBaseUrl + movie.poster_path : 'https://via.placeholder.com/50x75?text=No+Image'}" 
                             alt="${movie.title}" class="w-12 h-18 object-cover rounded">
                        <div>
                            <h4 class="text-white font-medium">${movie.title}</h4>
                            <p class="text-gray-400 text-sm">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        container.style.display = 'block';
    }

    showSearchResults() {
        const container = document.getElementById('searchResults');
        const searchInput = document.getElementById('searchInput');
        if (container && searchInput && searchInput.value.length >= 2) {
            container.style.display = 'block';
        }
    }

    hideSearchResults() {
        const container = document.getElementById('searchResults');
        if (container) {
            container.style.display = 'none';
        }
    }

    async showMovieDetail(movieId) {
        try {
            const response = await fetch(`${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}`);
            const movie = await response.json();
            
            const modal = document.getElementById('movieModal');
            const modalContent = document.getElementById('modalContent');
            
            modalContent.innerHTML = `
                <div class="relative">
                    <img src="${movie.backdrop_path ? this.imageBaseUrl + movie.backdrop_path : 'https://via.placeholder.com/1200x600?text=No+Image'}" 
                         alt="${movie.title}" class="w-full h-96 object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                    <div class="absolute bottom-0 left-0 right-0 p-8">
                        <h2 class="text-4xl font-bold text-white mb-4">${movie.title}</h2>
                        <div class="flex items-center space-x-4 mb-4">
                            <span class="text-yellow-400">
                                <i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}
                            </span>
                            <span class="text-gray-300">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
                            <span class="text-gray-300">${movie.runtime} min</span>
                        </div>
                    </div>
                </div>
                <div class="p-8">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div class="lg:col-span-2">
                            <h3 class="text-2xl font-bold text-white mb-4">Overview</h3>
                            <p class="text-gray-300 mb-6">${movie.overview}</p>
                            
                            <div class="flex space-x-4 mb-6">
                                <button onclick="streamHub.playMovie(${movie.id})" class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all">
                                    <i class="fas fa-play mr-2"></i>Watch Now
                                </button>
                                <button onclick="streamHub.toggleWatchlist(${movie.id})" class="px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all">
                                    <i class="fas fa-bookmark mr-2"></i>Add to Watchlist
                                </button>
                            </div>
                        </div>
                        <div>
                            <h4 class="text-xl font-bold text-white mb-4">Movie Info</h4>
                            <div class="space-y-3">
                                <div>
                                    <span class="text-gray-400">Release Date:</span>
                                    <span class="text-white ml-2">${movie.release_date || 'N/A'}</span>
                                </div>
                                <div>
                                    <span class="text-gray-400">Genres:</span>
                                    <span class="text-white ml-2">${movie.genres ? movie.genres.map(g => g.name).join(', ') : 'N/A'}</span>
                                </div>
                                <div>
                                    <span class="text-gray-400">Budget:</span>
                                    <span class="text-white ml-2">$${movie.budget ? movie.budget.toLocaleString() : 'N/A'}</span>
                                </div>
                                <div>
                                    <span class="text-gray-400">Revenue:</span>
                                    <span class="text-white ml-2">$${movie.revenue ? movie.revenue.toLocaleString() : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            modal.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading movie details:', error);
            // Show mock data if API fails
            this.showMovieDetail(1);
        }
    }

    playMovie(movieId) {
        const modal = document.getElementById('videoModal');
        const videoPlayer = document.getElementById('mainVideoPlayer');
        const videoTitle = document.getElementById('videoTitle');
        
        // Use the actual vidking.net player with TMDB ID
        const playerUrl = `https://www.vidking.net/embed/movie/${movieId}?color=9146ff&autoPlay=true`;
        
        // Create iframe for the video player
        videoPlayer.innerHTML = `
            <iframe src="${playerUrl}" 
                    width="100%" 
                    height="100%" 
                    frameborder="0" 
                    allowfullscreen
                    allow="autoplay; encrypted-media">
            </iframe>
        `;
        
        videoTitle.textContent = `Movie ${movieId}`;
        modal.classList.remove('hidden');
        
        // Close movie detail modal if open
        this.closeModal();
        
        // Set up progress tracking
        this.setupProgressTracking();
    }
    
    setupProgressTracking() {
        window.addEventListener("message", function (event) {
            if (typeof event.data === "string") {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === "PLAYER_EVENT") {
                        console.log("Player Event:", data.data);
                        
                        // Store progress in localStorage
                        if (data.data.event === "timeupdate") {
                            const progressData = {
                                id: data.data.id,
                                progress: data.data.progress,
                                currentTime: data.data.currentTime,
                                duration: data.data.duration,
                                timestamp: Date.now()
                            };
                            localStorage.setItem(`movie_progress_${data.data.id}`, JSON.stringify(progressData));
                        }
                    }
                } catch (e) {
                    console.log("Message received from the player:", event.data);
                }
            }
        });
    }

    watchSport(sportId) {
        const modal = document.getElementById('videoModal');
        const videoPlayer = document.getElementById('mainVideoPlayer');
        const videoTitle = document.getElementById('videoTitle');
        
        // Mock live stream URL - in a real app, this would come from Streamed.pk API
        const streamUrl = 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4';
        
        videoPlayer.innerHTML = `
            <video controls autoplay class="w-full h-full">
                <source src="${streamUrl}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
        
        videoTitle.textContent = `Live Sports Event ${sportId}`;
        modal.classList.remove('hidden');
    }

    changeQuality(quality) {
        this.currentVideoQuality = quality;
        const buttons = document.querySelectorAll('.quality-selector button');
        buttons.forEach(btn => {
            btn.classList.remove('bg-blue-600');
            btn.classList.add('bg-gray-700');
        });
        
        event.target.classList.remove('bg-gray-700');
        event.target.classList.add('bg-blue-600');
        
        // In a real app, you would change the video source here
        console.log(`Changed quality to: ${quality}`);
    }

    toggleWatchlist(movieId) {
        const index = this.watchlist.indexOf(movieId);
        if (index > -1) {
            this.watchlist.splice(index, 1);
            this.showNotification('Removed from watchlist', 'success');
        } else {
            this.watchlist.push(movieId);
            this.showNotification('Added to watchlist', 'success');
        }
        localStorage.setItem('streamhub_watchlist', JSON.stringify(this.watchlist));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium transform translate-x-full transition-transform duration-300 ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    closeModal() {
        const modal = document.getElementById('movieModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    closeVideoModal() {
        const modal = document.getElementById('videoModal');
        const videoPlayer = document.getElementById('mainVideoPlayer');
        if (modal) {
            modal.classList.add('hidden');
            if (videoPlayer) {
                videoPlayer.pause();
            }
        }
    }

    initializeSplide() {
        const splide = document.getElementById('featuredMovies');
        if (splide && typeof Splide !== 'undefined') {
            new Splide(splide, {
                type: 'loop',
                perPage: 5,
                perMove: 1,
                gap: '1rem',
                autoplay: true,
                interval: 5000,
                breakpoints: {
                    1024: { perPage: 4 },
                    768: { perPage: 3 },
                    640: { perPage: 2 },
                    480: { perPage: 1 }
                }
            }).mount();
        }
    }

    // Mock data for demonstration
    getMockMovies() {
        return [
            { id: 1, title: "Inception", poster_path: "/9gk7adHYeDvHkCSE2Av0N1MIHZQt.jpg", backdrop_path: "/s3TshRGB4iBxP2lya4SehrH6v6M.jpg", vote_average: 8.8, release_date: "2010-07-16", overview: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O." },
            { id: 2, title: "The Dark Knight", poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", backdrop_path: "/nG5zmbVeY4r6GfVTJ5sX5fC7JdI.jpg", vote_average: 9.0, release_date: "2008-07-18", overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice." },
            { id: 3, title: "Interstellar", poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg", vote_average: 8.6, release_date: "2014-11-07", overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival." },
            { id: 4, title: "The Matrix", poster_path: "/f89U1ADr1oiT1k9EeLlk9JVgP9n.jpg", backdrop_path: "/lh5lbisD4Y9fEqibwTp8O1l7Ub1.jpg", vote_average: 8.7, release_date: "1999-03-31", overview: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers." },
            { id: 5, title: "Pulp Fiction", poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", backdrop_path: "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg", vote_average: 8.9, release_date: "1994-10-14", overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption." }
        ];
    }

    getMockSports() {
        return [
            { id: 1, sport: "Football", league: "Premier League", team1: "Liverpool", team2: "Manchester City", team1Logo: "https://via.placeholder.com/48?text=LIV", team2Logo: "https://via.placeholder.com/48?text=MCI", score: "2-1", time: "78'", icon: "football-ball" },
            { id: 2, sport: "Basketball", league: "NBA", team1: "Lakers", team2: "Warriors", team1Logo: "https://via.placeholder.com/48?text=LAL", team2Logo: "https://via.placeholder.com/48?text=GSW", score: "108-102", time: "Q4 5:23", icon: "basketball-ball" },
            { id: 3, sport: "Tennis", league: "Wimbledon", team1: "Djokovic", team2: "Nadal", team1Logo: "https://via.placeholder.com/48?text=ND", team2Logo: "https://via.placeholder.com/48?text=RN", score: "6-4, 3-6", time: "Set 3", icon: "table-tennis" },
            { id: 4, sport: "Cricket", league: "IPL", team1: "Mumbai", team2: "Chennai", team1Logo: "https://via.placeholder.com/48?text=MI", team2Logo: "https://via.placeholder.com/48?text=CSK", score: "156/4", time: "18.2 Overs", icon: "cricket" },
            { id: 5, sport: "Football", league: "La Liga", team1: "Barcelona", team2: "Real Madrid", team1Logo: "https://via.placeholder.com/48?text=BAR", team2Logo: "https://via.placeholder.com/48?text=RMA", score: "1-1", time: "65'", icon: "football-ball" },
            { id: 6, sport: "Basketball", league: "EuroLeague", team1: "Real Madrid", team2: "Olympiacos", team1Logo: "https://via.placeholder.com/48?text=RMB", team2Logo: "https://via.placeholder.com/48?text=OLY", score: "85-79", time: "Q3 2:15", icon: "basketball-ball" }
        ];
    }
}

// Global functions for HTML onclick handlers
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        item.classList.add('text-gray-300');
    });
    
    // Update active nav item
    const navItems = {
        'dashboard': 0,
        'movies': 1,
        'sports': 2,
        'search': 3,
        'watchlist': 4
    };
    
    const activeIndex = navItems[sectionName];
    if (activeIndex !== undefined) {
        const navItem = document.querySelectorAll('.nav-item')[activeIndex];
        if (navItem) {
            navItem.classList.add('active');
            navItem.classList.remove('text-gray-300');
            navItem.classList.add('text-white');
        }
    }
    
    // Load content based on section
    if (sectionName === 'movies') {
        streamHub.loadMovies(1);
    } else if (sectionName === 'sports') {
        streamHub.loadLiveSports();
    } else if (sectionName === 'watchlist') {
        streamHub.loadWatchlist();
    }
}

function closeModal() {
    streamHub.closeModal();
}

function closeVideoModal() {
    streamHub.closeVideoModal();
}

// Initialize the app
const streamHub = new StreamHub();

// Add scroll animations
window.addEventListener('scroll', () => {
    const elements = document.querySelectorAll('.movie-card, .glass-effect');
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
});

// Initialize animations on page load
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.movie-card, .glass-effect');
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
});