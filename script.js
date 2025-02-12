window.addEventListener("scroll", function() {
    let scrollPosition = window.scrollY * 0.05; // Adjust this value for parallax speed
    document.getElementById("background").style.transform = `translateY(${scrollPosition}px)`; // Use translateY
});