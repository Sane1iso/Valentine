import React, { useState, useEffect, useRef } from 'react';

export default function ValentineSlideshow() {
  /* 
   * IMPORTANT FOR MOBILE: Add this to your HTML <head>:
   * <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
   */
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [noClickCount, setNoClickCount] = useState(0);
  const [yesScale, setYesScale] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [alertContent, setAlertContent] = useState({ title: '', message: '' });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const canvasRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
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
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      navigateToSlide(1);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
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
    
    let animationId;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      animationId = requestAnimationFrame(animate);
    }
    
    animate();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const navigateToSlide = (index) => {
    if (index === 2) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 300);
  };

  const handleYesClick = () => {
    createCelebrationEffect();
    setTimeout(() => {
      navigateToSlide(3);
    }, 1200);
  };

  const createCelebrationEffect = () => {
    for (let i = 0; i < 60; i++) {
      setTimeout(() => {
        const heart = document.createElement('div');
        const hearts = ['💖', '💕', '💗', '💓', '💝', '✨'];
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
          { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
          { transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0) rotate(${Math.random() * 1080}deg)`, opacity: 0 }
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
  };

  const handleNoClick = () => {
    const newCount = noClickCount + 1;
    setNoClickCount(newCount);

    if (newCount === 1) {
      showCustomAlert("Are you certain?", "Consider this carefully...");
      setYesScale(1.4);
    } else if (newCount === 2) {
      showCustomAlert("Think twice", "The answer is becoming clearer...");
      setYesScale(2.0);
    } else if (newCount === 3) {
      showCustomAlert("Final chance", "Your heart knows the truth...");
      setYesScale(3.0);
    } else {
      // Show loading animation
      setShowLoading(true);
      setLoadingProgress(0);
      
      // Animate progress bar
      let progress = 0;
      const interval = setInterval(() => {
        progress += 2;
        setLoadingProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowLoading(false);
            navigateToSlide(2);
          }, 500);
        }
      }, 30);
    }
  };

  const showCustomAlert = (title, message) => {
    setAlertContent({ title, message });
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 2500);
  };

  const handleGoBack = () => {
    setNoClickCount(0);
    setYesScale(1);
    navigateToSlide(1);
  };

  const progress = ((currentSlide + 1) / 6) * 100;

  return (
    <div 
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100vh', 
      overflow: 'hidden',
      background: '#0a0a0a',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: '#ffffff',
      touchAction: 'pan-y'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Inter:wght@300;400;500;600&display=swap');
        
        * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 70, 130, 0.3); }
          50% { box-shadow: 0 0 40px rgba(255, 70, 130, 0.6); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }

        button {
          -webkit-tap-highlight-color: transparent;
          user-select: none;
          font-family: 'Inter', sans-serif;
          touch-action: manipulation;
        }

        .fade-transition {
          transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          body {
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
          }
          
          button {
            min-height: 48px;
            padding: 16px 32px !important;
          }
        }
        
        @media (max-width: 480px) {
          button {
            font-size: 0.9rem !important;
            padding: 14px 28px !important;
          }
        }

        /* Prevent zoom on input focus for iOS */
        input, select, textarea {
          font-size: 16px !important;
        }
      `}</style>

      {/* Progress Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '2px',
        background: 'rgba(255, 255, 255, 0.05)',
        zIndex: 1000
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #ff4682, #ff69b4, #ff1493)',
          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 0 20px rgba(255, 70, 130, 0.5)'
        }} />
      </div>

      {/* Navigation Dots */}
      <div style={{
        position: 'fixed',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        zIndex: 100
      }}>
        {[0, 1, 2, 3, 4, 5].map(index => (
          <div
            key={index}
            onClick={() => navigateToSlide(index)}
            onTouchEnd={(e) => {
              e.preventDefault();
              navigateToSlide(index);
            }}
            style={{
              width: currentSlide === index ? '12px' : '10px',
              height: currentSlide === index ? '12px' : '10px',
              borderRadius: '50%',
              background: currentSlide === index 
                ? 'linear-gradient(135deg, #ff4682, #ff69b4)' 
                : 'rgba(255, 255, 255, 0.2)',
              cursor: index === 2 ? 'default' : 'pointer',
              transition: 'all 0.4s ease',
              border: currentSlide === index ? '2px solid rgba(255, 70, 130, 0.3)' : 'none',
              touchAction: 'manipulation'
            }}
          />
        ))}
      </div>

      {/* Back Button */}
      {currentSlide > 0 && currentSlide !== 2 && (
        <button
          onClick={() => {
            // Special case: from letter page (slide 3), go back to home (slide 0)
            if (currentSlide === 3) {
              navigateToSlide(0);
            } else {
              navigateToSlide(currentSlide - 1);
            }
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            if (currentSlide === 3) {
              navigateToSlide(0);
            } else {
              navigateToSlide(currentSlide - 1);
            }
          }}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50px',
            color: '#fff',
            fontSize: '0.85rem',
            cursor: 'pointer',
            zIndex: 100,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            touchAction: 'manipulation'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          ← Back
        </button>
      )}

      <canvas ref={canvasRef} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.4
      }} />

      {showAlert && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(20, 20, 20, 0.98)',
          border: '1px solid rgba(255, 70, 130, 0.3)',
          padding: '40px 50px',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 70, 130, 0.2)',
          zIndex: 10000,
          textAlign: 'center',
          animation: 'fadeInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          backdropFilter: 'blur(20px)'
        }}>
          <h2 style={{ 
            fontSize: '1.8rem', 
            marginBottom: '12px', 
            fontWeight: 400,
            fontFamily: 'Cormorant Garamond, serif',
            color: '#ff69b4'
          }}>
            {alertContent.title}
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.8, fontWeight: 300 }}>
            {alertContent.message}
          </p>
        </div>
      )}

      {/* Loading Animation */}
      {showLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.95)',
          zIndex: 10001,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '500px',
            padding: '40px'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '30px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              ⏳
            </div>
            
            <h2 style={{
              fontSize: '2rem',
              marginBottom: '20px',
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 300,
              letterSpacing: '2px'
            }}>
              Loading...
            </h2>
            
            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '2px',
              marginBottom: '30px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${loadingProgress}%`,
                background: 'linear-gradient(90deg, #ff4682, #ff69b4)',
                transition: 'width 0.3s ease',
                boxShadow: '0 0 20px rgba(255, 70, 130, 0.5)'
              }} />
            </div>
            
            {loadingProgress > 50 && (
              <div style={{
                animation: 'fadeInUp 0.5s ease forwards',
                opacity: 0
              }}>
                <p style={{
                  fontSize: '1.2rem',
                  color: '#ff4444',
                  marginBottom: '10px',
                  fontWeight: 400
                }}>
                  ERROR DETECTED
                </p>
                <p style={{
                  fontSize: '1rem',
                  opacity: 0.7,
                  fontWeight: 300
                }}>
                  Wrong decision made
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide 1: Landing */}
      <div className="fade-transition" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: currentSlide === 0 && !isTransitioning ? 1 : 0,
        visibility: currentSlide === 0 ? 'visible' : 'hidden',
        zIndex: currentSlide === 0 ? 10 : 1,
        background: 'radial-gradient(ellipse at center, #1a0a0f 0%, #0a0a0a 100%)'
      }}>
        <div style={{ textAlign: 'center', padding: '40px', maxWidth: '900px' }}>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(3rem, 10vw, 7rem)',
            marginBottom: '30px',
            fontWeight: 300,
            letterSpacing: '2px',
            background: 'linear-gradient(135deg, #fff, #ff69b4, #fff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% 200%',
            animation: 'fadeInUp 1.2s ease forwards'
          }}>
            Happy Valentine's Day
          </h1>
          
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 300,
            marginBottom: '20px',
            letterSpacing: '4px',
            animation: 'fadeInUp 1.2s ease 0.3s forwards',
            opacity: 0,
            fontFamily: 'Cormorant Garamond, serif'
          }}>
            Tshireletso
          </h2>
          
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.3rem)',
            fontWeight: 300,
            marginBottom: '60px',
            animation: 'fadeInUp 1.2s ease 0.6s forwards',
            opacity: 0,
            letterSpacing: '2px'
          }}>
            With all my love, Saneliso
          </p>
          
          <button
            onClick={() => navigateToSlide(1)}
            onTouchEnd={(e) => {
              e.preventDefault();
              navigateToSlide(1);
            }}
            style={{
              padding: '16px 48px',
              fontSize: '1rem',
              fontWeight: 400,
              border: '1px solid rgba(255, 105, 180, 0.5)',
              borderRadius: '50px',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
              letterSpacing: '2px',
              transition: 'all 0.4s ease',
              animation: 'fadeInUp 1.2s ease 0.9s forwards',
              opacity: 0,
              touchAction: 'manipulation'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 105, 180, 0.1)';
              e.currentTarget.style.borderColor = '#ff69b4';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255, 105, 180, 0.5)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            BEGIN
          </button>
        </div>
      </div>

      {/* Slide 2: Proposal */}
      <div className="fade-transition" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: currentSlide === 1 && !isTransitioning ? 1 : 0,
        visibility: currentSlide === 1 ? 'visible' : 'hidden',
        zIndex: currentSlide === 1 ? 10 : 1,
        background: 'radial-gradient(ellipse at center, #0f0a1a 0%, #0a0a0a 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '60px 40px',
          maxWidth: '700px',
          width: '90%'
        }}>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
            marginBottom: '60px',
            fontWeight: 300,
            letterSpacing: '1px'
          }}>
            Will You Be My Valentine?
          </h1>
          
          <div style={{
            display: 'flex',
            gap: '30px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <button
              onClick={handleYesClick}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleYesClick();
              }}
              style={{
                padding: '20px 60px',
                fontSize: '1.2rem',
                fontWeight: 400,
                border: '1px solid #ff69b4',
                borderRadius: '50px',
                background: 'linear-gradient(135deg, rgba(255, 70, 130, 0.2), rgba(255, 105, 180, 0.1))',
                color: '#fff',
                cursor: 'pointer',
                letterSpacing: '2px',
                transform: `scale(${yesScale})`,
                transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                animation: 'glow 2s ease-in-out infinite',
                position: 'relative',
                zIndex: 101
              }}
            >
              YES
            </button>
            
            <button
              onClick={handleNoClick}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleNoClick();
              }}
              style={{
                padding: '20px 60px',
                fontSize: '1.2rem',
                fontWeight: 400,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50px',
                background: 'transparent',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                letterSpacing: '2px',
                transition: 'all 0.3s ease',
                position: 'relative',
                zIndex: 100
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
              }}
            >
              NO
            </button>
          </div>
          
          <p style={{
            fontSize: '0.9rem',
            opacity: 0.4,
            marginTop: '40px',
            fontWeight: 300,
            letterSpacing: '1px'
          }}>
            Choose what your heart tells you
          </p>
        </div>
      </div>

      {/* Remaining slides would continue here with the same sophisticated dark theme... */}
      
      {/* Slide 3: Error Page */}
      <div className="fade-transition" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: currentSlide === 2 && !isTransitioning ? 1 : 0,
        visibility: currentSlide === 2 ? 'visible' : 'hidden',
        background: 'radial-gradient(ellipse at center, #1a0000 0%, #0a0000 100%)',
        zIndex: currentSlide === 2 ? 10 : 1
      }}>
        <div style={{
          textAlign: 'center',
          padding: '60px 40px',
          maxWidth: '600px',
          margin: '0 20px'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '30px', opacity: 0.8 }}>⚠</div>
          
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 300,
            color: '#ff4444',
            marginBottom: '20px',
            fontFamily: 'Cormorant Garamond, serif',
            letterSpacing: '2px'
          }}>
            Error Detected
          </h1>
          
          <p style={{ fontSize: '1.2rem', marginBottom: '40px', opacity: 0.7, fontWeight: 300 }}>
            Wrong decision made
          </p>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '40px',
            border: '1px solid rgba(255, 68, 68, 0.2)'
          }}>
            <p style={{ margin: '12px 0', fontSize: '1rem', opacity: 0.6, fontWeight: 300 }}>
              Status: Incorrect choice detected
            </p>
            <p style={{ margin: '12px 0', fontSize: '1rem', opacity: 0.6, fontWeight: 300 }}>
              Required: Follow your heart
            </p>
            <p style={{ margin: '12px 0', fontSize: '1rem', opacity: 0.6, fontWeight: 300 }}>
              Action: Make correct decision
            </p>
          </div>
          
          <button
            onClick={handleGoBack}
            style={{
              padding: '16px 48px',
              fontSize: '1rem',
              fontWeight: 400,
              border: '1px solid rgba(255, 105, 180, 0.5)',
              borderRadius: '50px',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
              letterSpacing: '2px',
              transition: 'all 0.4s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 105, 180, 0.1)';
              e.currentTarget.style.borderColor = '#ff69b4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255, 105, 180, 0.5)';
            }}
          >
            GO BACK
          </button>
        </div>
      </div>

      {/* Slide 4: Letter Page */}
      <div className="fade-transition" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: currentSlide === 3 && !isTransitioning ? 1 : 0,
        visibility: currentSlide === 3 ? 'visible' : 'hidden',
        background: 'radial-gradient(ellipse at center, #1a1a1a 0%, #0a0a0a 100%)',
        zIndex: currentSlide === 3 ? 10 : 1,
        overflowY: 'auto',
        padding: '80px 20px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            padding: 'clamp(30px, 5vw, 60px) clamp(20px, 5vw, 50px)',
            marginBottom: '50px',
            backdropFilter: 'blur(20px)'
          }}>
            <h1 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              marginBottom: '40px',
              fontWeight: 300,
              textAlign: 'center',
              color: '#ff69b4'
            }}>
              For You
            </h1>
            
            <div style={{
              fontSize: '1.1rem',
              lineHeight: '2.2',
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 300,
              opacity: 0.9
            }}>
              <p style={{ marginBottom: '25px', fontStyle: 'italic', opacity: 0.7 }}>
                My Dearest Tshireletso,
              </p>
              
              <p style={{ marginBottom: '25px' }}>
                From the very first moment I saw you, I knew there was something extraordinary about you. Your presence changed the atmosphere, and I found myself drawn to the grace and elegance you carry so naturally.
              </p>
              
              <p style={{ marginBottom: '25px' }}>
                Every day with you is a gift I treasure. You transform the mundane into something remarkable, and you give me strength when challenges arise. With you, everything makes sense.
              </p>
              
              <p style={{ marginBottom: '25px' }}>
                You've shown me what it means to truly connect with another soul. Your intelligence, your compassion, your beautiful spirit—these are the qualities I admire deeply.
              </p>
              
              <p style={{ marginBottom: '25px' }}>
                I want to walk beside you through every chapter ahead. To celebrate your successes, support you through difficulties, and create a lifetime of meaningful moments together.
              </p>
              
              <p style={{ marginBottom: '25px' }}>
                Thank you for choosing me. Thank you for being exactly who you are.
              </p>
              
              <p style={{ marginBottom: '30px', opacity: 0.7 }}>
                With all my heart,
              </p>
              
              <p style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '2rem',
                fontStyle: 'italic',
                color: '#ff69b4'
              }}>
                Saneliso
              </p>
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => navigateToSlide(4)}
              style={{
                padding: '16px 48px',
                fontSize: '1rem',
                fontWeight: 400,
                border: '1px solid rgba(255, 105, 180, 0.5)',
                borderRadius: '50px',
                background: 'transparent',
                color: '#fff',
                cursor: 'pointer',
                letterSpacing: '2px',
                transition: 'all 0.4s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 105, 180, 0.1)';
                e.currentTarget.style.borderColor = '#ff69b4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255, 105, 180, 0.5)';
              }}
            >
              CONTINUE →
            </button>
          </div>
        </div>
      </div>

      {/* Slide 5: Drawing Gallery */}
      <div className="fade-transition" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: currentSlide === 4 && !isTransitioning ? 1 : 0,
        visibility: currentSlide === 4 ? 'visible' : 'hidden',
        background: 'radial-gradient(ellipse at center, #0a1a1a 0%, #0a0a0a 100%)',
        zIndex: currentSlide === 4 ? 10 : 1,
        overflowY: 'auto',
        padding: '80px 20px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            marginBottom: '20px',
            fontWeight: 300,
            textAlign: 'center',
            letterSpacing: '2px'
          }}>
            Our Creative Journey
          </h1>
          
          <p style={{
            fontSize: '1.1rem',
            marginBottom: '60px',
            textAlign: 'center',
            opacity: 0.6,
            fontWeight: 300,
            letterSpacing: '1px'
          }}>
            Moments captured in art
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
            gap: '30px',
            marginBottom: '60px',
            padding: '0 10px'
          }}>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div
                key={num}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '15px',
                  padding: '20px',
                  transition: 'all 0.4s ease',
                  cursor: 'pointer',
                  animation: `fadeInUp 0.6s ease forwards ${num * 0.1}s`,
                  opacity: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = 'rgba(255, 105, 180, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <div style={{
                  width: '100%',
                  height: '350px',
                  background: 'linear-gradient(135deg, rgba(255, 70, 130, 0.1), rgba(138, 43, 226, 0.1))',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  opacity: 0.3,
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  {/* Replace with: <img src="your-image-url" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px'}} alt="Drawing" /> */}
                  🎨
                </div>
                <p style={{
                  marginTop: '20px',
                  fontSize: '1rem',
                  opacity: 0.5,
                  fontWeight: 300,
                  letterSpacing: '1px'
                }}>
                  Memory {num}
                </p>
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => navigateToSlide(5)}
              style={{
                padding: '16px 48px',
                fontSize: '1rem',
                fontWeight: 400,
                border: '1px solid rgba(255, 105, 180, 0.5)',
                borderRadius: '50px',
                background: 'transparent',
                color: '#fff',
                cursor: 'pointer',
                letterSpacing: '2px',
                transition: 'all 0.4s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 105, 180, 0.1)';
                e.currentTarget.style.borderColor = '#ff69b4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255, 105, 180, 0.5)';
              }}
            >
              CONTINUE →
            </button>
          </div>
        </div>
      </div>

      {/* Slide 6: Love Messages */}
      <div className="fade-transition" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: currentSlide === 5 && !isTransitioning ? 1 : 0,
        visibility: currentSlide === 5 ? 'visible' : 'hidden',
        background: 'radial-gradient(ellipse at center, #1a0a1a 0%, #0a0a0a 100%)',
        zIndex: currentSlide === 5 ? 10 : 1,
        overflowY: 'auto',
        padding: '80px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            marginBottom: '60px',
            fontWeight: 300,
            textAlign: 'center',
            letterSpacing: '2px'
          }}>
            What You Mean to Me
          </h1>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
            gap: '20px',
            marginBottom: '60px',
            padding: '0 10px'
          }}>
            {[
              { text: 'From the moment I met you, my world became softer and brighter' },
              { text: 'Your smile is my favorite notification' },
              { text: 'You are peace in human form' },
              { text: 'Every day with you feels like answered prayer' },
              { text: 'I choose you. Today. Tomorrow. Always' },
              { text: 'You are my best decision' },
              { text: 'Loving you is the easiest thing I\'ve ever done' },
              { text: 'I can\'t wait to build memories, dreams, and a future with you' }
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '15px',
                  padding: '40px 30px',
                  transition: 'all 0.4s ease',
                  animation: `fadeInUp 0.6s ease forwards ${index * 0.1}s`,
                  opacity: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 105, 180, 0.3)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                }}
              >
                <p style={{
                  fontSize: '1.15rem',
                  lineHeight: '1.8',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontWeight: 300,
                  opacity: 0.9,
                  fontStyle: 'italic'
                }}>
                  "{item.text}"
                </p>
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <p style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '2.5rem',
              fontStyle: 'italic',
              opacity: 0.8,
              letterSpacing: '1px'
            }}>
              Forever yours, Saneliso
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
