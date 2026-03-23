// ==========================================
// 1. BOOT SEQUENCE & SECURE UI LOGIC
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const initVideo = document.getElementById('init-video');
    
    const shouldBypass = sessionStorage.getItem('astra_bypass_loader') === 'true';

    if (loader) {
        if (shouldBypass) {
            loader.style.transition = 'none';
            loader.style.display = 'none';
            sessionStorage.removeItem('astra_bypass_loader');
        } else {
            const hideLoader = () => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 1000);
            };

            if (initVideo) {
                // Hide when video ends
                initVideo.onended = hideLoader;
                
                // Safety fallback (in case video fails to play or end)
                setTimeout(hideLoader, 10000); 
            } else {
                // Fallback for missing video
                setTimeout(hideLoader, 3500);
            }
        }
    }
});

// Listener to catch the navigation to Architects and set the bypass flag
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href') === 'team.html') {
        sessionStorage.setItem('astra_bypass_loader', 'true');
    }
});




// ==========================================
// 1.5 INTERACTIVE CARD GLOW
// ==========================================
document.querySelectorAll('.neo-card').forEach(card => {
    const video = card.querySelector('.card-video');
    
    // Scroll-triggered 3D entry is handled by the IntersectionObserver below
    // But we still want some subtle hover tilt, but without the lighting effect
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (centerY - y) / 15;
        const rotateY = (x - centerX) / 15;
        
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        
        // Play video on first hover attempt if not already playing
        if (video && video.paused) {
            video.play().catch(() => {}); // Catch browser autoplay blocks
        }
    });

    card.addEventListener('mouseenter', () => {
        if (video) {
            video.currentTime = 0;
            video.play().catch(() => {});
        }
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
        if (video) {
            video.pause();
            video.currentTime = 0; // Reset to start
        }
    });

    // Ensure clicking also triggers playback for touch devices
    card.addEventListener('click', () => {
        if (video && video.paused) {
            video.play().catch(() => {});
        } else if (video) {
            video.pause();
        }
    });
});

// ==========================================
// 1.6 CARD DATA RAIN EFFECT
// ==========================================
document.querySelectorAll('.neo-card').forEach(card => {
    const canvas = card.querySelector('.card-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let chars = "0101ASTRA01";
    chars = chars.split("");
    
    let fontSize = 14;
    let columns;
    let drops = [];

    function init() {
        canvas.width = card.offsetWidth;
        canvas.height = card.offsetHeight;
        columns = canvas.width / fontSize;
        drops = [];
        for (let i = 0; i < columns; i++) drops[i] = 1;
    }

    function draw() {
        ctx.fillStyle = "rgba(26, 5, 5, 0.1)"; // Match theme background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "rgba(255, 59, 48, 0.15)"; // Theme blood-red data
        ctx.font = fontSize + "px monospace";
        
        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    init();
    setInterval(draw, 50);
    window.addEventListener('resize', init);
});

// ==========================================
// 2. PARALLAX STARFIELD GENERATOR
// ==========================================
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];

function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    stars = [];
    // Create 3 layers of stars for depth
    for (let i = 0; i < 300; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.5,
            vx: Math.random() * 0.2 - 0.1,  // Very slow drift
            vy: Math.random() * 0.2 - 0.1,
            depth: Math.random() * 3 // Depth 0 to 3 for parallax
        });
    }
}

// Subtly react to mouse position for parallax
let mouseX = 0;
let mouseY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - width / 2) * 0.05; // Smoothing factor
    mouseY = (e.clientY - height / 2) * 0.05;
});

