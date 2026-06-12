interface Medicamento {

    nombre:string;
    precio:number;
    disponible:boolean;

}


interface Farmacia {

    nombre:string;
    direccion:string;
    telefono:string;
    distancia:number;
    medicamentos:Medicamento[];

}

let farmaciasGlobales: Farmacia[] = [];

let medicamentoBuscado:string = "";

// --- EXPOSICIÓN GLOBAL (Para que el HTML encuentre las funciones) ---
(window as any).verDetalle = verDetalle;
(window as any).volverALista = volverALista;
(window as any).toggleFavorito = toggleFavorito;
(window as any).mostrarFavoritos = mostrarFavoritos;


function verDetalle(nombre: string) {

    const farmacia = farmaciasGlobales.find(
        f => f.nombre === nombre
    );
    if (!farmacia) return;
    document.getElementById("seccion-farmacias")!.style.display = "none";
    document.getElementById("vista-detalle")!.style.display = "block";
    document.getElementById("detalle-nombre")!.innerText =
    `🏥 ${farmacia.nombre}`;
    const info = document.getElementById("lista-meds-farmacia")!;
    info.innerHTML = `
        <div class="info-farmacia">
            <p>
            📍 Dirección:
            ${farmacia.direccion}
            </p>
            <p>
            📞 Teléfono:
            ${farmacia.telefono}
            </p>
            <p>
            🚗 Distancia:
            ${farmacia.distancia} km
            </p>
        </div>
        <h3>
        💊 Medicamentos disponibles
        </h3>
        ${farmacia.medicamentos.map(m => `
            <div class="medicamento-item">
                <h4>
                ${m.nombre}
                </h4>
                <p>
                💵 Precio:
                $${m.precio}
                </p>
                <p>
                ${
                    m.disponible
                    ? "🟢 Disponible"
                    : "🔴 No disponible"
                }
                </p>
            </div>
        `).join("")}
    `;
}

function renderizarMedicamentos(meds: Medicamento[]) {
    const contenedor = document.getElementById("lista-meds-farmacia")!;
    contenedor.innerHTML = meds.length > 0
    ? meds.map(m => `
        <div class="medicamento-item">
            <h3>💊 ${m.nombre}</h3>
            <p>💵 Precio: $${m.precio}</p>
            <p>
            ${
                m.disponible
                ? "🟢 Disponible"
                : "🔴 Agotado"
            }
            </p>
        </div>
    `).join("")
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
        console.log("Mostrando farmacia:", f.nombre);
        const div = document.createElement("div");
        div.className = "tarjeta-farmacia";

        const medicamentoEncontrado = medicamentoBuscado
        ? encontrarMedicamento(f, medicamentoBuscado)
        : undefined;

        div.onclick = () => verDetalle(f.nombre);
        div.innerHTML = `
            <div class="header-tarjeta">
                
                <strong>
                ${
                f.distancia === farmacias[0].distancia
                ?
                "⭐ "
                :
                ""
                }
                🏥 ${f.nombre}
                </strong>


                <button 
                class="btn-fav"
                onclick="event.stopPropagation(); toggleFavorito('${f.nombre}')">
                ❤️                
                </button>
            </div>
            
            <div class="body-tarjeta">
            ${
            medicamentoEncontrado
            ?

            `
            <p>
            💊 Medicamento encontrado:
            <strong>
            ${medicamentoEncontrado.nombre}
            </strong>
            </p>
            <p>
            💵 Precio:
            $${medicamentoEncontrado.precio}
            </p>
            <p>
            ${
            medicamentoEncontrado.disponible
            ?
            "🟢 Disponible"
            :
            "🔴 Agotado"
            }
            </p>
            `
            :
            `
            <p>
            💊 ${f.medicamentos
            .slice(0,3)
            .map(m=>m.nombre)
            .join(", ")}
            </p>
            `
            }
            <p>
            📍 ${f.direccion}
            </p>
            </div>
            <div class="footer-tarjeta">
                <span>
                📞 ${f.telefono}
                </span>
                <span>
                🚗 ${f.distancia} km
                </span>
            </div>
        `;
        console.log("Tarjeta creada:", div);    
        contenedor.appendChild(div);
    });
}


