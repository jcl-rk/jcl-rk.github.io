// Configuration constants
const RIPPLE_DURATION_MS = 600;
const IMAGE_TRANSITION_DELAY_MS = 250;
const SUCCESS_BUTTON_RESET_MS = 2000;
const REQUEST_TIMEOUT_MS = 60000; // 60 seconds for server wake-up
const BACKEND_API_URL = 'https://greyroomchats-backend.onrender.com/api/contact'; // Change for local dev
const BACKEND_HEALTH_URL = BACKEND_API_URL.replace(/\/api\/contact\/?$/, '/api/health');

// Best-effort warm-up (Render free tier can cold-start after inactivity)
window.addEventListener('DOMContentLoaded', () => {
  fetch(BACKEND_HEALTH_URL, { method: 'GET', cache: 'no-store', keepalive: true }).catch(() => {});
});

const sections = document.querySelectorAll('.section');

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      } else {
        entry.target.classList.remove('show');
      }
    });
  },
  {
    threshold: 0.05,
    rootMargin: '0px 0px -50px 0px',
  }
);

sections.forEach(section => {
  observer.observe(section);
});

// Cleanup observer when page unloads
window.addEventListener('beforeunload', () => {
  observer.disconnect();
});

(function() {
  const images = [
    'assets/screenshots/Team.png',
    'assets/screenshots/top account.png',
    'assets/screenshots/earnings.png',
    'assets/screenshots/earnings2.png',
  ];
  
  let currentIndex = 0;
  
  const lightbox = document.getElementById('proof-lightbox');
  const currentImage = document.getElementById('current-lightbox-image');
  const counter = document.getElementById('lightbox-counter');
  const viewGalleryBtn = document.querySelector('.view-gallery');
  const stackedContainer = document.querySelector('.stacked-images-container');
  const stackedImages = document.querySelectorAll('.stacked-image');
  const closeBtn = document.getElementById('close-lightbox');
  const prevBtn = document.getElementById('prev-image');
  const nextBtn = document.getElementById('next-image');
  
  // Event listeners
  let backdrop = document.getElementById('proof-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'proof-backdrop';
    backdrop.className = 'proof-backdrop';
    document.body.appendChild(backdrop);
  }

  // Ensure the lightbox lives at the document root so position:fixed centers to the viewport
  if (lightbox && lightbox.parentElement !== document.body) {
    document.body.appendChild(lightbox);
  }
  
  /**
   * Open the lightbox gallery at the first image
   */
  function openLightbox() {
    document.body.style.overflow = 'hidden';
    currentIndex = 0;
    backdrop.classList.add('active');
    lightbox.classList.add('active');
    // ensure the lightbox is focusable and focus the close button for accessibility
    if (closeBtn) closeBtn.focus();
    updateImage();
  }
  
  /**
   * Close the lightbox gallery and restore page scrolling
   */
  function closeLightbox() {
    lightbox.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  /**
   * Update the displayed image in the lightbox with transition effect
   */
  function updateImage() {
    currentImage.classList.add('changing');
    
    setTimeout(() => {
      currentImage.src = images[currentIndex];
      counter.textContent = `${currentIndex + 1} / ${images.length}`;
      
      // Remove the changing class after image loads
      currentImage.onload = () => {
        currentImage.classList.remove('changing');
      };
      
      // Handle image loading errors
      currentImage.onerror = () => {
        currentImage.classList.remove('changing');
        console.error('Failed to load image:', images[currentIndex]);
      };
    }, IMAGE_TRANSITION_DELAY_MS);
  }
  
  /**
   * Navigate to the next image in the gallery (wraps to first)
   */
  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
  }
  
  /**
   * Navigate to the previous image in the gallery (wraps to last)
   */
  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
  }
  
  // Event listeners
  if (viewGalleryBtn) {
    viewGalleryBtn.addEventListener('click', openLightbox);
  }
  
  if (stackedImages) {
    stackedImages.forEach(img => img.addEventListener('click', openLightbox));
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', prevImage);
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', nextImage);
  }
  
  // Close on background click
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }
  
  // Wheel navigation
  if (lightbox) {
    lightbox.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        nextImage();
      } else {
        prevImage();
      }
    });
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.classList.contains('active')) {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') closeLightbox();
    }
  });
})();

/**
 * Create a ripple animation effect on interactive elements
 * @param {MouseEvent} event - The click event
 */
