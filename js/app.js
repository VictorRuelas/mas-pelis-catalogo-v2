// ===============================================
// Archivo: js/app.js (Estructura Modular Final - BEM Refactorizado)
// ===============================================

// =========================================================================
// 1. MÓDULO: DECLARACIONES INTERNAS Y DATOS (Estructuras de Estado)
// =========================================================================

/* Importación de Datos (Array de Objetos) */
import { movies } from '../data/catalogo.js';

/* Inicialización del carrito y lista de deseos (TEMA 2: ESTRUCTURAS DE DATOS AVANZADAS) */
const cart = new Map();
const wishlist = new Set();

// Declaración de notify (Será inicializada en DOMContentLoaded)
let notify;

// =========================================================================
// 2. MÓDULO: FUNCIONES DE ORDEN SUPERIOR (FILTER) Y BUSCADORES
// =========================================================================

/**
 * Filtra el catálogo de películas por búsqueda de texto y categoría.
 */
const filterMovies = (allProducts, activeCategory = 'all') => {
    // Busca el input del buscador por su ID
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let filteredMovies = allProducts;

    // 1. Filtrado de Texto (Buscador)
    if (searchTerm !== '') {
        filteredMovies = allProducts.filter(movie => {
            // Campos de la película renombrados a inglés
            const searchFields = [
                movie.name, movie.director, movie.synopsis,
                movie.genres.join(' '), movie.year.toString(),
                movie.actors.join(' '), movie.language,
            ];
            return searchFields.some(field => field.toLowerCase().includes(searchTerm));
        });
    }

    // 2. Filtrado por Categoría
    if (searchTerm === '' && activeCategory !== 'all') {
        filteredMovies = allProducts.filter(p =>
            p.genres.map(g => g.toLowerCase()).includes(activeCategory.toLowerCase())
        );
    }

    renderMovies(filteredMovies);
};

// =========================================================================
// 3. MÓDULO: COMPONENTES Y LÓGICA DE DOM (Funciones que interactúan con el HTML)
// =========================================================================

/* MÓDULO: NOTIFICACIONES (CLOSURE) */
const createNotifier = () => {
    // ID 'toast' se mantiene, clase renombrada
    const toastEl = document.getElementById('toast');
    let timeoutId;

    return (message) => {
        if (!toastEl) return;
        toastEl.textContent = message;
        // Clase renombrada
        toastEl.classList.add('toast-message--visible');

        if (timeoutId) clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            // Clase renombrada
            toastEl.classList.remove('toast-message--visible');
        }, 3000);
    };
};

/* MÓDULO: UI (RENDERIZADO Y ESTRUCTURA) */
/**
 * Función que genera el string HTML para una tarjeta de película.
 */
const generateCard = (movie) => {
    // Propiedades de la película renombradas
    return `
        <div class="product-card" data-id="${movie.id}">
            <div class="product-card__top-content">
                <img src="${movie.image}" alt="${movie.name}" class="product-card__image product-card__image--active">
            
                <a target="_blank" href="${movie.trailer_url}">
                    <img src="img/boton-de-play.png" alt="Play Trailer" class="product-card__play-icon">
                </a>
            
                <div class="product-card__details">
                    <p><strong>${movie.name}</strong> (${movie.year})</p>
                    <p class="product-card__details__genres">${movie.genres.join(' | ')}</p>
                </div>
            
                <div class="product-card__trailer">
                    <p>Crítica: ${movie.rating}/5</p>
                    <p>Director: ${movie.director}</p>
                    <p>Duración: ${movie.duration}</p>
                </div>
            </div>
            
            <div class="product-card__actions"> 
                <button class="product-card__actions__button product-card__actions__button--rent"
                data-id="${movie.id}" data-type="alquilar">
                    Alquilar ($${movie.rental_price})
                </button>
                <button class="product-card__actions__button product-card__actions__button--buy"
                data-id="${movie.id}" data-type="comprar">
                    Comprar ($${movie.purchase_price})
                </button>
            </div>
        </div>
    `;
};

/**
 * Renderiza la lista de películas en el contenedor principal.
 */
const renderMovies = (moviesArray) => {
    // ID renombrado: 'catalogo' a 'catalog'
    const container = document.getElementById('catalog');
    const loader = document.getElementById('loader');

    // Ocultar loader y mostrar catálogo
    loader?.classList.add('hidden');
    container?.classList.remove('hidden');

    if (container) {
        // Inyección de HTML usando la nueva función
        const cardsHtml = moviesArray.map(generateCard).join('');
        container.innerHTML = cardsHtml;
    }
};

