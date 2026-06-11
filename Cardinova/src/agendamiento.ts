// src/agendamiento.ts
import horariosData from './data/horarios.json';
import pacientesPredeterminados from './data/pacientes.json';
import agendamientosData from './data/agendamientos.json';

export function inicializarAgendamiento() {
    const form = document.querySelector('.formulario1') as HTMLFormElement;
    const selectMedico = document.getElementById('medico') as HTMLSelectElement | null;
    const selectHora = document.getElementById('hora') as HTMLSelectElement | null;
    const inputFecha = document.getElementById('fecha') as HTMLInputElement | null;

    if (!form) return;

    // Cargar citas previas desde localStorage o usar el archivo inicial
    const obtenerAgendamientos = (): any[] => {
        const guardados = localStorage.getItem("agendamientos");
        return guardados ? JSON.parse(guardados) : [...agendamientosData];
    };

    // 1. Lógica para cargar horas dinámicamente al cambiar de médico o fecha
    const actualizarHoras = () => {
        if (!selectMedico || !selectHora) return;
        const medicoId = selectMedico.value;
        const fecha = inputFecha?.value;
        
        selectHora.innerHTML = '<option value="">-- Elige una hora --</option>';
        if (!medicoId || !fecha) return;

        const datosMedico = (horariosData as any)[medicoId];
        const citasActuales = obtenerAgendamientos();

        if (datosMedico && datosMedico.horarios) {
            datosMedico.horarios.forEach((h: any) => {
                // Verificar si esta hora ya está ocupada
                const estaOcupado = citasActuales.some(
                    (c) => c.medico_id === medicoId && c.fecha === fecha && c.hora === h.hora
                );

                if (!estaOcupado) {
                    const option = document.createElement('option');
                    option.value = h.hora;
                    option.textContent = h.hora;
                    selectHora.appendChild(option);
                }
            });
        }
    };

    selectMedico?.addEventListener('change', actualizarHoras);
    inputFecha?.addEventListener('change', actualizarHoras);

    // 2. Lógica de envío del formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const inputCedula = document.getElementById('cedula') as HTMLInputElement | null;
        const selectTipo = document.getElementById('tipo') as HTMLSelectElement | null;
        const textMotivo = document.getElementById('motivo') as HTMLTextAreaElement | null;

        const cedula = inputCedula?.value.trim();
        const medicoId = selectMedico?.value;
        const fecha = inputFecha?.value;
        const hora = selectHora?.value;
        const tipo = selectTipo?.value;
        const motivo = textMotivo?.value || "";

        if (!medicoId || !fecha || !hora || !cedula || !tipo) {
            alert("Por favor, completa todos los campos requeridos.");
            return;
        }

        const usuariosGuardados = JSON.parse(localStorage.getItem("usuariosRegistrados") || "[]");
        const todosLosPacientes = [...pacientesPredeterminados, ...usuariosGuardados];
        const pacienteEncontrado = todosLosPacientes.find((p: any) => p.cedula === cedula);

        if (!pacienteEncontrado) {
            alert("Error: La cédula ingresada no se encuentra registrada.");
            return;
        }

        // Guardar la nueva cita
        const nuevaCita = { medico_id: medicoId, cedula, fecha, hora, motivo, tipo };
        const todasLasCitas = obtenerAgendamientos();
        todasLasCitas.push(nuevaCita);
        
        // --- PERSISTENCIA: Guardar en localStorage ---
        localStorage.setItem("agendamientos", JSON.stringify(todasLasCitas));
        
        // --- MOSTRAR RESULTADO EN PANTALLA ---
        const divResultado = document.getElementById('resultado-cita') as HTMLDivElement;
        const nombreMedico = selectMedico!.options[selectMedico!.selectedIndex].text;
        
        if (divResultado) {
            document.getElementById('res-paciente')!.textContent = pacienteEncontrado.nombre;
            document.getElementById('res-medico')!.textContent = nombreMedico;
            document.getElementById('res-fecha')!.textContent = fecha!;
            document.getElementById('res-hora')!.textContent = hora!;
            divResultado.style.display = 'block';
        }

        alert(`✅ ¡Cita confirmada para ${pacienteEncontrado.nombre}!`);
        form.reset();
        actualizarHoras(); 
    });
}