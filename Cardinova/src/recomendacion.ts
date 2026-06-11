interface Farmacia {
    nombre: string;
    direccion: string;
    telefono: string;
    distancia: string;
    medicamentos: string[];
}

// Variable global para que verDetalle pueda encontrar las farmacias
let farmaciasGlobales: Farmacia[] = [];

// 1. Declaración global para que el HTML los vea
(window as any).verDetalle = verDetalle;
(window as any).volverALista = volverALista;

function verDetalle(nombre: string) {
    const farmacia = farmaciasGlobales.find(f => f.nombre === nombre);
    if (!farmacia) return;

    // Ocultar lista, mostrar detalle
    document.getElementById("contenedor-principal")!.style.display = "none";
    document.getElementById("vista-detalle")!.style.display = "block";
    
    document.getElementById("detalle-nombre")!.innerText = `🏥 ${farmacia.nombre}`;
    
    // Renderizar lista inicial de meds
    renderizarMedicamentos(farmacia.medicamentos);

    // Búsqueda interna
    const inputBusqueda = document.getElementById("buscarMedEnFarmacia") as HTMLInputElement;
    inputBusqueda.oninput = () => {
        const filtro = inputBusqueda.value.toLowerCase();
        const filtrados = farmacia.medicamentos.filter(m => m.toLowerCase().includes(filtro));
        renderizarMedicamentos(filtrados);
    };
}

function renderizarMedicamentos(meds: string[]) {
    const contenedor = document.getElementById("lista-meds-farmacia")!;
    contenedor.innerHTML = meds.length > 0 
        ? meds.map(m => `<div style="padding: 10px; border-bottom: 1px solid #eee;">💊 ${m}</div>`).join("")
        : "<p>No se encontró ese medicamento aquí.</p>";
}

function volverALista() {
    document.getElementById("contenedor-principal")!.style.display = "block";
    document.getElementById("vista-detalle")!.style.display = "none";
}

function mostrarFarmacias(farmacias: Farmacia[], resultado: HTMLElement) {
    resultado.innerHTML = ""; 
    resultado.style.display = "flex";
    resultado.style.flexDirection = "column";
    resultado.style.gap = "15px";

    farmacias.forEach(f => {
        resultado.innerHTML += `
            <div class="tarjeta-farmacia" onclick="verDetalle('${f.nombre}')">
                <div class="header-tarjeta">
                    <strong>🏥 ${f.nombre}</strong>
                    <button class="btn-fav" onclick="event.stopPropagation(); toggleFavorito('${f.nombre}')">🤍</button>
                </div>
                <div class="body-tarjeta">
                    <p>💊 Medicamentos: ${f.medicamentos.join(", ")}</p>
                </div>
                <div class="footer-tarjeta">
                    <span>📞 ${f.telefono}</span>
                    <span>🚗 ${f.distancia}</span>
                    <a href="#" onclick="event.stopPropagation()">Calle Central</a>
                </div>
            </div>
        `;
    });
}

export async function iniciarRecomendaciones() {
    const respuesta = await fetch("/src/data/farmacias.json");
    farmaciasGlobales = await respuesta.json(); // Llenamos la variable global

    const resultado = document.getElementById("resultado");
    if (resultado) mostrarFarmacias(farmaciasGlobales, resultado);

    const boton = document.getElementById("btnBuscar");
    boton?.addEventListener("click", () => {
        const input = document.getElementById("buscarMedicamento") as HTMLInputElement;
        const medicamento = input.value.toLowerCase();

        const encontradas = farmaciasGlobales.filter(f => 
            f.nombre.toLowerCase().includes(medicamento) || 
            f.medicamentos.some(m => m.toLowerCase().includes(medicamento))
        );

        if (resultado) mostrarFarmacias(encontradas, resultado);
    });
}