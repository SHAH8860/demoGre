document.addEventListener('DOMContentLoaded', () => {
  const refreshCaptchaButton = document.getElementById('refreshCaptchaButton');
  const passwordInput = document.getElementById('password');
  const toggleIcon = document.getElementById('toggleIcon');
  const captchaCanvas = document.getElementById('captchaCanvas');

  // Sticky header on scroll
  window.addEventListener('scroll', function () {
    const header = document.getElementById('header');
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }
  });

  // Password toggle
  if (passwordInput && toggleIcon) {
    toggleIcon.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      toggleIcon.classList.replace(isPassword ? 'fa-eye-slash' : 'fa-eye', isPassword ? 'fa-eye' : 'fa-eye-slash');
    });
  }

  // Generate random captcha text
  function generateCaptchaText(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Draw captcha with letter spacing
  function drawCaptcha() {
    const ctx = captchaCanvas.getContext('2d');
    const text = generateCaptchaText();
    const letterSpacing = 14;
    const fontSize = 20;

    // Clear canvas
    ctx.clearRect(0, 0, captchaCanvas.width, captchaCanvas.height);

    // Set font and styles
    ctx.font = `italic ${fontSize}px 'Roboto-Medium', sans-serif`;
    ctx.fillStyle = '#3B3B3B';
    ctx.textBaseline = 'middle';

    // Centered starting X based on text length and spacing
    const totalWidth = text.length * letterSpacing;
    const startX = (captchaCanvas.width - totalWidth + letterSpacing) / 2;
    const centerY = captchaCanvas.height / 2;

    // Draw each letter spaced apart
    for (let i = 0; i < text.length; i++) {
      ctx.fillText(text[i], startX + i * letterSpacing, centerY);
    }
  }

  // Initial captcha render
  if (captchaCanvas) drawCaptcha();

  // Refresh captcha handler
  if (refreshCaptchaButton) {
    refreshCaptchaButton.addEventListener('click', drawCaptcha);
  }
});
