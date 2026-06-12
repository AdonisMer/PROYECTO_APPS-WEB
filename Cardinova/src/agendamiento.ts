// Importamos datos
import horariosData from './data/horarios.json';
import pacientesPredeterminados from './data/pacientes.json';
import agendamientosData from './data/agendamientos.json';
// Función principal
export function inicializarAgendamiento() {
    const form = document.querySelector('.formulario1') as HTMLFormElement;
    const selectMedico = document.getElementById('medico') as HTMLSelectElement;
    const selectHora = document.getElementById('hora') as HTMLSelectElement;
    const inputFecha = document.getElementById('fecha') as HTMLInputElement;
    const inputCedula = document.getElementById('cedula') as HTMLInputElement;
    if (!form) return;
    const obtenerAgendamientos = (): any[] => {
        const guardados = localStorage.getItem("agendamientos");
        return guardados ? JSON.parse(guardados) : [...agendamientosData];
    };
    const guardarAgendamientos = (data: any[]) => {
        localStorage.setItem("agendamientos", JSON.stringify(data));
    };
    const normalizar = (texto: string): string =>
        texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const obtenerDiaSemana = (fecha: string): string => {
        const dias = ["domingo","lunes","martes","miercoles","jueves","viernes","sabado"];
        const [y, m, d] = fecha.split('-').map(Number);
        return dias[new Date(y, m - 1, d).getDay()];
    };
    const eliminarCita = (citaEliminar: any) => {
        if (!confirm("¿Seguro que quieres eliminar esta cita?")) return;
        let citas = obtenerAgendamientos();
        citas = citas.filter(c =>
            !(c.medico_id === citaEliminar.medico_id &&
                c.fecha === citaEliminar.fecha &&
                c.hora === citaEliminar.hora &&
                c.cedula === citaEliminar.cedula)
        );
        guardarAgendamientos(citas);
        mostrarCitasGuardadas();
    };
    const mostrarCitasGuardadas = () => {
        const lista = document.getElementById('lista-citas') as HTMLDivElement;
        if (!lista) return;
        lista.innerHTML = "";
        const cedulaActual = inputCedula.value.trim();
        if (!cedulaActual) {
            lista.innerHTML = "<p>Ingrese una cédula para ver sus citas.</p>";
            return;
        }
        const citas = obtenerAgendamientos();
        const citasFiltradas = citas.filter(c => c.cedula === cedulaActual);
        if (citasFiltradas.length === 0) {
            lista.innerHTML = "<p>No tienes citas registradas.</p>";
            return;
        }
        citasFiltradas.forEach((cita) => {
            const item = document.createElement('div');
            item.style.border = "1px solid #ddd";
            item.style.padding = "10px";
            item.style.borderRadius = "6px";
            item.style.marginBottom = "10px";
            const nombreMedico =
                cita.medico_id === "dr_carlos_rodriguez"
                    ? "Dr. Carlos Rodríguez"
                    : "Dra. María Gómez";
            item.innerHTML = `
                <p><strong>Cédula:</strong> ${cita.cedula}</p>
                <p><strong>Médico:</strong> ${nombreMedico}</p>
                <p><strong>Fecha:</strong> ${cita.fecha}</p>
                <p><strong>Hora:</strong> ${cita.hora}</p>
                <button class="btn-eliminar">
                    <i class="fa-solid fa-trash"></i> Eliminar
                </button>
            `;
            item.querySelector('.btn-eliminar')!.addEventListener('click', () => {
                eliminarCita(cita);
            });
            lista.appendChild(item);
        });
    };
    const actualizarHoras = () => {
        const medicoId = selectMedico.value;
        const fecha = inputFecha.value;
        selectHora.innerHTML = '<option value="">-- Elige una hora --</option>';
        if (!medicoId || !fecha) return;
        const datosMedico = (horariosData as any)[medicoId];
        if (!datosMedico) return;
        const citas = obtenerAgendamientos();
        const dia = obtenerDiaSemana(fecha);
        const diasValidos = datosMedico.dias_atencion.map((d: string) => normalizar(d));
        if (!diasValidos.includes(dia)) {
            const option = document.createElement('option');
            option.textContent = "No atiende este día";
            option.disabled = true;
            selectHora.appendChild(option);
            return;
        }
        datosMedico.horarios.forEach((h: any) => {
            const ocupado = citas.some(c =>
                c.medico_id === medicoId &&
                c.fecha === fecha &&
                c.hora === h.hora
            );
            if (!ocupado && h.disponible) {
                const option = document.createElement('option');
                option.value = h.hora;
                option.textContent = h.hora;
                selectHora.appendChild(option);
            }
        });
    };
    selectMedico.addEventListener('change', actualizarHoras);
    inputFecha.addEventListener('change', actualizarHoras);
    inputCedula.addEventListener('input', mostrarCitasGuardadas);
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const cedula = inputCedula.value.trim();
        const medicoId = selectMedico.value;
        const fecha = inputFecha.value;
        const hora = selectHora.value;
        const tipo = (document.getElementById('tipo') as HTMLSelectElement).value;
        const motivo = (document.getElementById('motivo') as HTMLTextAreaElement).value || "";
        if (!cedula || !medicoId || !fecha || !hora || !tipo) {
            alert("Completa todos los campos");
            return;
        }
        const usuarios = JSON.parse(localStorage.getItem("usuariosRegistrados") || "[]");
        const pacientes = [...pacientesPredeterminados, ...usuarios];
        const paciente = pacientes.find((p: any) => p.cedula === cedula);
        if (!paciente) {
            alert("Cédula no registrada");
            return;
        }
        const citas = obtenerAgendamientos();
        const yaExiste = citas.some(c =>
            c.medico_id === medicoId &&
            c.fecha === fecha &&
            c.hora === hora
        );
        if (yaExiste) {
            alert("Esa hora ya está ocupada");
            return;
        }
        const nueva = { medico_id: medicoId, cedula, fecha, hora, tipo, motivo };
        citas.push(nueva);
        guardarAgendamientos(citas);
        alert(`✅ Cita confirmada para ${paciente.nombre}`);
        form.reset();
        inputCedula.value = cedula;
        actualizarHoras();
        mostrarCitasGuardadas();
    });
    mostrarCitasGuardadas();
}