import './css/main.css';
import gestionMedica from './assets/gestion_medica.png';
import publicoObjetivo from './assets/seccion_publico_objetivo.png';
import doctoresPredeterminados from './data/doctores.json';
import pacientesPredeterminados from './data/pacientes.json';
import agendamientosData from './data/agendamientos.json'; 

import sintomasList from './data/sintomas.json';
import medicamentosList from './data/medicamentos_lista.json';
import farmaciasData from './data/farmacias.json';

import { iniciarRecomendaciones } from './recomendacion';
import { mostrarFavoritos } from './favoritos';
import { inicializarAgendamiento } from './agendamiento';

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("agendamiento.html")) {
        inicializarAgendamiento();
    }
    
    if (window.location.pathname.includes("recomendacion.html")) {
        iniciarRecomendaciones();
        mostrarFavoritos();
    }
    
    // --- CONTROL DE ACCESO Y PERSONALIZACIÓN DE CITA MÉDICA ---
    if (window.location.pathname.includes("cita.html")) {
        const sesionActiva = localStorage.getItem("sesionActiva");
        if (sesionActiva !== "true") {
            alert("❌ Acceso denegado. Debes iniciar sesión para acceder al apartado de Cita Médica.");
            window.location.href = "login.html";
            return;
        }

        const rolUsuario = localStorage.getItem("rolUsuario");
        const nombreUsuario = localStorage.getItem("nombreUsuario");

        if (rolUsuario === "doctor" && nombreUsuario) {
            const infoCita = document.querySelector(".info-cita");
            if (infoCita) {
                const saludo = document.createElement("h1");
                saludo.className = "saludo-doctor";
                saludo.textContent = `👋 ¡HOLA, ${nombreUsuario.toUpperCase()}!`;
                const h2Cita = infoCita.querySelector("h2");
                if (h2Cita) infoCita.insertBefore(saludo, h2Cita);
                else infoCita.prepend(saludo);
            }
        }
    

        const selectorPacientes = document.getElementById("seleccionar-paciente") as HTMLSelectElement | null;
        const elEdad = document.getElementById("vista-edad");
        const elTelefono = document.getElementById("vista-telefono");
        const elSangre = document.getElementById("vista-sangre");
        const elFecha = document.getElementById("vista-fecha"); 
        
        const elDiagnostico = document.getElementById("vista-diagnostico");
        const btnEditarDiag = document.getElementById("btn-editar-diagnostico");
        const elSintomasContenedor = document.getElementById("contenedor-sintomas");
        const elMedsContenedor = document.getElementById("contenedor-medicamentos");

        // --- LÓGICA DE LA VENTANA FLOTANTE (MODAL) ---
        const modalFarmacias = document.getElementById("modal-farmacias");
        const btnCerrarModal = document.getElementById("btn-cerrar-modal");
        const tituloModal = document.getElementById("modal-titulo-med");
        const listaFarmacias = document.getElementById("lista-farmacias-disponibles");

        const abrirModalFarmacias = (nombreMedicamentoCompleto: string) => {
            if (!modalFarmacias || !tituloModal || !listaFarmacias) return;

            // Función interna para ignorar tildes y mayúsculas (Ej: "Losartán" vs "Losartan")
            const normalizar = (texto: string) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            
            const nombrePuro = nombreMedicamentoCompleto.split(" (")[0].trim();
            const nombreBusqueda = normalizar(nombrePuro);

            tituloModal.innerHTML = `<i class="fa-solid fa-pills"></i> Disponible en: ${nombrePuro}`;
            listaFarmacias.innerHTML = ""; 

            // ¡CORRECCIÓN AQUÍ! Ahora busca dentro del objeto "m.nombre" y verifica si "m.disponible" es true
            const farmaciasDisponibles = farmaciasData.filter((f: any) => 
                f.medicamentos.some((m: any) => normalizar(m.nombre).includes(nombreBusqueda) && m.disponible === true)
            );

            if (farmaciasDisponibles.length === 0) {
                listaFarmacias.innerHTML = `<p style="text-align:center; color:#ef4444; font-weight:bold;">No hay stock reportado en farmacias cercanas.</p>`;
            } else {
                farmaciasDisponibles.forEach((f: any) => {
                    // Buscamos el medicamento exacto para sacar su precio de la nueva base de datos
                    const medEncontrado = f.medicamentos.find((m: any) => normalizar(m.nombre).includes(nombreBusqueda));
                    const precioStr = medEncontrado ? `$${medEncontrado.precio.toFixed(2)}` : "Consultar";

                    const tarjeta = document.createElement("div");
                    tarjeta.className = "tarjeta-farmacia-mini";
                    tarjeta.innerHTML = `
                        <h4><i class="fa-solid fa-house-medical"></i> ${f.nombre}</h4>
                        <p><i class="fa-solid fa-location-dot"></i> ${f.direccion} <strong>(${f.distancia} km)</strong></p>
                        <p><i class="fa-solid fa-phone"></i> ${f.telefono}</p>
                        <p style="color: #22c55e; font-weight: bold; margin-top: 5px;"><i class="fa-solid fa-tag"></i> Precio: ${precioStr}</p>
                    `;
                    listaFarmacias.appendChild(tarjeta);
                });
            }
            modalFarmacias.classList.remove("modal-oculto");
            modalFarmacias.classList.add("modal-mostrar");
        };

        if (btnCerrarModal && modalFarmacias) {
            btnCerrarModal.addEventListener("click", () => {
                modalFarmacias.classList.remove("modal-mostrar");
                modalFarmacias.classList.add("modal-oculto");
            });
            window.addEventListener("click", (e) => {
                if (e.target === modalFarmacias) {
                    modalFarmacias.classList.remove("modal-mostrar");
                    modalFarmacias.classList.add("modal-oculto");
                }
            });
        }

        // --- GESTIÓN PERSISTENTE DE PACIENTES (EVITA PÉRDIDA AL RECARGAR) ---
        const usuariosGuardados = JSON.parse(localStorage.getItem("usuariosRegistrados") || "[]");
        const listaBaseInicial = [...pacientesPredeterminados, ...usuariosGuardados].filter(
            (paciente, index, self) => self.findIndex(p => p.correo === paciente.correo) === index
        );

        // Intentamos cargar la lista mutable del historial clínico desde localStorage
        let pacientesClinica: any[] = JSON.parse(localStorage.getItem("pacientesClinica") || "null");
        if (!pacientesClinica) {
            pacientesClinica = listaBaseInicial;
            localStorage.setItem("pacientesClinica", JSON.stringify(pacientesClinica));
        } else {
            // Sincroniza si hay nuevos registros creados desde la interfaz de registro
            listaBaseInicial.forEach((pBase: any) => {
                if (!pacientesClinica.some((pClin: any) => pClin.correo === pBase.correo)) {
                    pacientesClinica.push(pBase);
                }
            });
            localStorage.setItem("pacientesClinica", JSON.stringify(pacientesClinica));
        }

        // --- FUNCIÓN AUTOMÁTICA DE GUARDADO ---
        const guardarCambiosPaciente = () => {
            if (!selectorPacientes) return;
            const correoActual = selectorPacientes.value;
            const paciente = pacientesClinica.find((p: any) => p.correo === correoActual);
            
            if (!paciente) return;

            // 1. Guarda el diagnóstico escrito
            if (elDiagnostico) {
                paciente.diagnostico = elDiagnostico.textContent?.trim() || "";
            }

            // 2. Guarda el conjunto actual de etiquetas de síntomas
            if (elSintomasContenedor) {
                const spans = elSintomasContenedor.querySelectorAll(".etiqueta-item span");
                const listaSintomas: string[] = [];
                spans.forEach(s => { if (s.textContent) listaSintomas.push(s.textContent.trim()); });
                paciente.sintomasActivos = listaSintomas; // Propiedad personalizada persistente
            }

            // 3. Guarda el conjunto actual de etiquetas de medicamentos
            if (elMedsContenedor) {
                const spans = elMedsContenedor.querySelectorAll(".etiqueta-item span");
                const listaMeds: string[] = [];
                spans.forEach(s => { if (s.textContent) listaMeds.push(s.textContent.trim()); });
                paciente.medicamentos = listaMeds.map(m => `• ${m}`).join(" "); // Estructura original
            }

            // Guardamos la actualización en la persistencia del navegador
            localStorage.setItem("pacientesClinica", JSON.stringify(pacientesClinica));
        };

        // --- FUNCIÓN PARA CREAR ETIQUETAS (CHIPS) ---
        // --- FUNCIÓN PARA CREAR ETIQUETAS (CHIPS) CON VALIDACIÓN DE DUPLICADOS ---
        // --- FUNCIÓN PARA CREAR ETIQUETAS (CHIPS) CON VALIDACIÓN DE DUPLICADOS ---
        // Le añadimos "mostrarAlerta" por defecto en true
        const crearEtiqueta = (contenedor: HTMLElement, texto: string, esMedicamento: boolean = false, mostrarAlerta: boolean = true) => {
            const etiquetasExistentes = Array.from(contenedor.querySelectorAll(".etiqueta-item span"));
            const yaExiste = etiquetasExistentes.some(span => span.textContent?.trim().toLowerCase() === texto.trim().toLowerCase());

            if (yaExiste) {
                // Solo muestra el popup si el modo alerta está activado
                if (mostrarAlerta) {
                    alert("Este elemento ya ha sido agregado.");
                }
                return;
            }

            const tag = document.createElement("div");
            tag.className = "etiqueta-item";
            
            if (esMedicamento) {
                tag.addEventListener("click", (e) => {
                    if ((e.target as HTMLElement).closest(".btn-eliminar-etiqueta")) return; 
                    abrirModalFarmacias(texto);
                });
            }

            if (rolUsuario === "doctor") {
                tag.innerHTML = `<span>${texto}</span> <button type="button" class="btn-eliminar-etiqueta" title="Eliminar"><i class="fa-solid fa-xmark"></i></button>`;
                tag.querySelector(".btn-eliminar-etiqueta")?.addEventListener("click", (e) => {
                    e.stopPropagation(); 
                    tag.remove();
                    guardarCambiosPaciente(); 
                });
            } else {
                tag.innerHTML = `<span>${texto}</span>`; 
            }
            contenedor.appendChild(tag);
        };

        // Lógica del botón Editar Diagnóstico (Solo Doctor)
        if (btnEditarDiag && elDiagnostico) {
            if (rolUsuario !== "doctor") {
                btnEditarDiag.style.display = "none";
            } else {
                btnEditarDiag.addEventListener("click", () => {
                    const editando = elDiagnostico.isContentEditable;
                    if (editando) {
                        elDiagnostico.contentEditable = "false";
                        btnEditarDiag.innerHTML = '<i class="fa-solid fa-pen"></i> Editar';
                        btnEditarDiag.style.color = "var(--color-accent)";
                        guardarCambiosPaciente(); // Guarda el diagnóstico escrito al presionar "Guardar"
                    } else {
                        elDiagnostico.contentEditable = "true";
                        elDiagnostico.focus();
                        btnEditarDiag.innerHTML = '<i class="fa-solid fa-save"></i> Guardar';
                        btnEditarDiag.style.color = "green";
                    }
                });
            }
        }

        if (selectorPacientes) {
            const selectSint = document.getElementById("select-sintomas") as HTMLSelectElement;
            const selectMed = document.getElementById("select-medicamentos") as HTMLSelectElement;
            
            if (rolUsuario === "doctor") {
                if (selectSint) sintomasList.forEach(s => selectSint.appendChild(new Option(s, s)));
                if (selectMed) medicamentosList.forEach(m => selectMed.appendChild(new Option(m, m)));
                
                document.getElementById("btn-agregar-sintoma")?.addEventListener("click", () => {
                    if(selectSint.value && elSintomasContenedor) {
                        // Pasamos 'true' al final para que SÍ alerte si el doctor se equivoca
                        crearEtiqueta(elSintomasContenedor, selectSint.value, false, true); 
                        selectSint.value = "";
                        guardarCambiosPaciente(); 
                    }
                });
                document.getElementById("btn-agregar-medicamento")?.addEventListener("click", () => {
                    if(selectMed.value && elMedsContenedor) {
                        // Pasamos 'true' al final para que SÍ alerte si el doctor se equivoca
                        crearEtiqueta(elMedsContenedor, selectMed.value, true, true); 
                        selectMed.value = "";
                        guardarCambiosPaciente(); 
                    }
                });
            } else {
                document.getElementById("control-sintomas")!.style.display = "none";
                document.getElementById("control-medicamentos")!.style.display = "none";
            }

            const actualizarCamposPaciente = (paciente: any) => {
                if (elEdad) elEdad.textContent = paciente.edad ? `${paciente.edad} años` : "No especificado";
                if (elTelefono) elTelefono.textContent = paciente.telefono || "No especificado";
                if (elSangre) elSangre.textContent = paciente.tipoSangre || "No especificado";
                if (elDiagnostico) elDiagnostico.textContent = paciente.diagnostico || "Evaluación inicial pendiente.";

                if (elSintomasContenedor) elSintomasContenedor.innerHTML = "";
                if (elMedsContenedor) elMedsContenedor.innerHTML = "";

                const agendamientosGuardados = JSON.parse(localStorage.getItem("agendamientos") || "null") || agendamientosData;
                const cita = agendamientosGuardados.find((a: any) => a.cedula === paciente.cedula);
                
                if (elFecha) elFecha.textContent = cita ? cita.fecha : "Sin cita programada";
                
                if (elSintomasContenedor) {
                    if (paciente.sintomasActivos && paciente.sintomasActivos.length > 0) {
                        paciente.sintomasActivos.forEach((s: string) => crearEtiqueta(elSintomasContenedor, s, false, false));
                    } else if (cita && cita.motivo) {
                        crearEtiqueta(elSintomasContenedor, cita.motivo, false, false); 
                    }
                }

                if (elMedsContenedor && paciente.medicamentos) {
                    const meds = paciente.medicamentos.split("•").map((m: string) => m.trim()).filter((m: string) => m.length > 0);
                    meds.forEach((m: string) => crearEtiqueta(elMedsContenedor, m, true, false));
                }
            };

            if (rolUsuario === "doctor") {
                selectorPacientes.innerHTML = "";
                pacientesClinica.forEach((paciente: any) => {
                    const option = document.createElement("option");
                    option.value = paciente.correo;
                    option.textContent = paciente.nombre;
                    selectorPacientes.appendChild(option);
                });

                selectorPacientes.addEventListener("change", () => {
                    const pacienteSeleccionado = pacientesClinica.find(p => p.correo === selectorPacientes.value);
                    if (pacienteSeleccionado) actualizarCamposPaciente(pacienteSeleccionado);
                });

                if (pacientesClinica.length > 0) actualizarCamposPaciente(pacientesClinica[0]);

            } else {
                selectorPacientes.innerHTML = "";
                const option = document.createElement("option");
                option.value = localStorage.getItem("nombreUsuario") || "paciente";
                option.textContent = localStorage.getItem("nombreUsuario") || "Paciente Actual";
                selectorPacientes.appendChild(option);
                selectorPacientes.disabled = true;

                const miPerfil = pacientesClinica.find(p => p.nombre === nombreUsuario);
                if (miPerfil) actualizarCamposPaciente(miPerfil);
                else actualizarCamposPaciente({});
            }
        }
    }

    // --- LÓGICA DE LA BARRA DE NAVEGACIÓN Y LOGIN ---
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
                window.location.href = window.location.pathname.includes("modulos") ? "../index.html" : "index.html";
            });
            liLogout.appendChild(linkLogout);
            ulMenu.appendChild(liLogout);
        }
    }

    const imgFondo = document.getElementById('img-fondo-medico') as HTMLImageElement | null;
    const imgPublico = document.getElementById('img-publico') as HTMLImageElement | null;
    if (imgFondo) imgFondo.src = gestionMedica;
    if (imgPublico) imgPublico.src = publicoObjetivo;

    const form = document.querySelector("form") as HTMLFormElement | null;
    const nombresInput = document.getElementById("nombres") as HTMLInputElement | null;
    const apellidosInput = document.getElementById("apellidos") as HTMLInputElement | null;
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
            });
        }
    };

    setupPasswordToggle("password", "togglePassword", "eyeIcon");
    if (confirmarInput) {
        setupPasswordToggle("confirmar", "toggleConfirm", "eyeIconConfirm");
    }
    form.addEventListener("submit", (e: Event) => {
        if (form.classList.contains("formulario1") && !correoInput) return; 
        
        e.preventDefault();
        const correo = correoInput?.value.trim() ?? "";
        const password = passwordInput?.value.trim() ?? "";

        if (!correo || !password) return alert("❌ Completa los campos obligatorios");

        const esRegistro = nombresInput !== null && apellidosInput !== null && confirmarInput !== null;

        if (esRegistro && nombresInput && apellidosInput && confirmarInput) {
            if (password !== confirmarInput.value.trim()) return alert("❌ Las contraseñas no coinciden");
            
            const usuariosGuardados = JSON.parse(localStorage.getItem("usuariosRegistrados") || "[]");
            if (usuariosGuardados.some((u: any) => u.correo === correo)) return alert("❌ Este correo ya está registrado.");

            const nombreCompleto = `${nombresInput.value.trim()} ${apellidosInput.value.trim()}`;
            const nuevoUsuario = { 
                nombre: nombreCompleto, correo: correo, password: password,
                cedula: cedulaInput?.value.trim() || "", rol: "paciente",
                edad: Math.floor(Math.random() * (75 - 45 + 1)) + 45, 
                telefono: "099" + Math.floor(1000000 + Math.random() * 9000000),
                tipoSangre: "O+",
                diagnostico: "Evaluación inicial preventiva pendiente.",
                medicamentos: ""
            };
            usuariosGuardados.push(nuevoUsuario);
            localStorage.setItem("usuariosRegistrados", JSON.stringify(usuariosGuardados));
            alert("✅ Cuenta creada correctamente");
            window.location.href = "login.html";
        } else {
            const medicoEncontrado = doctoresPredeterminados.find((m: any) => m.correo === correo && m.password === password);
            if (medicoEncontrado) {
                alert(`✅ Bienvenido ${medicoEncontrado.nombre} (Personal Médico)`);
                localStorage.setItem("sesionActiva", "true");
                localStorage.setItem("rolUsuario", medicoEncontrado.rol);
                localStorage.setItem("nombreUsuario", medicoEncontrado.nombre);
                window.location.href = "cita.html";
                return;
            }

            const usuariosGuardados = JSON.parse(localStorage.getItem("usuariosRegistrados") || "[]");
            const pacientesClinicaLocal = JSON.parse(localStorage.getItem("pacientesClinica") || "[]");
            const todosLosPacientes = [...pacientesClinicaLocal, ...pacientesPredeterminados, ...usuariosGuardados].filter(
                (paciente, index, self) => self.findIndex(p => p.correo === paciente.correo) === index
            );
            const pacienteEncontrado = todosLosPacientes.find((p: any) => p.correo === correo && p.password === password);

            if (pacienteEncontrado) {
                alert(`✅ Bienvenido ${pacienteEncontrado.nombre}`);
                localStorage.setItem("sesionActiva", "true");
                localStorage.setItem("rolUsuario", pacienteEncontrado.rol);
                localStorage.setItem("nombreUsuario", pacienteEncontrado.nombre);
                window.location.href = "cita.html";
            } else alert("❌ Correo o contraseña incorrectos");
        }
    });
});