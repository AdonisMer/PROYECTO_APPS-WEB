"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    if (!form)
        return;
    // Obtención de elementos con su tipo correcto
    const nombreInput = document.getElementById("nombre");
    const correoInput = (document.getElementById("correo") || document.getElementById("email"));
    const passwordInput = document.getElementById("password");
    const confirmarInput = document.getElementById("confirmar");
    // 👁️ Función mejorada para mostrar/ocultar contraseña
    const setupPasswordToggle = (inputId, buttonId, iconId) => {
        const input = document.getElementById(inputId);
        const button = document.getElementById(buttonId);
        const icon = document.getElementById(iconId);
        if (button && input && icon) {
            button.addEventListener("click", () => {
                const isPassword = input.type === "password";
                input.type = isPassword ? "text" : "password";
                // Cambiar clases del icono
                icon.className = isPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
                // Actualizar atributo de accesibilidad
                button.setAttribute("aria-label", isPassword ? "Ocultar contraseña" : "Mostrar contraseña");
            });
        }
    };
    // Inicializar lógica de visibilidad
    setupPasswordToggle("password", "togglePassword", "eyeIcon");
    if (confirmarInput) {
        setupPasswordToggle("confirmar", "toggleConfirm", "eyeIconConfirm");
    }
    // 🔥 VALIDACIONES EN TIEMPO REAL
    const setBorder = (el, isValid) => {
        if (el)
            el.style.border = `2px solid ${isValid ? "green" : "red"}`;
    };
    if (correoInput) {
        correoInput.addEventListener("input", () => setBorder(correoInput, correoInput.value.includes("@")));
    }
    if (passwordInput) {
        passwordInput.addEventListener("input", () => setBorder(passwordInput, passwordInput.value.length >= 4));
    }
    if (confirmarInput && passwordInput) {
        confirmarInput.addEventListener("input", () => setBorder(confirmarInput, confirmarInput.value === passwordInput.value));
    }
    // 🚀 ENVÍO DEL FORMULARIO
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const correo = correoInput?.value.trim();
        const password = passwordInput?.value.trim();
        if (!correo || !password)
            return alert("❌ Completa los campos obligatorios");
        // Identificar si es registro (basado en la existencia de los inputs de registro)
        const esRegistro = nombreInput !== null && confirmarInput !== null;
        if (esRegistro && nombreInput && confirmarInput) {
            const nombre = nombreInput.value.trim();
            const confirmar = confirmarInput.value.trim();
            if (!nombre)
                return alert("❌ El nombre es obligatorio");
            if (password !== confirmar)
                return alert("❌ Las contraseñas no coinciden");
            const usuario = { nombre, correo, password };
            localStorage.setItem("usuarioRegistrado", JSON.stringify(usuario));
            alert("✅ Cuenta creada correctamente");
            window.location.href = "login.html";
        }
        else {
            // Lógica de Login
            const usuarioGuardado = JSON.parse(localStorage.getItem("usuarioRegistrado") || "{}");
            if (correo === usuarioGuardado.correo && password === usuarioGuardado.password) {
                alert("✅ Bienvenido " + usuarioGuardado.nombre);
                localStorage.setItem("sesionActiva", "true");
                window.location.href = "../index.html";
            }
            else {
                alert("❌ Correo o contraseña incorrectos");
            }
        }
    });
});
