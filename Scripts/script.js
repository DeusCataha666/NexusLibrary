document.addEventListener("DOMContentLoaded", async function () {
  // Cargar libros desde /DATA/books.json
  let booksData = [];
  try {
    const response = await fetch("/DATA/books.json");
    if (!response.ok) throw new Error("No se pudo cargar books.json");
    booksData = await response.json();
    booksData = booksData.books; // <-- ACCESO CORRECTO AL ARRAY
  } catch (error) {
    alert("Error cargando los libros: " + error.message);
    return;
  }

  // Generar libros en el carrusel
  const carouselTrack = document.querySelector(".carousel-track");
  if (!carouselTrack) return; // Evita el error si no existe el carrusel
  booksData.forEach((book) => {
    const bookElement = document.createElement("div");
    bookElement.className = "carousel-book";
    bookElement.tabIndex = 0;
    bookElement.setAttribute(
      "aria-label",
      `Libro: ${book.title} por ${book.author}`
    );

    // COLOR BASE PARA LAS CATEGORIAS
    let color1, color2;
    switch (book.category) {
      case "Ciberpunk":
        color1 = "#4cc9f0";
        color2 = "#4895ef";
        break;
      case "Ciencia Ficción":
        color1 = "#7209b7";
        color2 = "#3a0ca3";
        break;
      case "Realidad Virtual":
        color1 = "#f72585";
        color2 = "#b5179e";
        break;
      default:
        color1 = "#4cc9f0";
        color2 = "#7209b7";
    }

    bookElement.innerHTML = `
      <div class="book-category">${book.category}</div>
      <h3 class="book-title">${book.title}</h3>
      <img class="book-img" src="${book.image}" alt="Portada de ${book.title}" loading="lazy">
      <p class="book-author">${book.author}</p>
      <div class="book-meta">
        <span>${book.year}</span>
        <span>${"★".repeat(Math.floor(book.rating))}${"☆".repeat(5 - Math.floor(book.rating))}</span>
      </div>
      <div class="quick-view-actions" style="margin: 0 auto;">
        <a href="/pages/404.html" style="text-decoration: none;">
          <button class="btn secondary-btn">Ver detalles</button>
        </a>
      </div>
      <style>
        .carousel-book[data-title="${book.title}"]::after {
          background: linear-gradient(90deg, ${color1}, ${color2});
        }
      </style>
    `;
    bookElement.setAttribute("data-title", book.title);
    carouselTrack.appendChild(bookElement);
  });

  // Carrusel
  const carousel = document.querySelector(".nexus-carousel");
  const track = document.querySelector(".carousel-track");
  const prevBtn = document.querySelector(".carousel-prev");
  const nextBtn = document.querySelector(".carousel-next");
  const books = Array.from(track.children);
  let currentIndex = 0;

  function getVisibleCount() {
    if (!books.length) return 1;
    const bookWidth =
      books[0].offsetWidth +
      parseInt(getComputedStyle(books[0]).marginRight || 0);
    return Math.floor(carousel.offsetWidth / bookWidth) || 1;
  }

  function updateCarousel() {
    const books = Array.from(track.children);
    if (!books.length) return;

    const bookWidth =
      books[0].offsetWidth +
      parseInt(getComputedStyle(books[0]).marginRight || 0);

    const visibleCount = Math.floor(carousel.offsetWidth / bookWidth) || 1;
    const maxIndex = Math.max(books.length - visibleCount, 0);

    track.style.transform = `translateX(-${currentIndex * bookWidth}px)`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;
  }

  nextBtn.addEventListener("click", () => {
    const visibleCount = getVisibleCount();
    const maxIndex = Math.max(books.length - visibleCount, 0);

    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
    }
  });

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  window.addEventListener("resize", updateCarousel);
  updateCarousel();
  setTimeout(updateCarousel, 100);

  // Navegación suave
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const sectionId = this.getAttribute("data-section");
      if (sectionId) {
        document.querySelector(`.${sectionId}-section`).scrollIntoView({
          behavior: "smooth",
        });
      }

      document.querySelectorAll(".nav-link").forEach((navLink) => {
        navLink.classList.remove("active");
      });
      this.classList.add("active");
    });
  });

  // Sistema de recomendaciones
  function getRecommendations() {
    return booksData.sort((a, b) => b.rating - a.rating).slice(0, 4);
  }

  function displayRecommendations() {
    const recommendations = getRecommendations();
    const container = document.querySelector(".recommendations-container");

    container.innerHTML = "";

    recommendations.forEach((book) => {
      const card = document.createElement("div");
      card.className = "recommendation-card";
      card.tabIndex = 0;
      card.setAttribute(
        "aria-label",
        `Recomendación: ${book.title} por ${book.author}`
      );
      card.innerHTML = `
        <h3>${book.title}</h3>
        <img class="img-reco" src="${book.image || "https://via.placeholder.com/150x200?text=No+image"
        }" alt="Portada de ${book.title}" loading="lazy">
        <p>${book.author}</p>

        <div class="rating">${"★".repeat(Math.floor(book.rating))}${"☆".repeat(
          5 - Math.floor(book.rating)
        )}</div>
        <a href="/pages/404.html" style="text-decoration: none;">
          <button class="btn btn-sm primary-btn mt-2" style="background: var(--accent-color); color: var(--primary-bg);">Ver detalles</button>
        </a> 
      `;

      card.addEventListener("click", (e) => {
        if (e.target.tagName !== "BUTTON") {
          showQuickView(book);
        }
      });

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          showQuickView(book);
        }
      });

      card.querySelector("button").addEventListener("click", () => {
        showQuickView(book);
      });

      container.appendChild(card);
    });
  }

  // validacion del fromulario
  (function () {
    'use strict';
    var forms = document.querySelectorAll('.needs-validation');
    Array.prototype.slice.call(forms).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  })();

  // Quick View
  function setupQuickView() {
    document
      .querySelectorAll(".carousel-book, .recommendation-card")
      .forEach((book) => {
        book.addEventListener("click", function (e) {
          if (e.target.tagName === "BUTTON") return;

          const title =
            this.querySelector("h3")?.textContent ||
            this.querySelector(".book-title")?.textContent;
          const bookData = booksData.find((b) => b.title === title);

          if (bookData) {
            showQuickView(bookData);
          }
        });
      });
  }

  function showQuickView(book) {
    const quickView = document.createElement("div");
    quickView.className = "quick-view-overlay";
    quickView.innerHTML = `
      <div class="quick-view-content">
        <button class="close-btn" aria-label="Cerrar vista rápida">&times;</button>
        <div class="quick-view-body">
          <div class="quick-view-image">
            <img src="${book.image || "https://via.placeholder.com/300x450?text=No+image"
      }" alt="Portada de ${book.title}" loading="lazy">
          </div>
          <div class="quick-view-info">
            <h2>${book.title}</h2>
            <p class="author">${book.author}</p>
            <p class="category">${book.category}</p>
            <div class="rating">${"★".repeat(
        Math.floor(book.rating)
      )}${"☆".repeat(5 - Math.floor(book.rating))}</div>
            <p class="description">${book.description}</p>
            <div class="quick-view-actions">
              <a href="/pages/404.html" style="text-decoration: none;">
                <button class="btn secondary-btn">Ver detalles</button>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(quickView);
    document.body.style.overflow = "hidden";

    quickView.querySelector(".close-btn").addEventListener("click", () => {
      document.body.removeChild(quickView);
      document.body.style.overflow = "";
    });

    quickView.querySelector(".add-to-cart").addEventListener("click", () => {
      addToCart(book);
      document.body.removeChild(quickView);
      document.body.style.overflow = "";
    });
  }

  // Animaciones al scroll
  function setupScrollAnimations() {
    const elements = document.querySelectorAll(".scroll-animation");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    elements.forEach((el) => {
      observer.observe(el);
    });
  }

  // Inicialización
  displayRecommendations();
  setupScrollAnimations();

  // Carga inicial del carrusel
  setTimeout(updateCarousel, 300);
});