/* MÓDULO: LÓGICA DEL CARRITO Y TRANSACCIONES */
const addToCart = (id, selectedPrice, type) => {
    // La clave única debe ser compuesta (ID + Tipo).
    const key = `${id}-${type}`;

    if (cart.has(key)) { // Usamos la clave compuesta
        // Si ya está, incrementamos la cantidad dentro del objeto.
        cart.get(key).qty += 1;
    } else {
        // Almacenamos el objeto completo la primera vez.
        cart.set(key, { // Usamos la clave compuesta
            qty: 1,
            price: selectedPrice,
            type: type, // 'Alquiler' o 'Compra' (Etiqueta)
            movieId: id // GUARDAMOS el ID original para buscar la película
        });
    }
    updateCartUI();
};

const removeFromCart = (key) => { // Recibe la clave COMPUESTA como string
    cart.delete(key);
    updateCartUI();
};

const checkout = () => {
    if (cart.size === 0) {
        notify("¡Tu carrito está vacío!");
        return;
    }

    notify("¡Gracias por tu pedido! La compra ha sido finalizada con éxito.");
    cart.clear();
    updateCartUI();

    setTimeout(() => {
        toggleCart();
    }, 300);
};

const updateCartUI = () => {
    // 1. Obtener referencias del DOM (IDs renombrados)
    const container = document.getElementById('cart-items-container');
    const badge = document.getElementById('badge-cart');
    const totalEl = document.getElementById('cart-total-price');

    let totalItems = 0;
    let totalPrice = 0;
    let html = '';

    if (cart.size === 0) {
        // Estado: Carrito vacío
        container.innerHTML = '<p style="color: #888; text-align: center; margin-top: 50px;">El carrito está vacío</p>';
        badge.classList.add('hidden');
    } else {
        // Iteramos sobre la clave COMPUESTA ([key, item])
        for (const [key, item] of cart) {
            // Buscamos la película usando el ID original (item.movieId)
            const product = movies.find(p => p.id === item.movieId);

            if (!product) {
                // Se eliminó el console.error de depuración
                continue; 
            }

            totalItems += item.qty;
            totalPrice += (item.price * item.qty);

            // El botón de eliminar llama a removeFromCart con la clave COMPUESTA (key)
            html += `
                <div class="cart-item">
                    <div>
                        <strong>${product.name}</strong><br>
                        <small>(${item.type}) - ${item.qty} x $${item.price.toFixed(2)}</small>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span>$${(item.price * item.qty).toFixed(2)}</span>
                        <button onclick="removeFromCart('${key}')">&times;</button>
                    </div>
                </div>`;
        }

        // 3. Inyectar el HTML y actualizar el badge
        container.innerHTML = html;
        badge.textContent = totalItems;
        badge.classList.remove('hidden');
    }

    // 4. Actualizar el precio total final
    totalEl.textContent = '$' + totalPrice.toFixed(2);
};

const toggleCart = () => {
    // Clase renombrada: cart-modal se mantiene como ID, la clase es cart-sidebar--open
    document.getElementById('cart-modal').classList.toggle('cart-sidebar--open');
};

const handleTransaction = (id, type) => {
    // movies renombrado
    const movie = movies.find(p => p.id === id);
    if (!movie) return; // Salir si la película no existe

    // 2. Determinar el precio y la etiqueta (el nombre) según el 'type' de transacción
    // Se usan los nuevos nombres de propiedades en inglés
    const selectedPrice = (type === 'alquilar') ? movie.rental_price : movie.purchase_price;

    // El 'typeLabel' será la cadena que se muestra en el carrito (ej. 'Alquiler' o 'Compra')
    const typeLabel = (type === 'alquilar') ? 'Alquiler' : 'Compra';

    // 3. Llamar a addToCart con todos los datos necesarios
    addToCart(id, selectedPrice, typeLabel);

    // 4. Mostrar la notificación 
    notify(`¡Película "${movie.name}" añadida al carrito!`);
};

/* MÓDULO: EVENTOS Y LISTENERS */
const setupFilterListeners = (allProducts) => {
    // Selector de botón renombrado
    const buttons = document.querySelectorAll('.filter-nav__button');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.value = '';

            // Clases renombradas
            buttons.forEach(b => b.classList.remove('filter-nav__button--active'));
            e.target.classList.add('filter-nav__button--active');

            const category = e.target.dataset.cat;
            filterMovies(allProducts, category);
        });
    });
};

