// Global State
let currentSlide = 0;
let noClickCount = 0;
let yesScale = 1;
let isTransitioning = false;
let touchStart = null;
let touchEnd = null;

// Minimum swipe distance (in px)
const minSwipeDistance = 50;

// DOM Elements
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const progressFill = document.getElementById('progressFill');
const backBtn = document.getElementById('backBtn');
const customAlert = document.getElementById('customAlert');
const alertTitle = document.getElementById('alertTitle');
const alertMessage = document.getElementById('alertMessage');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingBarFill = document.getElementById('loadingBarFill');
const loadingError = document.getElementById('loadingError');

// Buttons
const beginBtn = document.getElementById('beginBtn');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const goBackBtn = document.getElementById('goBackBtn');
const continueToGalleryBtn = document.getElementById('continueToGalleryBtn');
const continueToMessagesBtn = document.getElementById('continueToMessagesBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    setupEventListeners();
    
    // Auto-advance to proposal after 5 seconds
    setTimeout(() => {
        navigateToSlide(1);
    }, 5000);
});

// Setup Event Listeners
function setupEventListeners() {
    // Button clicks
    beginBtn.addEventListener('click', () => navigateToSlide(1));
    yesBtn.addEventListener('click', handleYesClick);
    noBtn.addEventListener('click', handleNoClick);
    goBackBtn.addEventListener('click', handleGoBack);
    continueToGalleryBtn.addEventListener('click', () => navigateToSlide(4));
    continueToMessagesBtn.addEventListener('click', () => navigateToSlide(5));
    
    // Touch events for mobile
    beginBtn.addEventListener('touchend', (e) => { e.preventDefault(); navigateToSlide(1); });
    yesBtn.addEventListener('touchend', (e) => { e.preventDefault(); handleYesClick(); });
    noBtn.addEventListener('touchend', (e) => { e.preventDefault(); handleNoClick(); });
    goBackBtn.addEventListener('touchend', (e) => { e.preventDefault(); handleGoBack(); });
    continueToGalleryBtn.addEventListener('touchend', (e) => { e.preventDefault(); navigateToSlide(4); });
    continueToMessagesBtn.addEventListener('touchend', (e) => { e.preventDefault(); navigateToSlide(5); });
    
    // Back button
    backBtn.addEventListener('click', () => {
        if (currentSlide === 3) {
            navigateToSlide(0); // From letter page, go to home
        } else {
            navigateToSlide(currentSlide - 1);
        }
    });
    
    // Navigation dots
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const slideIndex = parseInt(dot.dataset.slide);
            if (slideIndex !== 2) { // Don't allow direct navigation to error page
                navigateToSlide(slideIndex);
            }
        });
        
        dot.addEventListener('touchend', (e) => {
            e.preventDefault();
            const slideIndex = parseInt(dot.dataset.slide);
            if (slideIndex !== 2) {
                navigateToSlide(slideIndex);
            }
        });
    });
    
    // Touch/Swipe events
    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);
}

// Touch Handlers
function onTouchStart(e) {
    touchEnd = null;
    touchStart = e.touches[0].clientX;
}

function onTouchMove(e) {
    touchEnd = e.touches[0].clientX;
}

function onTouchEnd() {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentSlide < 5 && currentSlide !== 2) {
        navigateToSlide(currentSlide + 1);
    }
    if (isRightSwipe && currentSlide > 0 && currentSlide !== 2) {
        if (currentSlide === 3) {
            navigateToSlide(0);
        } else {
            navigateToSlide(currentSlide - 1);
        }
    }
}

// Navigation
function navigateToSlide(index) {
    if (index === 2 || isTransitioning) return; // Block error page from direct navigation
    
    isTransitioning = true;
    
    setTimeout(() => {
        // Remove active class from all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Add active class to target slide and dot
        currentSlide = index;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
        
        // Update progress bar
        const progress = ((currentSlide + 1) / 6) * 100;
        progressFill.style.width = progress + '%';
        
        // Show/hide back button
        if (currentSlide > 0 && currentSlide !== 2) {
            backBtn.classList.remove('hidden');
        } else {
            backBtn.classList.add('hidden');
        }
        
        isTransitioning = false;
    }, 300);
}

