function triggerConfetti() {
    if (typeof confetti !== 'function') {
        console.error('canvas-confetti library not loaded');
        return;
    }
    confetti({
        particleCount: 300,
        spread: 180,
        origin: { x: 0, y: 1 }, // Lower left corner
        colors: ['#007bff', '#f80738', '#f0f20d']
    });
}