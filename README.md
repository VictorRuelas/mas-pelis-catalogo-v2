# 🎬 +Pelis | Catálogo Digital de Películas

<img width="1888" height="877" alt="image" src="https://github.com/user-attachments/assets/92e5f296-a62e-45e7-b01a-3bd58d18d9dd" />


## 🌟 Descripción del Proyecto

**+Pelis Digital Catalog** es una plataforma *frontend* de catálogo de películas (simulación de *streaming*/alquiler) desarrollada como proyecto académico.

La aplicación utiliza un conjunto robusto de **50 películas reales** con datos verificados para demostrar la gestión eficiente de datos. El proyecto se basa en una arquitectura de scripts tradicional para la lógica del lado del cliente, optimizado para ser un sitio estático de alto rendimiento.

## 🚀 Despliegue en Vercel

El proyecto está diseñado para ser un sitio estático de alto rendimiento. Puedes acceder a la versión desplegada en línea a través de Vercel:

[**URL del Proyecto Desplegado**](<Pega aquí tu enlace de Vercel>)

---

## 🛠️ Tecnologías y Metodologías

| Tecnología | Descripción |
| :--- | :--- |
| **HTML5** | Estructura semántica del contenido. |
| **CSS3** | Estilizado moderno, con enfoque en la responsividad. |
| **Metodología BEM** | Usada en todo el CSS para la creación de componentes modulares y escalables (`Bloque__Elemento--Modificador`). |
| **JavaScript** | Lógica principal del lado del cliente, ejecutada como scripts tradicionales y apoyada por la librería **jQuery**. |

---

## ✨ Funcionalidades Clave

* **Catálogo Extenso:** **50 películas reales** con tráilers verificados de YouTube.
* **Renderizado Dinámico:** El renderizado de cada tarjeta de película se maneja completamente desde JavaScript (generalmente usando un `<div>` o similar).
* **Gestión de Datos:** La base de datos de películas se carga directamente desde `data/catalogo.js`.
* **Sistema de Filtros:** Permite filtrar películas dinámicamente por género.
* **Búsqueda:** Búsqueda en tiempo real por título y sinopsis.
* **Carrito de Compras/Alquiler:**
    * Utiliza la estructura de datos **`Map`** para una gestión eficiente y rápida del carrito.
    * Permite añadir películas y seleccionar si es para alquiler o compra.

---

## 📁 Estructura de Archivos

├── css/ │ ├── fonts/ # Fuentes utilizadas │ └── styles.css # Archivo principal de estilos y variables
├── data/ │ └── catalogo.js # La base de datos de 50 películas
├── img/ # Assets de imágenes (posters e iconos)
├── js/ │ ├── app.js # Lógica central del proyecto │ └── jquery.js # Librería jQuery 
├── index.html # Archivo principal 
├── .gitignore # Archivos ignorados por Git
└── README.md # Este documento
