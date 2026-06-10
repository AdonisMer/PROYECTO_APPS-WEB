import './style.css';
import gestionMedica from './assets/gestion_medica.png';
import publicoObjetivo from './assets/seccion_publico_objetivo.png';
// Importamos correctamente tu archivo JSON de datos
import doctoresPredeterminados from './data/doctores.json';

// 1. Asegurar que el DOM esté listo antes de ejecutar la lógica
document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. CONTROL DE ACCESO Y PERSONALIZACIÓN DE CITA MÉDICA ---
    if (window.location.pathname.includes("cita.html")) {
        const sesionActiva = localStorage.getItem("sesionActiva");
        if (sesionActiva !== "true") {
            alert("❌ Acceso denegado. Debes iniciar sesión para acceder al apartado de Cita Médica.");
            window.location.href = "login.html";
            return;
        }

        // --- SALUDO DINÁMICO PARA EL DOCTOR ---
        const rolUsuario = localStorage.getItem("rolUsuario");
        const nombreUsuario = localStorage.getItem("nombreUsuario");

        if (rolUsuario === "doctor" && nombreUsuario) {
            const infoCita = document.querySelector(".info-cita");
            if (infoCita) {
                const saludo = document.createElement("h1");
                saludo.textContent = `👋 ¡HOLA, ${nombreUsuario.toUpperCase()}!`;
                
                saludo.style.fontFamily = "var(--font-2)";
                saludo.style.color = "var(--color-text-title)";
                saludo.style.fontSize = "32px";
                saludo.style.marginBottom = "15px";
                saludo.style.textAlign = "left";

                const h2Cita = infoCita.querySelector("h2");
                if (h2Cita) {
                    infoCita.insertBefore(saludo, h2Cita);
                } else {
                    infoCita.prepend(saludo);
                }
            }
        }
    }

    // --- 2. LÓGICA DINÁMICA DE CERRAR SESIÓN (AL FINAL DE LA FILA) ---
    const linkLogin = document.querySelector('a[href*="login.html"]') as HTMLAnchorElement | null;
    
    if (linkLogin && localStorage.getItem("sesionActiva") === "true") {
        const liLogin = linkLogin.closest("li");
        const ulMenu = linkLogin.closest("ul");
        
        if (ulMenu && liLogin) {
            // Ocultamos por completo el li de "Iniciar Sesión" del principio
            liLogin.style.display = "none";
            
            // Creamos la nueva opción para el menú
            const liLogout = document.createElement("li");
            const linkLogout = document.createElement("a");
            linkLogout.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión';
            linkLogout.href = "#";
            
            // Evento para limpiar credenciales y salir
            linkLogout.addEventListener("click", (e) => {
                e.preventDefault();
                
                localStorage.removeItem("sesionActiva");
                localStorage.removeItem("rolUsuario");
                localStorage.removeItem("nombreUsuario");
                
                alert("🔒 Sesión cerrada correctamente");
                
                // Redirección inteligente dependiendo de la ubicación actual
                if (window.location.pathname.includes("modulos")) {
                    window.location.href = "../index.html";
                } else {
                    window.location.href = "index.html";
                }
            });
            
            // Colocamos el enlace dentro del li, y el li al final del ul
            liLogout.appendChild(linkLogout);
            ulMenu.appendChild(liLogout);
        }
    }

    // --- 3. LÓGICA DE IMÁGENES ---
    const imgFondo = document.getElementById('img-fondo-medico') as HTMLImageElement | null;
    const imgPublico = document.getElementById('img-publico') as HTMLImageElement | null;

    if (imgFondo) imgFondo.src = gestionMedica;
    if (imgPublico) imgPublico.src = publicoObjetivo;

    // --- 4. LÓGICA DE FORMULARIOS ---
    const form = document.querySelector("form") as HTMLFormElement | null;
    const nombreInput = document.getElementById("nombre") as HTMLInputElement | null;
    const correoInput = (document.getElementById("correo") || document.getElementById("email")) as HTMLInputElement | null;
    const passwordInput = document.getElementById("password") as HTMLInputElement | null;
    const confirmarInput = document.getElementById("confirmar") as HTMLInputElement | null;

    if (!form) return;

    const setupPasswordToggle = (inputId: string, buttonId: string, iconId: string) => {
        const input = document.getElementById(inputId) as HTMLInputElement | null;
        const button = document.getElementById(buttonId) as HTMLButtonElement | null;
        const icon = document.getElementById(iconId) as HTMLElement | null;
        
        if (button && input && icon) {
            button.addEventListener("click", () => {
                const isPassword = input.type === "password";
                input.type = isPassword ? "text" : "password";
                icon.className = isPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
                button.setAttribute("aria-label", isPassword ? "Ocultar" : "Mostrar");
            });
        }
    };

    setupPasswordToggle("password", "togglePassword", "eyeIcon");
    if (confirmarInput) setupPasswordToggle("toggleConfirm", "eyeIconConfirm");

    const setBorder = (el: HTMLInputElement | null, isValid: boolean) => {
        if (el) el.style.border = `2px solid ${isValid ? "green" : "red"}`;
    };

    if (correoInput) correoInput.addEventListener("input", () => setBorder(correoInput, correoInput.value.includes("@")));
    if (passwordInput) passwordInput.addEventListener("input", () => setBorder(passwordInput, passwordInput.value.length >= 4));
    if (confirmarInput && passwordInput) {
        confirmarInput.addEventListener("input", () => setBorder(confirmarInput, confirmarInput.value === passwordInput.value));
    }
    form.addEventListener("submit", (e: Event) => {
        e.preventDefault();
        const correo = correoInput?.value.trim() ?? "";
        const password = passwordInput?.value.trim() ?? "";

        if (!correo || !password) return alert("❌ Completa los campos obligatorios");

        const esRegistro = nombreInput !== null && confirmarInput !== null;

        // --- LÓGICA DE REGISTRO ---
        if (esRegistro && nombreInput && confirmarInput) {
            if (password !== confirmarInput.value.trim()) return alert("❌ Las contraseñas no coinciden");
            
            // 1. Traemos la lista de usuarios registrados previamente (si no hay, creamos un arreglo vacío)
            const usuariosGuardados = JSON.parse(localStorage.getItem("usuariosRegistrados") || "[]");
            
            // 2. Verificamos si el correo ya existe
            const correoExiste = usuariosGuardados.some((u: any) => u.correo === correo);
            if (correoExiste) return alert("❌ Este correo ya está registrado.");

            // 3. Creamos el nuevo usuario y lo metemos a la lista
            const nuevoUsuario = { 
                nombre: nombreInput.value.trim(), 
                correo: correo, 
                password: password,
                rol: "paciente"
            };
            usuariosGuardados.push(nuevoUsuario);
            
            // 4. Guardamos la lista actualizada en nuestra "mini BD" del navegador
            localStorage.setItem("usuariosRegistrados", JSON.stringify(usuariosGuardados));
            alert("✅ Cuenta creada correctamente");
            window.location.href = "login.html";
            
        } else {
            // --- LÓGICA DE LOGIN ---
            // 1. Buscamos primero si es un doctor
            const medicoEncontrado = doctoresPredeterminados.find(
                (medico: any) => medico.correo === correo && medico.password === password
            );

            if (medicoEncontrado) {
                alert(`✅ Bienvenido ${medicoEncontrado.nombre} (Personal Médico)`);
                localStorage.setItem("sesionActiva", "true");
                localStorage.setItem("rolUsuario", medicoEncontrado.rol);
                localStorage.setItem("nombreUsuario", medicoEncontrado.nombre);
                window.location.href = "cita.html";
                return;
            }

            // 2. Si no es doctor, unimos los pacientes predeterminados del JSON con los nuevos registrados en localStorage
            const usuariosGuardados = JSON.parse(localStorage.getItem("usuariosRegistrados") || "[]");
            
            // Aquí puedes usar la importación de tu pacientes.json (asegúrate de importarlo arriba)
            // Para este ejemplo asumimos que importaste: import pacientesPredeterminados from './data/pacientes.json';
            const todosLosPacientes = [...pacientesPredeterminados, ...usuariosGuardados];

            // 3. Buscamos en toda la lista de pacientes
            const pacienteEncontrado = todosLosPacientes.find(
                (paciente: any) => paciente.correo === correo && paciente.password === password
            );

            if (pacienteEncontrado) {
                alert(`✅ Bienvenido ${pacienteEncontrado.nombre}`);
                localStorage.setItem("sesionActiva", "true");
                localStorage.setItem("rolUsuario", pacienteEncontrado.rol);
                localStorage.setItem("nombreUsuario", pacienteEncontrado.nombre);
                window.location.href = "cita.html";
            } else {
                alert("❌ Correo o contraseña incorrectos");
            }
        }
    });
});