const photosGallery = document.getElementById("photos-gallery");
const favoritesGallery = document.getElementById("favorites-gallery");
const lightbox = document.querySelector(".lightbox");
const lightboxImg = document.querySelector(".lightbox-image");
const caption = document.querySelector(".caption");
const lightboxHeart = document.querySelector(".lightbox-heart");
const closeBtn = document.querySelector(".close");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");
let galleryImages = document.querySelectorAll(".gallery img");
let currentIndex = 0;

function updateLightbox() {
    if (!galleryImages.length) {
        closeLightbox();
        return;
    }
    currentIndex = Math.max(0, Math.min(currentIndex, galleryImages.length - 1));
    const img = galleryImages[currentIndex];
    lightboxImg.src = img.src;
    caption.textContent = img.alt;
    const originalHeart = getOriginalHeart(img);
    const isFavorited = originalHeart?.getAttribute("data-favorited") === "true";
    lightboxHeart.setAttribute("data-favorited", isFavorited);
    lightboxHeart.classList.toggle("favorited", isFavorited);
    lightboxHeart.innerHTML = isFavorited ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
    lightboxImg.style.opacity = "0";
    setTimeout(() => lightboxImg.style.opacity = "1", 150);
}

function showLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    lightbox.style.display = "none";
    document.body.style.overflow = "auto";
}

function navigate(step) {
    currentIndex = (currentIndex + step + galleryImages.length) % galleryImages.length;
    updateLightbox();
}

function updateGalleryImages() {
    galleryImages = document.querySelectorAll(".gallery img");
    reattachImageListeners();
}

function reattachImageListeners() {
    galleryImages.forEach((img) => {
        img.removeEventListener("click", handleImageClick);
        img.addEventListener("click", handleImageClick);
    });
}

function handleImageClick(event) {
    const index = Array.from(galleryImages).indexOf(event.target);
    if (index !== -1) showLightbox(index);
}

function getOriginalHeart(img) {
    const containers = photosGallery.querySelectorAll(".photo-container");
    return Array.from(containers).find(container => {
        const containerImg = container.querySelector("img");
        return containerImg?.src === img.src && containerImg?.alt === img.alt;
    })?.querySelector(".heart-icon");
}

function toggleFavorite(heart) {
    const photoContainer = heart.parentElement;
    const img = photoContainer.querySelector("img");
    const isFavorited = heart.getAttribute("data-favorited") === "true";

    heart.setAttribute("data-favorited", !isFavorited);
    heart.classList.toggle("favorited");
    heart.innerHTML = !isFavorited ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';

    if (!isFavorited) {
        const newPhotoContainer = photoContainer.cloneNode(true);
        newPhotoContainer.querySelector(".heart-icon")?.remove();
        favoritesGallery.appendChild(newPhotoContainer);
    } else {
        const favoritesImages = favoritesGallery.querySelectorAll("img");
        favoritesImages.forEach(favImg => {
            if (favImg.src === img.src && favImg.alt === img.alt) favImg.parentElement.remove();
        });
    }
    updateGalleryImages();
    if (lightbox.style.display === "flex") updateLightbox();
}

// Event Delegation for Heart Icons
photosGallery.addEventListener("click", (e) => {
    const heart = e.target.closest(".heart-icon");
    if (heart) {
        e.stopPropagation();
        toggleFavorite(heart);
    }
});

// Lightbox Controls
lightboxHeart.addEventListener("click", (e) => {
    e.stopPropagation();
    const originalHeart = getOriginalHeart(galleryImages[currentIndex]);
    if (originalHeart) toggleFavorite(originalHeart);
});

closeBtn.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
});

prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navigate(-1);
});

nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navigate(1);
});

// Keyboard Navigation
document.addEventListener("keydown", (e) => {
    if (lightbox.style.display !== "flex") return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") navigate(-1);
    else if (e.key === "ArrowRight") navigate(1);
});

// Touch Swipe Support
let touchStartX = 0;
let touchEndX = 0;

lightbox.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
});

lightbox.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].clientX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchStartX - touchEndX;
    if (Math.abs(swipeDistance) > swipeThreshold) {
        swipeDistance > 0 ? navigate(1) : navigate(-1);
    }
}

// Initial Setup
updateGalleryImages();