function animateStars() {
    ctx.clearRect(0, 0, width, height);

    // Draw space background softly
    ctx.fillStyle = '#030305';
    ctx.fillRect(0, 0, width, height);

    stars.forEach(star => {
        // Base movement
        star.x += star.vx;
        star.y += star.vy;

        // Parallax offset based on depth and page scroll
        let scrollParallaxY = window.scrollY * 0.15; // Vertical scroll parallax modifier
        let px = star.x - (mouseX * star.depth);
        let py = star.y - (mouseY * star.depth) - (scrollParallaxY * star.depth);

        // Wrap around logic
        if (px < 0) star.x = width;
        if (px > width) star.x = 0;
        if (py < 0) star.y = height;
        if (py > height) star.y = 0;

        ctx.beginPath();
        ctx.arc(px, py, star.radius, 0, Math.PI * 2);

        // Randomly flicker some stars by occasionally changing color to cyan
        if (Math.random() > 0.995) {
            ctx.fillStyle = '#00F0FF';
        } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + (star.depth * 0.2)})`;
        }

        ctx.fill();
    });

    requestAnimationFrame(animateStars);
}

window.addEventListener('resize', initCanvas);
initCanvas();
animateStars();

// ==========================================
// 3. UI INTERACTIONS (NAV, SCROLL REVEALS, PARALLAX)
// ==========================================
const navbar = document.getElementById('navbar');
const mobileToggle = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');

// Parallax Elements
const parallaxPlanet = document.getElementById('parallax-planet');
const heroContent = document.querySelector('.hero-content');

// Blur navbar on scroll & Parallax
window.addEventListener('scroll', () => {
    let scrollY = window.scrollY;

    if (scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    // Parallax logic
    if (parallaxPlanet) {
        // Move planet much slower and scale it up less aggressively
        let scaleVal = 1 + (scrollY * 0.0006);
        parallaxPlanet.style.transform = `translateY(${scrollY * 0.15}px) scale(${scaleVal})`;
    }

    // Hero Text Fade and Parallax
    if (heroContent) {
        let opacityVal = 1 - (scrollY / 500); // Fade out completely by 500px scroll
        heroContent.style.opacity = Math.max(0, opacityVal);
        heroContent.style.transform = `translateY(${scrollY * 0.4}px)`; // Faster float downwards to disappear
    }
});

// Mobile menu
mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close menu on link click
document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// ==========================================
// 4. ORBITAL MAP INTERACTIONS
// ==========================================
document.querySelectorAll('.satellite').forEach(sat => {
    sat.addEventListener('click', (e) => {
        e.stopPropagation(); // Don't trigger parents
        
        // Remove active from others
        document.querySelectorAll('.satellite').forEach(s => {
            if (s !== sat) s.classList.remove('active');
        });
        
        // Toggle this one
        sat.classList.toggle('active');
    });
});

// Close panels when clicking elsewhere
document.addEventListener('click', () => {
    document.querySelectorAll('.satellite').forEach(s => s.classList.remove('active'));
});

// Intersection Observer for Scroll Reveals
const revealElements = document.querySelectorAll('.reveal-scroll');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Depending on design, you could unobserve after revealing
            // revealObserver.unobserve(entry.target); 
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(el => revealObserver.observe(el));

// ==========================================
// 5. CORE DIRECTIVES (CARD VIDEOS)
// ==========================================
document.querySelectorAll('.neo-card').forEach(card => {
    const video = card.querySelector('.card-video');
    
    if (video) {
        // Play on Hover
        card.addEventListener('mouseenter', () => {
            video.play().catch(e => console.log("Video play prevented:", e));
        });
        
        // Pause and reset on Leave
        card.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
        
        // Mobile Toggle (Click)
        card.addEventListener('click', () => {
            if (video.paused) {
                // Pause all other videos first
                document.querySelectorAll('.card-video').forEach(v => {
                    v.pause();
                    v.currentTime = 0;
                });
                video.play();
            } else {
                video.pause();
            }
        });
    }
});

// Legacy Modal Logic Removed: Replaced by Holographic Planet Info Panels

// ==========================================
// 4. DATA NEXUS (MANUAL ARCHIVE MANAGEMENT)
// ==========================================


// --- VISUAL ARCHIVE (GALLERY) ---
const galleryContainer = document.getElementById('gallery-container');

/**
 * AUTO-ARCHIVE SCANNER
 * This logic automatically looks for images named image1.jpg, image2.jpg, etc.
 * in the 'nexus_images' folder. To add a photo, just name it image[number].jpg
 * and save it to that folder.
 */
const MAX_SCAN_LIMIT = 20; // Number of image slots to check

async function renderGallery() {
    if (!galleryContainer) return;

    galleryContainer.innerHTML = '';
    galleryContainer.classList.add('photo-scroll');

    let foundImages = 0;

    for (let i = 1; i <= MAX_SCAN_LIMIT; i++) {
        const filename = `image${i}.jpg`;
        const imgPath = `nexus_images/${filename}`;

        const testImg = new Image();
        testImg.src = imgPath;

        const exists = await new Promise((resolve) => {
            testImg.onload = () => resolve(true);
            testImg.onerror = () => resolve(false);
        });

        if (exists) {
            foundImages++;
            const item = document.createElement('div');
            item.className = 'gal-item';
            
            item.innerHTML = `
                <div class="image-wrapper">
                    <div class="shine-layer"></div>
                    <div class="orbit-path">
                        <i class="fas fa-user-astronaut mini-astronaut"></i>
                    </div>
                    <img src="${imgPath}" alt="Astra Visual ${i}">
                </div>
            `;
            galleryContainer.appendChild(item);
            
            const wrapper = item.querySelector('.image-wrapper');
            const shine = item.querySelector('.shine-layer');

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                    } else {
                        entry.target.classList.remove('in-view');
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(item);

            // --- THE "POWER" SCROLL-BOUND 3D LOGIC ---
            // This makes the images tilt automatically as they move on screen
            window.addEventListener('scroll', () => {
                const rect = item.getBoundingClientRect();
                const viewHeight = window.innerHeight;
                
                // Calculate percentage of position from screen center (-1 to 1)
                const relativePos = ((rect.top + rect.height / 2) - viewHeight / 2) / (viewHeight / 2);
                
                // Only animate if it's somewhat in view
                if (Math.abs(relativePos) < 1.5) {
                    const tiltX = relativePos * 25; // Tilt forward/back up to 25deg
                    const rotateY = -relativePos * 10; // Subtle side rotation
                    const translateZ = Math.abs(relativePos) * -150; // Move back as it leaves center
                    const scale = 1 - (Math.abs(relativePos) * 0.1); // Slightly scale down

                    // Update the image wrapper
                    wrapper.style.transform = `rotateX(${tiltX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`;
                    
                    // Update the reflection (shine) to match the light source at the top
                    const shineY = 50 + (relativePos * 50);
                    shine.style.background = `radial-gradient(circle at 50% ${shineY}%, rgba(0, 240, 255, 0.4) 0%, transparent 70%)`;
                    shine.style.opacity = 1 - (Math.abs(relativePos) * 0.5);
                }
            });
        }
    }

    if (foundImages === 0) {
        galleryContainer.innerHTML = '<div class="empty-state">NO VISUALS RECORDED. ADD image1.jpg, image2.jpg, ETC. TO THE NEXUS_IMAGES FOLDER.</div>';
    }

    // AOS Logic Removed: Replaced by custom IntersectionObservers
}

// Initial Render Calls
renderGallery();
