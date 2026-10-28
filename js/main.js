
document.addEventListener('DOMContentLoaded', () => {
    const pointsDisplay = document.querySelector('.puntos-jugador');

    function updatePoints() {
        const points = localStorage.getItem('userPoints') || 0;
        if (pointsDisplay) {
            pointsDisplay.textContent = points;
        }
    }

    // Update points on load
    updatePoints();

    // Listen for storage changes (from other tabs/windows)
    window.addEventListener('storage', (event) => {
        if (event.key === 'userPoints') {
            updatePoints();
        }
    });

    // Also check periodically or on focus for changes if needed
    window.addEventListener('focus', updatePoints);
});