const addTransactionListeners = () => {
    // TEMA 4: Delegación de Eventos en el contenedor 'catalog'
    const container = document.getElementById('catalog');
    if (container) {
        container.addEventListener('click', (e) => {
            const target = e.target;

            // SOLUCIÓN: Usamos .closest() para encontrar el botón de acción
            const actionButton = target.closest('.product-card__actions__button');

            // 1. Verificamos que el clic realmente vino de un botón de acción
            if (actionButton) {

                // 2. Leemos los data-attributes del botón que encontramos
                const id = parseInt(actionButton.dataset.id);
                const type = actionButton.dataset.type;

                // 3. Verificamos la integridad de los datos
                if (type && !isNaN(id)) {
                    handleTransaction(id, type);
                }
            }
        });
    }
};

function scrollToTop() {
    /* * Esta función desplaza la vista de la página web de forma suave
     * hasta el inicio (borde superior) del documento (Viewport Root). 
     */
    // Seleccionamos el elemento raíz de la página (el <html>) para asegurar 
    // que el scroll afecte a toda la ventana del navegador.
    const pageStart = document.documentElement;

    // Se llama al método 'scrollIntoView()', que desplaza la ventana hasta el elemento seleccionado.
    pageStart.scrollIntoView({

        // Propiedad 'behavior': 'smooth' activa una animación gradual.
        behavior: 'smooth',

        // Propiedad 'block': 'start' alinea el borde superior del elemento 
        // con el borde superior del área visible (viewport).
        block: 'start'
    });
}

/* MÓDULO: JQUERY (para el Hover) */
const addHoverListenersJQuery = () => {
    // Se mantiene el console.warn para depurar la carga de jQuery si falla.
    if (typeof jQuery === 'undefined' || typeof $ === 'undefined') {
        console.warn("jQuery no está cargado. La funcionalidad de hover no está disponible.");
        return;
    }

    // Lógica de hover de jQuery
    // Selectores renombrados
    $(document).off('mouseover', '.product-card').on('mouseover', '.product-card', function () {
        $(this).find('.product-card__image--active').css("display", "none");
        $(this).find('.product-card__top-content').css('background-color', '#820000');
        $(this).find('.product-card__play-icon').css('display', 'flex');
        $(this).find('.product-card__details').css("display", "none");
        $(this).find('.product-card__trailer')
            .css("display", "flex")
            .css('align-items', 'center'); 
    });

    $(document).off('mouseout', '.product-card').on('mouseout', '.product-card', function () {
        $(this).find('.product-card__top-content').css('background-color', 'beige');
        $(this).find('.product-card__image--active').css("display", "flex");
        $(this).find('.product-card__play-icon').css('display', 'none');
        $(this).find('.product-card__details').css("display", "flex");
        $(this).find('.product-card__trailer').css("display", "none");
        $(this).find('.product-card__trailer').css('align-items', 'flex-start');

    });
};

// =========================================================================
// 4. MÓDULO: ARRANQUE E INICIALIZACIÓN (DOMContentLoaded)
// =========================================================================

/**
 * Configuración de Variables Globales (Exposición de funciones al Window)
 * OBLIGATORIO para el modelo modular (`type="module"`)
 */
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;
window.checkout = checkout;
window.scrollToTop = scrollToTop;

/**
 * Listener DOMContentLoaded
 * Asegura que el script se ejecute cuando el HTML esté completamente cargado.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 0. Inicialización de notify
    notify = createNotifier();

    // 1. Inicializar Filtros y Buscador
    setupFilterListeners(movies);
    const searchInput = document.getElementById('search-input');

    if (searchInput) {
        searchInput.addEventListener('input', () => filterMovies(movies));
    }

    // 2. Renderizado Inicial de todo el catálogo
    renderMovies(movies);

    // 3. CONEXIÓN DE LISTENERS (SOLO SE EJECUTA UNA VEZ EN LA VIDA DE LA APP)
    addTransactionListeners();
    addHoverListenersJQuery();

    // 4. Conectar los botones de la cabecera
    document.getElementById('btn-cart').addEventListener('click', toggleCart);
    document.getElementById('btn-checkout').addEventListener('click', checkout);

    // 5. CONEXIÓN DEL BOTÓN REGRESAR AL INICIO
    const scrollTopButton = document.getElementById('btn-scroll-top');
    if (scrollTopButton) {
        // Enlaza la función al evento 'click'
        scrollTopButton.addEventListener('click', scrollToTop);
    }
});
