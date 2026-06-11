import './style.css';
import gestionMedica from './assets/gestion_medica.png';
import publicoObjetivo from './assets/seccion_publico_objetivo.png';
import doctoresPredeterminados from './data/doctores.json';
import pacientesPredeterminados from './data/pacientes.json';
import { iniciarRecomendaciones } from './recomendacion';
import { mostrarFavoritos } from './favoritos';
import { inicializarAgendamiento } from './agendamiento';

document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector('.formulario1')) {
        inicializarAgendamiento();
    }
    // MÓDULO DE FARMACIAS RECOMENDADAS
    if (window.location.pathname.includes("recomendacion.html")) {
        iniciarRecomendaciones();
        mostrarFavoritos();
    }
    
    // CONTROL DE ACCESO Y PERSONALIZACIÓN DE CITA MÉDICA ---
    if (window.location.pathname.includes("cita.html")) {
        const sesionActiva = localStorage.getItem("sesionActiva");
        if (sesionActiva !== "true") {
            alert("❌ Acceso denegado. Debes iniciar sesión para acceder al apartado de Cita Médica.");
            window.location.href = "login.html";
            return;
        }

        const rolUsuario = localStorage.getItem("rolUsuario");
        const nombreUsuario = localStorage.getItem("nombreUsuario");

        // --- SALUDO DINÁMICO PARA EL DOCTOR ---
        if (rolUsuario === "doctor" && nombreUsuario) {
            const infoCita = document.querySelector(".info-cita");
            if (infoCita) {
                const saludo = document.createElement("h1");
                saludo.className = "saludo-doctor";
                saludo.textContent = `👋 ¡HOLA, ${nombreUsuario.toUpperCase()}!`;

                const h2Cita = infoCita.querySelector("h2");
                if (h2Cita) {
                    infoCita.insertBefore(saludo, h2Cita);
                } else {
                    infoCita.prepend(saludo);
                }
            }
        }

        // --- LÓGICA DEL SELECTOR DINÁMICO DE PACIENTES ---
        const selectorPacientes = document.getElementById("seleccionar-paciente") as HTMLSelectElement | null;
        const elEdad = document.getElementById("vista-edad");
        const elTelefono = document.getElementById("vista-telefono");
        const elSangre = document.getElementById("vista-sangre");
        const elDiagnostico = document.getElementById("vista-diagnostico");
        const elMedicamentos = document.getElementById("vista-medicamentos");

        if (selectorPacientes) {
            const usuariosGuardados = JSON.parse(localStorage.getItem("usuariosRegistrados") || "[]");
            const todosLosPacientes = [...pacientesPredeterminados, ...usuariosGuardados];

            // FUNCIÓN QUE CAMBIA TODA LA INFORMACIÓN EN PANTALLA
            const actualizarCamposPaciente = (paciente: any) => {
                if (elEdad) elEdad.textContent = paciente.edad ? `${paciente.edad} años` : "No especificado";
                if (elTelefono) elTelefono.textContent = paciente.telefono || "No especificado";
                if (elSangre) elSangre.textContent = paciente.tipoSangre || "No especificado";
                if (elDiagnostico) elDiagnostico.textContent = paciente.diagnostico || "Sin diagnóstico registrado";
                if (elMedicamentos) elMedicamentos.innerHTML = paciente.medicamentos || "Sin medicamentos asignados";
            };

            if (rolUsuario === "doctor") {
                selectorPacientes.innerHTML = "";
                todosLosPacientes.forEach((paciente: any) => {
                    const option = document.createElement("option");
                    option.value = paciente.correo;
                    option.textContent = paciente.nombre;
                    selectorPacientes.appendChild(option);
                });

                selectorPacientes.addEventListener("change", () => {
                    const pacienteSeleccionado = todosLosPacientes.find(p => p.correo === selectorPacientes.value);
                    if (pacienteSeleccionado) {
                        actualizarCamposPaciente(pacienteSeleccionado);
                    }
                });

                if (todosLosPacientes.length > 0) {
                    actualizarCamposPaciente(todosLosPacientes[0]);
                }

            } else {
                selectorPacientes.innerHTML = "";
                const option = document.createElement("option");
                option.value = localStorage.getItem("nombreUsuario") || "paciente";
                option.textContent = localStorage.getItem("nombreUsuario") || "Paciente Actual";
                selectorPacientes.appendChild(option);
                selectorPacientes.disabled = true;

                const miPerfil = todosLosPacientes.find(p => p.nombre === nombreUsuario);
                if (miPerfil) {
                    actualizarCamposPaciente(miPerfil);
                } else {
                    if (elEdad) elEdad.textContent = "N/A";
                    if (elTelefono) elTelefono.textContent = "N/A";
                    if (elSangre) elSangre.textContent = "N/A";
                    if (elDiagnostico) elDiagnostico.textContent = "Evaluación inicial pendiente.";
                    if (elMedicamentos) elMedicamentos.textContent = "Sin recetas registradas.";
                }
            }
        }
    }

    // --- 2. LÓGICA DINÁMICA DE CERRAR SESIÓN EN LA NAVEGACIÓN ---
    const linkLogin = document.querySelector('a[href*="login.html"]') as HTMLAnchorElement | null;
    
    if (linkLogin && localStorage.getItem("sesionActiva") === "true") {
        const liLogin = linkLogin.closest("li");
        const ulMenu = linkLogin.closest("ul");
        
        if (ulMenu && liLogin) {
            liLogin.style.display = "none";
            
            const liLogout = document.createElement("li");
            const linkLogout = document.createElement("a");
            linkLogout.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión';
            linkLogout.href = "#";
            
            linkLogout.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("sesionActiva");
                localStorage.removeItem("rolUsuario");
                localStorage.removeItem("nombreUsuario");
                
                alert("🔒 Sesión cerrada correctamente");
                if (window.location.pathname.includes("modulos")) {
                    window.location.href = "../index.html";
                } else {
                    window.location.href = "index.html";
                }
            });
            
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
    const cedulaInput = document.getElementById("cedula") as HTMLInputElement | null;
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

        if (esRegistro && nombreInput && confirmarInput) {
            if (password !== confirmarInput.value.trim()) return alert("❌ Las contraseñas no coinciden");
            
            const usuariosGuardados = JSON.parse(localStorage.getItem("usuariosRegistrados") || "[]");
            const correoExiste = usuariosGuardados.some((u: any) => u.correo === correo);
            if (correoExiste) return alert("❌ Este correo ya está registrado.");
            const cedulaExistente = usuariosGuardados.some((u: any) => u.cedula === cedulaInput?.value.trim());
            if (cedulaExistente) return alert("❌ Esta cédula ya está registrada.");

            // Cuando un usuario nuevo se registre, le asignamos historial cardiovascular clínico inicial por defecto
            const nuevoUsuario = { 
                nombre: nombreInput.value.trim(), 
                correo: correo, 
                password: password,
                cedula: cedulaInput?.value.trim() || "",
                rol: "paciente",
                edad: Math.floor(Math.random() * (75 - 45 + 1)) + 45, 
                telefono: "099" + Math.floor(1000000 + Math.random() * 9000000),
                tipoSangre: "O+",
                diagnostico: "Evaluación inicial preventiva pendiente. Monitoreo clínico de valores de presión arterial.",
                medicamentos: "• Pendiente de asignación por el especialista médico."
            };
            usuariosGuardados.push(nuevoUsuario);
            
            localStorage.setItem("usuariosRegistrados", JSON.stringify(usuariosGuardados));
            alert("✅ Cuenta creada correctamente");
            window.location.href = "login.html";
        } else {
            // --- LOGICA DE LOGIN ---
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

            const usuariosGuardados = JSON.parse(localStorage.getItem("usuariosRegistrados") || "[]");
            const todosLosPacientes = [...pacientesPredeterminados, ...usuariosGuardados];

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