function buscarMedicamento(nombre: string) {
    console.log("ID variable:", farmaciasGlobales.length);
    const resultado = farmaciasGlobales.filter(farmacia => {
        return farmacia.medicamentos.some(med =>
            med.nombre
            .toLowerCase()
            .includes(nombre.toLowerCase())
        );
    });
    console.log("Resultado búsqueda:", resultado);
    resultado.sort((a,b)=>{
        const medA = encontrarMedicamento(a,nombre);
        const medB = encontrarMedicamento(b,nombre);
        if(medA?.disponible && !medB?.disponible){
            return -1;
        }
        if(!medA?.disponible && medB?.disponible){
            return 1;
        }
        return a.distancia - b.distancia;
    });
    const contenedor = document.getElementById("resultado");
    if(contenedor){
        mostrarFarmacias(
            resultado,
            contenedor as HTMLElement
        );
    }
}

function encontrarMedicamento(
    farmacia: Farmacia,
    nombre: string
): Medicamento | undefined {

    return farmacia.medicamentos.find(
        med =>
        med.nombre
        .toLowerCase()
        .includes(nombre.toLowerCase())
    );
}


function obtenerMejorOpcion(farmacias: Farmacia[], medicamento: string) {
    let mejor: {
        farmacia: Farmacia,
        medicamento: Medicamento
    } | null = null;

    farmacias.forEach(f => {
        const med = f.medicamentos.find(
            m => 
            m.nombre.toLowerCase()
            .includes(medicamento.toLowerCase())
            &&
            m.disponible
        );
        if(med){
            if(
                mejor === null ||
                med.precio < mejor.medicamento.precio
            ){
                mejor = {
                    farmacia:f,
                    medicamento:med
                };
            }
        }
    });
    return mejor;
}


function mostrarRecomendacion() {
    const caja = document.getElementById("recomendacion");
    if(!caja || medicamentoBuscado === "") return;
    const mejor = obtenerMejorOpcion(
        farmaciasGlobales,
        medicamentoBuscado
    );
    if(mejor){
        caja.innerHTML = `
        <div class="tarjeta-recomendacion">

            <h3>
            ⭐ Mejor opción recomendada
            </h3>

            <h4>
            🏥 ${mejor.farmacia.nombre}
            </h4>

            <p>
            💊 ${mejor.medicamento.nombre}
            </p>

            <p>
            💵 Precio:
            $${mejor.medicamento.precio}
            </p>

            <p>
            🚗 Distancia:
            ${mejor.farmacia.distancia} km
            </p>

            <p>
            📍 ${mejor.farmacia.direccion}
            </p>
        </div>
        `;
    }else{
        caja.innerHTML = "";
    }
}


// --- LÓGICA DE FAVORITOS ---
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

        console.log("ID variable:", farmaciasGlobales.length);

        const contenedor = document.getElementById("resultado");
        if (contenedor) {
            // Esto es lo que pone las farmacias en pantalla
            mostrarFarmacias(farmaciasGlobales, contenedor as HTMLElement);
            const boton = document.getElementById("btnBuscar");
            const input = document.getElementById("buscarMedicamento") as HTMLInputElement | null;
            if(boton && input){
                boton.addEventListener("click",()=>{
                    
                    const texto = input.value.trim();
                    if(texto===""){
                        mostrarFarmacias(
                            farmaciasGlobales,
                            contenedor as HTMLElement
                        );
                    }else{
                        medicamentoBuscado = texto;
                        buscarMedicamento(texto);
                        mostrarRecomendacion();
                    }
                });
            }
        } else {
            console.error("No se encontró el elemento con ID 'resultado' en el HTML");
        }

        // ... resto de tu lógica de búsqueda
    } catch (error) {
        console.error("Error:", error);
    }
}