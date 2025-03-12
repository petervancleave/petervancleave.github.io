class WatercolorEffect {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.watercolorBg = document.querySelector('.watercolor-bg');
        this.particles = [];
        this.raindrops = [];
        this.mouse = { x: 0, y: 0, moved: false };
        this.isAnimating = true;

        // Light theme colors (blues and teals)
        this.lightColors = [
            { r: 0, g: 119, b: 182, a: 0.12 },   // Deep Blue
            { r: 3, g: 169, b: 244, a: 0.12 },   // Light Blue
            { r: 0, g: 150, b: 199, a: 0.12 },   // Ocean Blue
            { r: 0, g: 188, b: 212, a: 0.12 },   // Cyan
            { r: 0, g: 150, b: 136, a: 0.12 },   // Teal
            { r: 77, g: 208, b: 225, a: 0.12 }   // Light Cyan
        ];

        this.lightBaseColors = [
            { r: 0, g: 119, b: 182, a: 0.08 },   // Base Deep Blue
            { r: 0, g: 150, b: 199, a: 0.08 },   // Base Ocean Blue
            { r: 0, g: 150, b: 136, a: 0.08 }    // Base Teal
        ];

        // Dark theme colors (navy focused palette)
        this.darkColors = [
            { r: 30, g: 45, b: 90, a: 0.15 },    // Deep Navy
            { r: 40, g: 60, b: 110, a: 0.15 },   // Royal Navy
            { r: 50, g: 75, b: 130, a: 0.15 },   // Medium Navy
            { r: 60, g: 90, b: 150, a: 0.15 },   // Bright Navy
            { r: 70, g: 105, b: 170, a: 0.15 },  // Light Navy
            { r: 80, g: 120, b: 190, a: 0.15 }   // Sky Navy
        ];

        this.darkBaseColors = [
            { r: 30, g: 45, b: 90, a: 0.10 },    // Base Deep Navy
            { r: 50, g: 75, b: 130, a: 0.10 },   // Base Medium Navy
            { r: 70, g: 105, b: 170, a: 0.10 }   // Base Light Navy
        ];

        // Set initial colors based on system preference or saved theme
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDarkTheme = savedTheme === 'dark' || (!savedTheme && prefersDark);
        
        this.colors = isDarkTheme ? this.darkColors : this.lightColors;
        this.baseColors = isDarkTheme ? this.darkBaseColors : this.lightBaseColors;

        this.lastTime = 0;
        this.colorTransitionProgress = 0;
        this.currentColorIndex = 0;
        this.colorOffset = 0;
        
        window.watercolorEffect = this;
        this.init();
    }

    updateTheme(theme) {
        const newColors = theme === 'dark' ? this.darkColors : this.lightColors;
        const newBaseColors = theme === 'dark' ? this.darkBaseColors : this.lightBaseColors;
        
        // Force immediate color update
        this.colors = [...newColors];
        this.baseColors = [...newBaseColors];
        
        // Reset particles and raindrops with new colors
        this.particles.forEach(particle => {
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            particle.color = { ...color };
        });
        
        this.raindrops.forEach(raindrop => {
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const nextColor = this.colors[Math.floor(Math.random() * this.colors.length)];
            raindrop.color = { ...color };
            raindrop.nextColor = { ...nextColor };
        });
    }

    init() {
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.watercolorBg.appendChild(this.canvas);

        this.resize();
        this.createParticles();
        this.createRaindrops(); // Initialize raindrops
        this.animate();
        this.setupEventListeners();

        this.handleResize();
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        this.particles.forEach(particle => {
            if (particle.x > width) particle.x = width - particle.radius;
            if (particle.y > height) particle.y = height - particle.radius;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createRaindrops() {
        const numRaindrops = Math.min(30, (window.innerWidth * window.innerHeight) / 50000);
        for (let i = 0; i < numRaindrops; i++) {
            this.raindrops.push(this.createRaindrop());
        }
    }

    createRaindrop() {
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const nextColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            radius: 2 + Math.random() * 3,
            minRadius: 1.5 + Math.random() * 2,
            maxRadius: 3 + Math.random() * 4,
            radiusPhase: Math.random() * Math.PI * 2,
            color: color,
            nextColor: nextColor,
            colorTransition: 0,
            speed: 0.1 + Math.random() * 0.15,
            alpha: 0.2 + Math.random() * 0.3,
            angle: Math.random() * Math.PI * 2,
            angleSpeed: (Math.random() - 0.5) * 0.02,
            sinOffset: Math.random() * Math.PI * 2,
            pulseSpeed: 0.002 + Math.random() * 0.002
        };
    }

    createParticles() {
        this.particles = [];
        const numParticles = Math.min(50, (window.innerWidth * window.innerHeight) / 25000);

        for (let i = 0; i < numParticles; i++) {
            this.particles.push(this.createParticle(null, null, false, Math.random() < 0.3));
        }
    }

    createParticle(x = null, y = null, isMouseParticle = false, isFloating = false) {
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const baseSize = Math.min(window.innerWidth, window.innerHeight);
        const maxRadius = baseSize * (isFloating ? 0.15 : 0.25); // Floating particles are smaller
        
        return {
            x: x || Math.random() * window.innerWidth,
            y: y || Math.random() * window.innerHeight,
            radius: isMouseParticle ? 
                   maxRadius * 0.2 : 
                   maxRadius * (0.4 + Math.random() * 0.6),
            color: color,
            vx: (Math.random() - 0.5) * (isFloating ? 0.2 : 0.3),
            vy: (Math.random() - 0.5) * (isFloating ? 0.2 : 0.3),
            targetRadius: isMouseParticle ? maxRadius * 0.2 : maxRadius * (0.4 + Math.random() * 0.6),
            life: isMouseParticle ? 150 : Infinity,
            alpha: color.a,
            rotation: Math.random() * Math.PI * 2,
            angularVelocity: (Math.random() - 0.5) * 0.008,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.015,
            isFloating: isFloating,
            floatAngle: Math.random() * Math.PI * 2,
            floatSpeed: 0.0005 + Math.random() * 0.001
        };
    }

    drawParticle(particle) {
        this.ctx.save();
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);

        // Add pulsing effect to the radius
        const pulseAmount = Math.sin(particle.pulsePhase) * 20;
        const currentRadius = particle.radius + pulseAmount;
        
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, currentRadius);
        gradient.addColorStop(0, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.alpha})`);
        gradient.addColorStop(0.5, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    updateParticle(particle, deltaTime) {
        if (particle.isFloating) {
            // Autonomous floating movement
            particle.floatAngle += particle.floatSpeed * deltaTime;
            particle.vx += Math.cos(particle.floatAngle) * 0.0001 * deltaTime;
            particle.vy += Math.sin(particle.floatAngle) * 0.0001 * deltaTime;
        }

        // Update position with smoother movement
        particle.x += particle.vx * (deltaTime || 16) * 0.05;
        particle.y += particle.vy * (deltaTime || 16) * 0.05;
        particle.rotation += particle.angularVelocity * (deltaTime || 16) * 0.05;
        particle.pulsePhase += particle.pulseSpeed * 0.5;

        // Wrap around edges
        if (particle.x < -particle.radius) particle.x = this.canvas.width + particle.radius;
        if (particle.x > this.canvas.width + particle.radius) particle.x = -particle.radius;
        if (particle.y < -particle.radius) particle.y = this.canvas.height + particle.radius;
        if (particle.y > this.canvas.height + particle.radius) particle.y = -particle.radius;

        // Mouse interaction
        if (this.mouse.moved) {
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 250;

            if (distance < maxDistance) {
                const force = (1 - distance / maxDistance) * (particle.isFloating ? 0.01 : 0.02);
                particle.vx += dx * force;
                particle.vy += dy * force;
            }
        }

        // Apply velocity damping
        particle.vx *= 0.97;
        particle.vy *= 0.97;

        // Update life for mouse particles
        if (particle.life !== Infinity) {
            particle.life--;
            particle.alpha = (particle.life / 150) * particle.color.a;
            return particle.life > 0;
        }
        return true;
    }

    updateRaindrop(raindrop, deltaTime) {
        // Update movement angle for wandering effect
        raindrop.angle += raindrop.angleSpeed;
        raindrop.sinOffset += 0.02;

        // Update color transition
        raindrop.colorTransition += 0.001 * deltaTime;
        if (raindrop.colorTransition >= 1) {
            raindrop.colorTransition = 0;
            raindrop.color = raindrop.nextColor;
            raindrop.nextColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        }

        // Update radius with smooth pulsing
        raindrop.radiusPhase += raindrop.pulseSpeed * deltaTime;
        const radiusT = (Math.sin(raindrop.radiusPhase) + 1) / 2;
        raindrop.radius = raindrop.minRadius + (raindrop.maxRadius - raindrop.minRadius) * radiusT;

        // Combine vertical movement with sine wave for floating effect
        const horizontalMovement = Math.cos(raindrop.sinOffset) * 0.5;
        
        // Update position with combined movements
        raindrop.x += Math.cos(raindrop.angle) * raindrop.speed + horizontalMovement;
        raindrop.y += (Math.sin(raindrop.angle) * raindrop.speed * 0.5) + (raindrop.speed * 0.7);

        // Wrap around screen edges
        if (raindrop.y > window.innerHeight + 10) {
            raindrop.y = -10;
            raindrop.x = Math.random() * window.innerWidth;
        }
        if (raindrop.x < -10) raindrop.x = window.innerWidth + 10;
        if (raindrop.x > window.innerWidth + 10) raindrop.x = -10;

        // Randomly change direction occasionally
        if (Math.random() < 0.001) {
            raindrop.angleSpeed = (Math.random() - 0.5) * 0.02;
        }

        return {
            currentColor: {
                r: Math.round(this.lerp(raindrop.color.r, raindrop.nextColor.r, raindrop.colorTransition)),
                g: Math.round(this.lerp(raindrop.color.g, raindrop.nextColor.g, raindrop.colorTransition)),
                b: Math.round(this.lerp(raindrop.color.b, raindrop.nextColor.b, raindrop.colorTransition)),
                a: this.lerp(raindrop.color.a, raindrop.nextColor.a, raindrop.colorTransition)
            }
        };
    }

    animate(currentTime = 0) {
        if (!this.isAnimating) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Smooth color transition for background
        this.colorOffset += deltaTime * 0.00005;
        const gradientColors = this.getGradientColors(this.colorOffset);
        
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, gradientColors.color1);
        gradient.addColorStop(1, gradientColors.color2);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw raindrops (spores) with soft glow
        this.ctx.save();
        this.ctx.filter = 'blur(2px)';
        this.raindrops.forEach(raindrop => {
            const { currentColor } = this.updateRaindrop(raindrop, deltaTime);
            
            const gradient = this.ctx.createRadialGradient(
                raindrop.x, raindrop.y, 0,
                raindrop.x, raindrop.y, raindrop.radius * 2.5
            );
            
            gradient.addColorStop(0, `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${raindrop.alpha})`);
            gradient.addColorStop(0.5, `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${raindrop.alpha * 0.5})`);
            gradient.addColorStop(1, `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, 0)`);
            
            this.ctx.beginPath();
            this.ctx.fillStyle = gradient;
            this.ctx.arc(raindrop.x, raindrop.y, raindrop.radius * 2.5, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.restore();

        // Update and draw particles
        this.particles = this.particles.filter((particle, index) => {
            if (this.updateParticle(particle, deltaTime)) {
                this.drawParticle(particle);
                return true;
            }
            return false;
        });

        this.mouse.moved = false;
        requestAnimationFrame((time) => this.animate(time));
    }

    getGradientColors(offset) {
        const t = (Math.sin(offset) + 1) / 2; // Smooth oscillation between 0 and 1
        const baseColorsCount = this.baseColors.length;
        
        const index1 = Math.floor(offset % baseColorsCount);
        const index2 = (index1 + 1) % baseColorsCount;
        const index3 = (index2 + 1) % baseColorsCount;
        
        const color1 = this.baseColors[index1];
        const color2 = this.baseColors[index2];
        const color3 = this.baseColors[index3];
        
        // Interpolate between three colors
        const r1 = Math.round(this.lerp(color1.r, color2.r, t));
        const g1 = Math.round(this.lerp(color1.g, color2.g, t));
        const b1 = Math.round(this.lerp(color1.b, color2.b, t));
        
        const r2 = Math.round(this.lerp(color2.r, color3.r, t));
        const g2 = Math.round(this.lerp(color2.g, color3.g, t));
        const b2 = Math.round(this.lerp(color2.b, color3.b, t));
        
        return {
            color1: `rgba(${r1}, ${g1}, ${b1}, 0.15)`,
            color2: `rgba(${r2}, ${g2}, ${b2}, 0.15)`
        };
    }

    lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.handleResize();
            this.createParticles();
        });
        
        window.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            this.mouse.moved = true;

            // Add new particles on mouse move with a rate limit
            if (Math.random() < 0.2) {
                this.particles.push(this.createParticle(this.mouse.x, this.mouse.y, true));
            }
        });

        // Clean up old mouse particles and maintain minimum particle count
        setInterval(() => {
            this.particles = this.particles.filter(p => p.life === Infinity || p.life > 0);
            const minParticles = Math.min(50, (window.innerWidth * window.innerHeight) / 25000);
            while (this.particles.length < minParticles) {
                this.particles.push(this.createParticle());
            }
        }, 1000);
    }
}

// Initialize the effect when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WatercolorEffect();
}); 