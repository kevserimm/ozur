document.addEventListener("DOMContentLoaded", () => {
    const btnYes = document.getElementById("evet-btn");
    const btnNo = document.getElementById("hayir-btn");
    const cardEmoji = document.getElementById("card-emoji");
    const questionCard = document.getElementById("question-card");
    const successCard = document.getElementById("success-card");
    const heartsContainer = document.getElementById("hearts-container");

    let escapeCount = 0;
    let yesScale = 1;

    // Emojis that change dynamically as the user tries to click No
    const emojis = ["🥺", "😢", "😭", "💔", "🥀", "😿", "💔", "🥺"];

    /**
     * Spawns a floating heart/emoji in the background
     * @param {string|null} customEmoji - Specific emoji to spawn
     * @param {string} customClass - Extra CSS class
     */
    function createHeart(customEmoji = null, customClass = "") {
        const heart = document.createElement("div");
        heart.classList.add("heart");
        if (customClass) heart.classList.add(customClass);
        
        const heartTypes = ["❤️", "💖", "💝", "💕", "💘", "🌸", "🧸"];
        heart.innerText = customEmoji || heartTypes[Math.floor(Math.random() * heartTypes.length)];
        
        // Random horizontal position
        heart.style.left = Math.random() * 100 + "vw";
        // Random animation duration
        const duration = 4 + Math.random() * 4;
        heart.style.animationDuration = duration + "s";
        // Random size
        heart.style.fontSize = 12 + Math.random() * 25 + "px";
        
        heartsContainer.appendChild(heart);
        
        // Clean up heart after animation ends
        setTimeout(() => {
            heart.remove();
        }, duration * 1000);
    }

    // Periodically spawn background hearts
    setInterval(() => {
        if (document.hidden) return;
        createHeart();
    }, 450);

    // Initial wave of hearts on load
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            createHeart();
        }, i * 150);
    }

    /**
     * Logic to calculate bounds and dodge the No button
     */
    function dodgeButton(event) {
        escapeCount++;
        
        // Progressively transition to sadder/more desperate emojis
        const emojiIndex = Math.min(Math.floor(escapeCount / 2), emojis.length - 1);
        cardEmoji.innerText = emojis[emojiIndex];
        
        // Apply fixed positioning styling on first escape attempt and move to body to bypass CSS stacking contexts
        if (!btnNo.classList.contains("dodging")) {
            btnNo.classList.add("dodging");
            document.body.appendChild(btnNo);
        }

        // Get button dimensions, with safe fallbacks in case it's the first render or layout is pending
        const btnRect = btnNo.getBoundingClientRect();
        const btnWidth = btnRect.width || 120;
        const btnHeight = btnRect.height || 50;
        const padding = 30;

        // Define strict screen boundary limits
        const minX = padding;
        const minY = padding;
        const maxX = Math.max(window.innerWidth - btnWidth - padding, minX);
        const maxY = Math.max(window.innerHeight - btnHeight - padding, minY);

        // Calculate initial random coordinates within safe bounds
        let newX = Math.random() * (maxX - minX) + minX;
        let newY = Math.random() * (maxY - minY) + minY;

        // Obtain cursor or touch position
        let cursorX, cursorY;
        if (event.type === 'touchstart') {
            cursorX = event.touches[0].clientX;
            cursorY = event.touches[0].clientY;
        } else {
            cursorX = event.clientX;
            cursorY = event.clientY;
        }

        // If coordinates land too close to the user's cursor, push it away in the opposite direction
        const dist = Math.hypot(newX - cursorX, newY - cursorY);
        if (dist < 150) {
            newX = newX + (newX < cursorX ? -160 : 160);
            newY = newY + (newY < cursorY ? -160 : 160);
        }

        // Final safety clamp: force coordinates to remain strictly within screen boundaries
        newX = Math.max(minX, Math.min(newX, maxX));
        newY = Math.max(minY, Math.min(newY, maxY));

        // Apply new coordinates
        btnNo.style.left = `${newX}px`;
        btnNo.style.top = `${newY}px`;

        // Scale the YES button progressively and more gradually to make the game last longer
        yesScale = 1 + Math.pow(escapeCount, 1.2) * 0.25;
        btnYes.style.transform = `scale(${yesScale})`;
        
        // Adjust border radius and shadow dynamically so they remain constant and sharp when scaled
        const baseRadius = 50; // CSS border-radius is 50px
        btnYes.style.borderRadius = `${baseRadius / yesScale}px`;
        
        const shadowOffset = 8 / yesScale;
        const shadowBlur = 15 / yesScale;
        const glowStrength = Math.min(escapeCount * 4, 30) / yesScale;
        btnYes.style.boxShadow = `0 ${shadowOffset}px ${shadowBlur}px rgba(0, 0, 0, 0.05), 0 0 ${glowStrength}px rgba(255, 77, 109, 0.6)`;
    }

    // Desktop hover escape
    btnNo.addEventListener("mouseover", dodgeButton);
    // Mobile tap/touch escape
    btnNo.addEventListener("touchstart", (e) => {
        e.preventDefault(); // Stop click emulation
        dodgeButton(e);
    });

    /**
     * Spawns an explosion particle (emoji/heart) at a given point
     */
    function spawnParticle(x, y) {
        const particle = document.createElement("div");
        particle.classList.add("celebration-particle");
        
        const items = ["❤️", "💖", "💝", "💕", "💘", "💛", "🧡", "💜", "💙", "💚", "🎉", "🥳", "✨", "🌸", "🧸", "🎈", "🍭"];
        particle.innerText = items[Math.floor(Math.random() * items.length)];
        
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.fontSize = `${16 + Math.random() * 28}px`;
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 240;
        const tx = Math.cos(angle) * distance;
        // Upward bias: subtract a random force to simulate floating up
        const ty = Math.sin(angle) * distance - (60 + Math.random() * 140);
        
        const duration = 1 + Math.random() * 1.2;
        
        particle.style.setProperty("--tx", `${tx}px`);
        particle.style.setProperty("--ty", `${ty}px`);
        particle.style.setProperty("--tscale", `${0.4 + Math.random() * 0.8}`);
        particle.style.setProperty("--trotate", `${Math.random() * 360}deg`);
        
        particle.style.animation = `shootParticle ${duration}s cubic-bezier(0.1, 0.8, 0.3, 1) forwards`;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, duration * 1000);
    }

    /**
     * Triggers a burst of particles from a specific point
     */
    function triggerBurst(x, y, count = 35) {
        for (let i = 0; i < count; i++) {
            const offsetX = x + (Math.random() * 30 - 15);
            const offsetY = y + (Math.random() * 30 - 15);
            spawnParticle(offsetX, offsetY);
        }
    }

    // Yes button action
    btnYes.addEventListener("click", () => {
        // Hide the No button completely
        if (btnNo) btnNo.remove();

        // Create screen flash effect
        const flash = document.createElement("div");
        flash.classList.add("love-flash");
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 800);

        // Transition cards
        questionCard.classList.add("hidden");
        
        // Render success card with animation
        successCard.classList.remove("hidden");
        void successCard.offsetWidth; // Trigger reflow for animation
        successCard.classList.add("show");

        // Coordinates for explosions
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Immediate explosions: massive center burst + bottom corners
        triggerBurst(width / 2, height / 2, 60);
        triggerBurst(100, height - 100, 30);
        triggerBurst(width - 100, height - 100, 30);

        // Delayed bursts for a firework finale effect
        setTimeout(() => triggerBurst(150, 150, 25), 250);        // Top-left
        setTimeout(() => triggerBurst(width - 150, 150, 25), 450); // Top-right
        setTimeout(() => triggerBurst(width / 2, height / 2 - 100, 50), 650); // Second center burst

        // Release celebration heart storm
        let celebrationCount = 0;
        const celebrationInterval = setInterval(() => {
            if (celebrationCount > 80) {
                clearInterval(celebrationInterval);
                return;
            }
            createHeart(null, "celebration-heart");
            celebrationCount++;
        }, 30);

        // Keep a steady fast flow of hearts running
        setInterval(() => {
            createHeart(null, "celebration-heart");
        }, 120);
    });
});
