interface Farmacia {
    nombre: string;
    direccion: string;
    telefono: string;
    distancia: string;
    medicamentos: string[];
}

let farmaciasGlobales: Farmacia[] = [];

// --- EXPOSICIÓN GLOBAL (Para que el HTML encuentre las funciones) ---
(window as any).verDetalle = verDetalle;
(window as any).volverALista = volverALista;
(window as any).toggleFavorito = toggleFavorito;
(window as any).mostrarFavoritos = mostrarFavoritos;

// --- LÓGICA DE FARMACIAS ---
function verDetalle(nombre: string) {
    const farmacia = farmaciasGlobales.find(f => f.nombre === nombre);
    if (!farmacia) return;
    document.getElementById("seccion-farmacias")!.style.display = "none";
    document.getElementById("vista-detalle")!.style.display = "block";
    document.getElementById("detalle-nombre")!.innerText = `🏥 ${farmacia.nombre}`;
    renderizarMedicamentos(farmacia.medicamentos);
}

function renderizarMedicamentos(meds: string[]) {
    const contenedor = document.getElementById("lista-meds-farmacia")!;
    contenedor.innerHTML = meds.length > 0 
        ? meds.map(m => `<div class="medicamento-item">💊 ${m}</div>`).join("")
        : "<p>No se encontró ese medicamento aquí.</p>";
}

function volverALista() {
    document.getElementById("seccion-farmacias")!.style.display = "block";
    document.getElementById("vista-detalle")!.style.display = "none";
}

function mostrarFarmacias(farmacias: Farmacia[], contenedor: HTMLElement) {
    contenedor.innerHTML = ""; 
    if (farmacias.length === 0) {
        contenedor.innerHTML = "<p>No se encontraron farmacias.</p>";
        return;
    }
    farmacias.forEach(f => {
        const div = document.createElement("div");
        div.className = "tarjeta-farmacia";
        div.onclick = () => verDetalle(f.nombre);
        div.innerHTML = `
            <div class="header-tarjeta">
                <strong>🏥 ${f.nombre}</strong>
                <button class="btn-fav" onclick="event.stopPropagation(); toggleFavorito('${f.nombre}')">🤍</button>
            </div>
            <div class="body-tarjeta"><p>💊 ${f.medicamentos.slice(0, 3).join(", ")}...</p></div>
            <div class="footer-tarjeta"><span>📞 ${f.telefono}</span> <span>🚗 ${f.distancia}</span></div>
        `;
        contenedor.appendChild(div);
    });
}

// --- LÓGICA DE FAVORITOS (Integrada) ---
export function toggleFavorito(nombreFarmacia: string) {
    let favoritos: string[] = JSON.parse(localStorage.getItem("favoritos") || "[]");
    if (favoritos.includes(nombreFarmacia)) {
        favoritos = favoritos.filter(f => f !== nombreFarmacia);
    } else {
        favoritos.push(nombreFarmacia);
    }
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    mostrarFavoritos();
}

export function mostrarFavoritos() {
    const lista = document.getElementById("listaFavoritos");
    if (!lista) return;
    const favoritos: string[] = JSON.parse(localStorage.getItem("favoritos") || "[]");
    lista.innerHTML = favoritos.length > 0 
        ? favoritos.map(nombre => `
            <div class="tarjeta-favorito">
                <span>⭐ ${nombre}</span>
                <button onclick="toggleFavorito('${nombre}')" class="btn-quitar">❌</button>
            </div>`).join("")
        : "<p>No tienes favoritos.</p>";
}

// --- INICIALIZACIÓN ---
export async function iniciarRecomendaciones() {
    try {
        const respuesta = await fetch("/src/data/farmacias.json");
        farmaciasGlobales = await respuesta.json();

        // AQUÍ ESTÁ EL PUNTO CLAVE:
        const contenedor = document.getElementById("resultado");
        if (contenedor) {
            // Esto es lo que pone las farmacias en pantalla
            mostrarFarmacias(farmaciasGlobales, contenedor as HTMLElement);
        } else {
            console.error("No se encontró el elemento con ID 'resultado' en el HTML");
        }

        // ... resto de tu lógica de búsqueda
    } catch (error) {
        console.error("Error:", error);
    }
}