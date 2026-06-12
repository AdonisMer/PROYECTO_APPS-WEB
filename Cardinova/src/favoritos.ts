export function toggleFavorito(nombreFarmacia: string) {
    let favoritos: string[] = JSON.parse(localStorage.getItem("favoritos") || "[]");

    if (favoritos.includes(nombreFarmacia)) {
        // Si existe, lo eliminamos
        favoritos = favoritos.filter(f => f !== nombreFarmacia);
    } else {
        // Si no existe, lo agregamos
        favoritos.push(nombreFarmacia);
    }

    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    mostrarFavoritos(); // Refresca la lista visualmente
}

export function mostrarFavoritos() {
    const lista = document.getElementById("listaFavoritos");
    if (!lista) return;

    const favoritos: string[] = JSON.parse(localStorage.getItem("favoritos") || "[]");

    if (favoritos.length === 0) {
        lista.innerHTML = "<p>No tienes farmacias favoritas.</p>";
        return;
    }

    lista.innerHTML = favoritos.map(nombre => `
        <div class="tarjeta-favorito">
            <span>⭐ ${nombre}</span>
            <button onclick="toggleFavorito('${nombre}')" class="btn-quitar">
                ❌ Quitar
            </button>
        </div>
    `).join("");
}

(window as any).toggleFavorito = toggleFavorito;