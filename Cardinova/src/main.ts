import './style.css';
import gestionMedica from './assets/gestion_medica.png';
import publicoObjetivo from './assets/seccion_publico_objetivo.png';

// 1. Asegurar que el DOM esté listo antes de ejecutar la lógica
document.addEventListener("DOMContentLoaded", () => {
    
    // --- LÓGICA DE IMÁGENES ---
    const imgFondo = document.getElementById('img-fondo-medico') as HTMLImageElement | null;
    const imgPublico = document.getElementById('img-publico') as HTMLImageElement | null;

    if (imgFondo) imgFondo.src = gestionMedica;
    if (imgPublico) imgPublico.src = publicoObjetivo;

    // --- LÓGICA DE FORMULARIOS ---
    const form = document.querySelector("form") as HTMLFormElement | null;
    const nombreInput = document.getElementById("nombre") as HTMLInputElement | null;
    const correoInput = (document.getElementById("correo") || document.getElementById("email")) as HTMLInputElement | null;
    const passwordInput = document.getElementById("password") as HTMLInputElement | null;
    const confirmarInput = document.getElementById("confirmar") as HTMLInputElement | null;

    if (!form) return; // Si no hay formulario, terminamos aquí

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
    if (confirmarInput) setupPasswordToggle("confirmar", "toggleConfirm", "eyeIconConfirm");

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
            
            const usuario = { 
                nombre: nombreInput.value.trim(), 
                correo: correo, 
                password: password 
            };
            localStorage.setItem("usuarioRegistrado", JSON.stringify(usuario));
            alert("✅ Cuenta creada correctamente");
            window.location.href = "login.html";
        } else {
            const usuarioGuardado = JSON.parse(localStorage.getItem("usuarioRegistrado") || "{}");
            if (correo === usuarioGuardado.correo && password === usuarioGuardado.password) {
                alert("✅ Bienvenido " + usuarioGuardado.nombre);
                localStorage.setItem("sesionActiva", "true");
                window.location.href = "../index.html";
            } else {
                alert("❌ Correo o contraseña incorrectos");
            }
        }
    });
});