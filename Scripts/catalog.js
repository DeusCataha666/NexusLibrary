// Función para cargar los libros del JSON
async function loadBooks() {
    try {
        const response = await fetch('/DATA/books.json');
        const data = await response.json();
        return data.books;
    } catch (error) {
        console.error('Error cargando los libros:', error);
        return [];
    }
}

// Función actualizada para crear tarjetas de libros con una presentación más compacta
function createBookCard(book) {
    return `
        <div class="category-card">
            <div class="category-icon">
                <img src="${book.image}" alt="${book.title}">
            </div>
            <div class="category-info">
                <h3 class="category-title" title="${book.title}">${book.title}</h3>
                <p class="book-author">${book.author}</p>
                <p class="book-price">$${book.price}</p>
                <p class="book-rating">★ ${book.rating}</p>
                <button class="btn btn-primary add-to-cart-btn" 
                    onclick="cart.addItem(${JSON.stringify(book).replace(/"/g, '&quot;')})">
                    Añadir al carrito
                </button>
            </div>
        </div>
    `;
}

// Función actualizada para mostrar libros por categoría sin navegación y con encabezado
async function displayBooksByCategory() {
    const books = await loadBooks();
    const categories = [...new Set(books.map(book => book.category))];

    const categoriesSection = document.querySelector('.categories-section');
    categoriesSection.innerHTML = '<h2 class="section-title">Explora Las Categorías</h2>';

    categories.forEach(category => {
        const categoryBooks = books.filter(book => book.category === category);

        const categorySection = document.createElement('div');
        categorySection.className = 'carousel-container';
        categorySection.innerHTML = `
            <h3 class="categories-title">${category}</h3>
            <div class="carousel" id="bookCarousel-${category.replace(/\s+/g, '')}">
                ${categoryBooks.map(book => createBookCard(book)).join('')}
            </div>
        `;

        categoriesSection.appendChild(categorySection);
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    displayBooksByCategory();
});

// Función de búsqueda
async function searchBooks() {
    const searchInput = document.querySelector('input[name="search"]').value.toLowerCase();
    const books = await loadBooks();
    
    // Filtrar libros que coincidan con la búsqueda
    const results = books.filter(book => 
        book.title?.toLowerCase().includes(searchInput) ||
        book.author?.toLowerCase().includes(searchInput) ||
        book.category?.toLowerCase().includes(searchInput) ||
        book.description?.toLowerCase().includes(searchInput)
    );

    displaySearchResults(results);
}

// Función para mostrar resultados
function displaySearchResults(results) {
    const categoriesSection = document.querySelector('.categories-section');
    
    categoriesSection.innerHTML = '';
    
    if (results.length === 0) {
        categoriesSection.innerHTML = `
            <div class="categories-container">
                <h3 class="section-title">No se encontraron resultados</h3>
                <button onclick="resetSearch()" class="btn btn-accent">
                    Ver todos los libros
                </button>
            </div>
        `;
        return;
    }

    categoriesSection.innerHTML = `
        <div class="categories-container">
            <h3 class="section-title">Resultados de la búsqueda</h3>
            <div class="carousel">
                ${results.map(book => createBookCard(book)).join('')}
            </div>
            <button onclick="resetSearch()" class="btn btn-accent mt-4">
                Ver todos los libros
            </button>
        </div>
    `;
}

// Función para resetear la búsqueda
async function resetSearch() {
    document.querySelector('input[name="search"]').value = '';
    await displayBooksByCategory();
}

// Inicializar eventos de búsqueda
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[name="search"]');
    const searchButton = document.getElementById('search-button');

    // Evento para el botón de búsqueda
    searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        searchBooks();
    });

    // Evento para la tecla Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchBooks();
        }
    });
});

class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartCount();
    }

    addItem(book) {
        const existingItem = this.items.find(item => item.id === book.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ ...book, quantity: 1 });
        }

        this.saveCart();
        this.updateCartCount();
        this.showAddedToCartModal(book);
    }

    removeItem(bookId) {
        this.items = this.items.filter(item => item.id !== bookId);
        this.saveCart();
        this.updateCartCount();
        this.updateCartModal(); // Nueva función para actualizar el modal
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    updateCartModal() {
        const modalBody = document.querySelector('#cartModal .modal-body');
        const modalFooter = document.querySelector('#cartModal .modal-footer');

        if (!modalBody) return; // Si el modal no está abierto, no hacemos nada

        if (this.items.length === 0) {
            modalBody.innerHTML = '<p>Tu carrito está vacío</p>';
            modalFooter.innerHTML = `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                <a href="/pages/checkout.html" class="btn btn-primary disabled">Proceder al pago</a>
            `;
        } else {
            modalBody.innerHTML = this.items.map(item => `
                <div class="cart-item d-flex align-items-center mb-3">
                    <img src="${item.image}" alt="${item.title}" style="width: 80px; margin-right: 15px;">
                    <div class="flex-grow-1">
                        <h6>${item.title}</h6>
                        <p class="mb-0">Precio: $${item.price} x ${item.quantity}</p>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="cart.removeItem(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');

            const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            modalFooter.innerHTML = `
                <div class="text-end me-3">
                    <strong>Total: $${total.toFixed(2)}</strong>
                </div>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                <a href="/pages/checkout.html" class="btn btn-primary">Proceder al pago</a>
            `;
        }
    }

    showAddedToCartModal(book) {
        const modalHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Agregado al carrito</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="d-flex align-items-center">
                        <img src="${book.image}" alt="${book.title}" style="width: 100px; margin-right: 15px;">
                        <div>
                            <h6>${book.title}</h6>
                            <p class="mb-1">Precio: $${book.price}</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Seguir comprando</button>
                    <button type="button" class="btn btn-primary" onclick="this.closest('.modal').remove(); cart.showCartModal();">
                        Ver carrito
                    </button>
                </div>
            </div>
        </div>
    `;

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'addedToCartModal';
        modal.innerHTML = modalHTML;

        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    showCartModal() {
        const modalHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Carrito de Compras</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${this.items.length === 0 ? '<p>Tu carrito está vacío</p>' :
                this.items.map(item => `
                                <div class="cart-item d-flex align-items-center mb-3">
                                    <img src="${item.image}" alt="${item.title}" style="width: 80px; margin-right: 15px;">
                                    <div class="flex-grow-1">
                                        <h6>${item.title}</h6>
                                        <p class="mb-0">Precio: $${item.price} x ${item.quantity}</p>
                                    </div>
                                    <button class="btn btn-danger btn-sm" onclick="cart.removeItem(${item.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            `).join('')
            }
                    </div>
                    <div class="modal-footer">
                        <div class="text-end me-3">
                            <strong>Total: $${this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</strong>
                        </div>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        <a href="/pages/404.html" class="btn btn-primary ${this.items.length === 0 ? 'disabled' : ''}">
                            Proceder al pago
                        </a>
                    </div>
                </div>
            </div>
        `;

        // Remover modal anterior si existe
        const existingModal = document.getElementById('cartModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'cartModal';
        modal.innerHTML = modalHTML;

        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
            location.reload(2);
        });

        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();


    }
}

// Inicializar el carrito
const cart = new Cart();