function createRipple(event) {
  const button = event.target.closest('.service-card, .proof-card, .instant-contact-card, .view-gallery, .cta, .submit-btn');
  if (!button) return;
  
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.classList.add('ripple');

  const existingRipple = button.querySelector('.ripple');
  if (existingRipple) {
    existingRipple.remove();
  }

  button.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, RIPPLE_DURATION_MS);
}

// Use event delegation on document for ripple effects
document.addEventListener('click', createRipple);

// Add subtle pulse animation on hover for interactive elements
const interactiveElements = document.querySelectorAll('.service-card, .proof-card, .instant-contact-card');
interactiveElements.forEach(element => {
  element.addEventListener('mouseenter', function() {
    this.style.animation = 'pulse 0.5s ease';
  });
  
  element.addEventListener('animationend', function() {
    this.style.animation = '';
  });
});

// Contact Form Handling
(function() {
  const contactForm = document.getElementById('contact-form');
  const emailInput = document.getElementById('email-input');
  const telegramInput = document.getElementById('telegram-input');
  const contactMethodRadios = document.querySelectorAll('input[name="contact-method"]');
  const formFeedback = document.getElementById('form-feedback');

  if (!contactForm) return;

  // Update input visibility based on contact method
  function updateFormState() {
    const selectedMethod = document.querySelector('input[name="contact-method"]:checked')?.value;
    
    if (selectedMethod === 'email') {
      emailInput.required = true;
      telegramInput.required = false;
      emailInput.closest('.form-group').style.display = 'flex';
      telegramInput.closest('.form-group').style.display = 'none';
    } else if (selectedMethod === 'telegram') {
      emailInput.required = false;
      telegramInput.required = true;
      emailInput.closest('.form-group').style.display = 'none';
      telegramInput.closest('.form-group').style.display = 'flex';
    }
  }

  // Listen for contact method changes
  contactMethodRadios.forEach(radio => {
    radio.addEventListener('change', updateFormState);
  });

  // Set initial state
  updateFormState();

  // Form submission
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot validation - block bot submissions
    const honeypotField = document.getElementById('hp-field');
    if (honeypotField && honeypotField.value) {
      console.log('Bot detected via honeypot');
      return; // Silently reject bot submission
    }

    // Validate Telegram username format if selected
    const selectedMethod = document.querySelector('input[name="contact-method"]:checked')?.value;
    if (selectedMethod === 'telegram') {
      const telegramValue = telegramInput.value.trim();
      const telegramRegex = /^@?[a-zA-Z0-9_]{5,32}$/;
      if (!telegramValue || !telegramRegex.test(telegramValue)) {
        formFeedback.textContent = '❌ Please enter a valid Telegram username (5-32 characters, letters, numbers, underscore)';
        formFeedback.className = 'error';
        return;
      }
    }

    // Clear previous feedback
    formFeedback.textContent = '';
    formFeedback.className = '';

    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalBtnText = submitBtn.textContent;

    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    submitBtn.style.opacity = '0.6';
    submitBtn.style.cursor = 'not-allowed';

    const formData = {
      contactMethod: document.querySelector('input[name="contact-method"]:checked').value,
      email: emailInput.value || null,
      telegram: telegramInput.value || null,
      message: document.getElementById('message-input').value || null,
      timestamp: new Date().toISOString(),
      honeypot: honeypotField ? honeypotField.value : ''
    };

    // Clear previous feedback
    formFeedback.textContent = '';
    formFeedback.className = '';

    try {
      // Send to server endpoint with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      
      const response = await fetch(BACKEND_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        // Change button text to success checkmark
        submitBtn.textContent = '✓ Sent!';
        submitBtn.style.opacity = '1';
        
        // Show success message
        formFeedback.textContent = '✓ Request sent! We\'ll reach out soon.';
        formFeedback.className = 'success';
        contactForm.reset();
        updateFormState();
        
        // Re-enable button after 2 seconds
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
          submitBtn.style.cursor = 'pointer';
        }, SUCCESS_BUTTON_RESET_MS);
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      // Show appropriate error message
      console.error('Failed to send:', error);
      
      if (error.name === 'AbortError') {
        formFeedback.textContent = '⏱️ Request timeout. Server may be starting up. Please try again.';
        formFeedback.className = 'error';
      } else {
        formFeedback.textContent = '❌ Failed to send. Please try again or contact via the buttons below.';
        formFeedback.className = 'error';
      }
      
      // Re-enable button on error
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
    }
  });

})();

// Logo click handler - smooth scroll to top
const logoLink = document.querySelector('.logo');
if (logoLink) {
  logoLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