// Handle Yes Click
function handleYesClick() {
    createCelebrationEffect();
    
    setTimeout(() => {
        navigateToSlide(3); // Go to letter page
    }, 1200);
}

// Create Celebration Effect
function createCelebrationEffect() {
    const hearts = ['💖', '💕', '💗', '💓', '💝', '✨'];
    
    for (let i = 0; i < 60; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
            
            const startX = window.innerWidth / 2;
            const startY = window.innerHeight / 2;
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 400 + 300;
            const endX = startX + Math.cos(angle) * velocity;
            const endY = startY + Math.sin(angle) * velocity;
            
            heart.style.cssText = `
                position: fixed;
                left: ${startX}px;
                top: ${startY}px;
                font-size: ${Math.random() * 40 + 25}px;
                pointer-events: none;
                z-index: 10000;
            `;
            
            document.body.appendChild(heart);
            
            heart.animate([
                { 
                    transform: 'translate(0, 0) scale(1) rotate(0deg)',
                    opacity: 1 
                },
                { 
                    transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0) rotate(${Math.random() * 1080}deg)`,
                    opacity: 0 
                }
            ], {
                duration: 1500,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });
            
            setTimeout(() => {
                if (document.body.contains(heart)) {
                    document.body.removeChild(heart);
                }
            }, 1500);
        }, i * 20);
    }
}

// Handle No Click
function handleNoClick() {
    noClickCount++;
    
    if (noClickCount === 1) {
        showCustomAlert("Are you certain?", "Consider this carefully...");
        yesScale = 1.4;
        yesBtn.style.transform = `scale(${yesScale})`;
    } else if (noClickCount === 2) {
        showCustomAlert("Think twice", "The answer is becoming clearer...");
        yesScale = 2.0;
        yesBtn.style.transform = `scale(${yesScale})`;
    } else if (noClickCount === 3) {
        showCustomAlert("Final chance", "Your heart knows the truth...");
        yesScale = 3.0;
        yesBtn.style.transform = `scale(${yesScale})`;
    } else {
        // Show loading animation
        showLoadingAnimation();
    }
}

// Show Loading Animation
function showLoadingAnimation() {
    loadingOverlay.classList.remove('hidden');
    loadingBarFill.style.width = '0%';
    loadingError.classList.add('hidden');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 2;
        loadingBarFill.style.width = progress + '%';
        
        if (progress >= 50 && loadingError.classList.contains('hidden')) {
            loadingError.classList.remove('hidden');
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
                
                // Navigate to error page
                slides.forEach(slide => slide.classList.remove('active'));
                dots.forEach(dot => dot.classList.remove('active'));
                
                currentSlide = 2;
                slides[currentSlide].classList.add('active');
                dots[currentSlide].classList.add('active');
                
                const progress = ((currentSlide + 1) / 6) * 100;
                progressFill.style.width = progress + '%';
            }, 500);
        }
    }, 30);
}

// Show Custom Alert
function showCustomAlert(title, message) {
    alertTitle.textContent = title;
    alertMessage.textContent = message;
    customAlert.classList.remove('hidden');
    
    setTimeout(() => {
        customAlert.classList.add('hidden');
    }, 2500);
}

// Handle Go Back
function handleGoBack() {
    noClickCount = 0;
    yesScale = 1;
    yesBtn.style.transform = 'scale(1)';
    navigateToSlide(1);
}

// Particle System
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 80;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.3 - 0.15;
            this.speedY = Math.random() * 0.3 - 0.15;
            this.opacity = Math.random() * 0.3 + 0.1;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        
        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Resize canvas on window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Prevent scrolling on main body
document.body.style.overflow = 'hidden';
