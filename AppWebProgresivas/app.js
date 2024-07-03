const apiKey = 'a5446536c7244c198f672e1cc870135d';
const url = 'https://api.spoonacular.com/recipes/complexSearch';
const db = new PouchDB('recetas_favoritas');

document.getElementById('buscar').addEventListener('click', buscarRecetas);
document.addEventListener('DOMContentLoaded', cargarRecetasFavoritas);

function buscarRecetas() {
    const ingredientes = document.getElementById('busqueda').value;
    fetch(`${url}?apiKey=${apiKey}&includeIngredients=${ingredientes}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => mostrarRecetas(data.results))
        .catch(error => console.error('Error:', error));
}

function mostrarRecetas(recetas) {
    const listaRecetas = document.getElementById('lista-recetas');
    listaRecetas.innerHTML = '';
    recetas.forEach(receta => {
        const recetaCard = document.createElement('div');
        recetaCard.className = 'col-md-6 mb-4';
        recetaCard.innerHTML = `
            <div class="card">
                <img src="${receta.image}" class="card-img-top" alt="${receta.title}">
                <div class="card-body">
                    <h3 class="card-title fs-5">${receta.title}</h3>
                    <button class="btn btn-success mb-2" onclick="verDetalles(${receta.id})">Ver Detalles</button>
                    
                </div>
            </div>
        `;
        listaRecetas.appendChild(recetaCard);
    });
}

function verDetalles(id) {
    if (navigator.onLine) {
        fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`)
            .then(response => response.json())
            .then(data => mostrarDetalles(data))
            .catch(error => console.error('Error:', error));
    } else {
        db.get(id.toString()).then(doc => {
            mostrarDetalles(doc.details);
        }).catch(err => {
            console.error('Error:', err);
        });
    }
}

function mostrarDetalles(receta) {
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = `
        <div class="modal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${receta.title}</h3>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <img src="${receta.image}" class="img-fluid" alt="${receta.title}">
                    <p>${receta.instructions}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline-success" onclick="agregarFavorito(${receta.id}, '${receta.title}', '${receta.image}')">Agregar a Favoritos</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modalContainer);
    const modal = new bootstrap.Modal(modalContainer.querySelector('.modal'));
    modal.show();
}

function agregarFavorito(id, titulo, imagen) {
    fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const receta = {
                _id: id.toString(),
                title: titulo,
                image: imagen,
                details: data
            };
            db.put(receta).then(() => {
                alert('Receta agregada a favoritos');
                cargarRecetasFavoritas();
            }).catch(err => {
                if (err.name === 'conflict') {
                    alert('La receta ya está en favoritos');
                } else {
                    console.error('Error:', err);
                }
            });
        })
        .catch(err => console.error('Error:', err));
}

function cargarRecetasFavoritas() {
    db.allDocs({ include_docs: true }).then(docs => {
        const recetasFavoritasContainer = document.getElementById('recetas-favoritas');
        recetasFavoritasContainer.innerHTML = '';
        docs.rows.forEach(row => {
            const receta = row.doc;
            const recetaCard = document.createElement('div');
            recetaCard.className = 'col-md-4 receta-card';
            recetaCard.innerHTML = `
                <div class="card">
                    <img src="${receta.image}" class="card-img-top" alt="${receta.title}">
                    <div class="card-body">
                        <h3 class="card-title fs-5">${receta.title}</h3>
                        <button class="btn btn-success mb-2" onclick="verDetalles('${receta._id}')">Ver Detalles</button>
                        <button class="btn btn-outline-success" onclick="eliminarFavorito('${receta._id}')">Eliminar de Favoritos</button>
                    </div>
                </div>
                
                
            `;
            recetasFavoritasContainer.appendChild(recetaCard);
        });
    }).catch(err => {
        console.error('Error:', err);
    });
}

function eliminarFavorito(id) {
    db.get(id.toString()).then(doc => {
        return db.remove(doc);
    }).then(() => {
        alert('Receta eliminada de favoritos');
        cargarRecetasFavoritas();
    }).catch(err => {
        console.error('Error:', err);
    });
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installButton').addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('El usuario aceptó instalar la aplicación');
            } else {
                console.log('El usuario rechazó instalar la aplicación');
            }
            deferredPrompt = null;
        });
    });
});

window.addEventListener('appinstalled', (event) => {
    console.log('PWA se ha instalado');
});
