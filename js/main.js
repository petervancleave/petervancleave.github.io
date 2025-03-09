class BlogManager {
    constructor() {
        // Prevent multiple instances
        if (BlogManager.instance) {
            return BlogManager.instance;
        }
        BlogManager.instance = this;

        this.initialized = false;
        this.postsContainer = document.getElementById('recent-writeups');
        this.init();
    }

    async init() {
        if (this.initialized) return;
        
        try {
            const posts = await this.fetchPosts();
            await this.displayRecentPosts(posts.posts);
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing blog:', error);
        }
    }

    async fetchPosts() {
        try {
            const response = await fetch('./posts/index.json');
            if (!response.ok) throw new Error('Failed to fetch posts index');
            return await response.json();
        } catch (error) {
            console.error('Error fetching posts:', error);
            return { posts: [] };
        }
    }

    async fetchPostContent(filename) {
        try {
            const response = await fetch(`./posts/${filename}`);
            if (!response.ok) throw new Error('Failed to fetch post content');
            return await response.text();
        } catch (error) {
            console.error('Error fetching post content:', error);
            return null;
        }
    }

    estimateReadTime(content) {
        const wordsPerMinute = 200;
        const words = content.split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    }

    getCategoryImage(category) {
        const imagePath = `./images/categories/${category.toLowerCase().replace(' ', '-')}.jpg`;
        return imagePath;
    }

    async displayRecentPosts(posts) {
        if (!this.postsContainer) return;

        // Sort posts by date (newest first) and take the first 3
        const recentPosts = posts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);

        // Clear existing content
        this.postsContainer.innerHTML = '';

        // Create and append all cards at once
        const fragment = document.createDocumentFragment();

        recentPosts.forEach(writeup => {
            const article = document.createElement('article');
            article.className = 'writeup-card';
            
            // Format the date once
            const formattedDate = new Date(writeup.date + 'T12:00:00').toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            article.innerHTML = `
                <a href="./post.html?id=${encodeURIComponent(writeup.filename)}" class="card-link">
                    <img src="${this.getCategoryImage(writeup.category)}" 
                         alt="${writeup.category}"
                         onerror="this.src='./images/categories/misc.jpg'"
                         loading="lazy">
                    <div class="writeup-content">
                        <div class="writeup-date">${formattedDate}</div>
                        <h3 class="writeup-title">${writeup.title}</h3>
                        <div class="writeup-tags" onclick="event.stopPropagation()">
                            ${writeup.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        <span class="read-more">
                            Read Writeup →
                        </span>
                    </div>
                </a>
            `;
            fragment.appendChild(article);
        });

        // Add all cards to the DOM at once
        this.postsContainer.appendChild(fragment);
    }
}

// Initialize the blog manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BlogManager();

    // Theme switching functionality
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    function updateTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (window.watercolorEffect) {
            window.watercolorEffect.updateTheme(theme);
        }
        localStorage.setItem('theme', theme);
    }

    // Initialize theme based on saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        updateTheme(savedTheme);
    } else if (prefersDarkScheme.matches) {
        updateTheme('dark');
    } else {
        updateTheme('light');
    }

    // Handle theme toggle clicks
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        updateTheme(newTheme);
    });

    // Handle system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        const newTheme = e.matches ? 'dark' : 'light';
        updateTheme(newTheme);
    });
});

// Navbar visibility
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScrollTop > lastScrollTop) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScrollTop = currentScrollTop;
}); 