/**
 * favicon.js - Dynamic favicon with fallback for search engines
 * Provides both static SVG for SEO and dynamic animations for users
 */

// Helper: read CSS custom properties with fallbacks
function getCSSVar(name, fallback) {
    if (typeof window === 'undefined' || !window.getComputedStyle) return fallback;
    const v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return v ? v.trim() || fallback : fallback;
}

const COLORS = {
    accent: getCSSVar('--accent', '#5f738a'),
    accentHover: getCSSVar('--accent-hover', '#758aa3'),
    textPrimary: getCSSVar('--text-primary', '#eef1f4')
};

const Favicon = {
    // Static fallback for search engines
    staticFavicon: {
        create: function () {
            const svg = `<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="spiralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="${COLORS.accent}"/>
                        <stop offset="50%" stop-color="${COLORS.accentHover}"/>
                        <stop offset="100%" stop-color="${COLORS.textPrimary}"/>
                    </linearGradient>
                </defs>
                <path d="M16,4 Q24,8 28,16 Q24,24 16,28 Q8,24 4,16 Q8,8 16,4" 
                    fill="none" stroke="url(#spiralGradient)" stroke-width="2"/>
            </svg>`;

            const blob = new Blob([svg], { type: 'image/svg+xml' });
            return URL.createObjectURL(blob);
        }
    },

    // Dynamic animations
    animations: {
        spiral: function (time) {
            const rotation = (time / 20) % 360;

            const content = `
                <defs>
                    <linearGradient id="spiralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="${COLORS.accent}"/>
                        <stop offset="50%" stop-color="${COLORS.accentHover}"/>
                        <stop offset="100%" stop-color="${COLORS.textPrimary}"/>
                    </linearGradient>
                </defs>
                <g transform="rotate(${rotation} 16 16)">
                    <path d="M16,4 Q24,8 28,16 Q24,24 16,28 Q8,24 4,16 Q8,8 16,4" 
                        fill="none" stroke="url(#spiralGradient)" stroke-width="2"/>
                </g>
            `;

            return Favicon._createSVG(content);
        },

        pulse: function (time) {
            const scale = 0.8 + 0.2 * Math.sin(time / 100);
            const content = `
                <circle cx="16" cy="16" r="${12 * scale}" fill="${COLORS.accent}"/>
                <circle cx="16" cy="16" r="${6 * scale}" fill="white" opacity="0.3"/>
            `;

            return Favicon._createSVG(content);
        }
    },

    // Internal helper
    _createSVG: function (content) {
        const svg = `<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        return URL.createObjectURL(blob);
    },

    // Update the favicon
    update: function (animationType = null) {
        let url;

        if (animationType && Favicon.animations[animationType]) {
            const time = Date.now();
            url = Favicon.animations[animationType](time);
        } else {
            url = Favicon.staticFavicon.create();
        }

        Favicon._setFavicon(url);
    },

    // Set the favicon in the document
    _setFavicon: function (url) {
        // Remove existing favicon links
        document.querySelectorAll("link[rel*='icon']").forEach(link => link.remove());

        // Create new favicon link
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = url;
        link.type = 'image/svg+xml';

        document.head.appendChild(link);
    },

    // Start animation
    startAnimation: function (type = 'spiral', interval = 50) {
        Favicon.stopAnimation();

        Favicon._animationInterval = setInterval(() => {
            Favicon.update(type);
        }, interval);
    },

    // Stop animation
    stopAnimation: function () {
        if (Favicon._animationInterval) {
            clearInterval(Favicon._animationInterval);
            Favicon._animationInterval = null;
        }
        Favicon.update(); // Reset to static
    },

    // Initialize with static favicon
    init: function () {
        // Set static favicon first for SEO
        Favicon.update();

        // Start animation after a short delay
        setTimeout(() => {
            Favicon.startAnimation('spiral');
        }, 1000);
    }
};

// Auto-initialize if included in browser
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', Favicon.init);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Favicon;
}