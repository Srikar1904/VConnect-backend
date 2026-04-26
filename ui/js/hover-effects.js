// hover-effects.js
document.addEventListener('DOMContentLoaded', () => {
    // Add generalized hover effects here if necessary
    console.log("Hover effects initialized successfully.");
    
    const cards = document.querySelectorAll('.role-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 15px 30px rgba(0,0,0,0.2)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'var(--shadow)';
        });
    });
});
