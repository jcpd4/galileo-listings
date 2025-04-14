document.addEventListener("DOMContentLoaded", () => {
    const apiKey = "AIzaSyCuK35Z9AB4C2pgBkdJadl-EUmXK8MHJWY"; // ← pon tu API key aquí
    const abrirModalBtn = document.getElementById("generateTitleBtn");
    const modalKeywordList = document.getElementById("modalKeywordList");
    const confirmarGeneracionBtn = document.getElementById("confirmarGeneracionBtn");

    abrirModalBtn.addEventListener("click", () => {
        modalKeywordList.innerHTML = "";
        const palabras = Array.from(document.querySelectorAll("#keywordsList .badge")).map(b => b.textContent.trim());

        palabras.forEach(palabra => {
            const btn = document.createElement("button");
            btn.className = "btn btn-outline-primary btn-sm";
            btn.textContent = palabra;
            btn.dataset.selected = "false";

            btn.addEventListener("click", () => {
                const seleccionados = modalKeywordList.querySelectorAll(".btn-primary");
                if (btn.classList.contains("btn-primary")) {
                    btn.classList.remove("btn-primary");
                    btn.classList.add("btn-outline-primary");
                } else {
                    if (seleccionados.length < 3) {
                        btn.classList.remove("btn-outline-primary");
                        btn.classList.add("btn-primary");
                    }
                }
            });

            modalKeywordList.appendChild(btn);
        });

        const modal = new bootstrap.Modal(document.getElementById("modalGenerarTitulo"));
        modal.show();
    });
    // tengo que modificar esto
    confirmarGeneracionBtn.addEventListener("click", async () => {
        const palabrasSeleccionadas = Array.from(modalKeywordList.querySelectorAll(".btn-primary")).map(btn => btn.textContent.trim());
        const intencion = document.getElementById("selectIntencion").value;
        const energia = document.getElementById("selectEnergia").value;
    
        const genTitulo = document.getElementById("generarTitulo").checked;
        const genBullets = document.getElementById("generarBullets").checked;
        const genDesc = document.getElementById("generarDescripcion").checked;
        const genBackend = document.getElementById("generarBackend").checked;
    
        const palabras = palabrasSeleccionadas.join(", ") || "ninguna";
    
        const prompts = {
            titulo: `Crea un título de producto para Amazon con estilo ${intencion}, energía ${energia}.
    Debe empezar con "PACKLIST®", contener estas palabras clave (si las hay): ${palabrasSeleccionadas.join(", ") || "ninguna"}.
    Cumple las siguientes reglas:
    - Usa las palabras clave naturalmente
    - Entre 180 y 200 caracteres
    - Profesional y atractivo para SEO
    - No repitas palabras innecesariamente
    - Termina con una frase que impacte y convierta
    - Tienes que devolver solo que te pido, no información extra
    
    Ejemplo: PACKLIST® Invitaciones de Cumpleaños – 12 Invitaciones con Diseño de Gorila para tu Fiesta – Invitaciones Originales y Divertidas para Cumpleaños Infantiles, Fiestas Temáticas y Eventos`,
    
            bullets: `Crea 5 Bullet Points (uno por línea) para un producto Amazon. Estilo: ${intencion}, Energía: ${energia}.
    Incluye las palabras clave: ${palabras}. No repitas palabras, y enfócate en beneficios y características.`,
    
            descripcion: `Escribe una descripción profesional para Amazon en 3 frases. Tono: ${intencion}, Energía: ${energia}.
    Incluye las palabras clave: ${palabras}. Sé claro, persuasivo y usa lenguaje positivo.`,
    
            backend: `Devuelve solo una lista separada por comas de palabras clave para el backend de Amazon.
    Tono: ${intencion}, Energía: ${energia}. Usa sinónimos y palabras relacionadas a: ${palabras}.
    No uses más de 250 caracteres.`
        };
    
        confirmarGeneracionBtn.textContent = "Generando...";
        confirmarGeneracionBtn.disabled = true;
    
        const llamarIA = async (prompt) => {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
            });
            const data = await res.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        };
    
        try {
            if (genTitulo) {
                const r = await llamarIA(prompts.titulo);
                if (r) {
                    const campo = document.getElementById("productTitle");
                    campo.value = r;
                    campo.dispatchEvent(new Event("input"));
                }
            }
    
            if (genBullets) {
                const r = await llamarIA(prompts.bullets);
                if (r) {
                    const bulletsContainer = document.getElementById("bulletsContainer");
                    bulletsContainer.innerHTML = "";
                    r.split(/\n|•|-|●/).filter(Boolean).slice(0, 5).forEach(bullet => {
                        const div = document.createElement("div");
                        div.className = "bullet-point mb-3";
                        div.innerHTML = `
                            <textarea class="form-control bullet-text" rows="2">${bullet.trim()}</textarea>
                            <div class="mt-2 d-flex justify-content-between">
                                <small class="text-muted">Caracteres: <span class="bullet-char-count">${bullet.length}</span>/500</small>
                                <button class="btn btn-sm btn-outline-danger remove-bullet" style="display: none;">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `;
                        bulletsContainer.appendChild(div);
                    });
                }
            }
    
            if (genDesc) {
                const r = await llamarIA(prompts.descripcion);
                if (r) {
                    const campo = document.getElementById("productDescription");
                    campo.value = r;
                    campo.dispatchEvent(new Event("input"));
                }
            }
    
            if (genBackend) {
                const r = await llamarIA(prompts.backend);
                if (r) {
                    const campos = document.querySelectorAll(".search-term-field");
                    campos[0].value = r.slice(0, 250);
                    if (campos[1]) campos[1].value = r.slice(251, 500);
                }
            }
    
            bootstrap.Modal.getInstance(document.getElementById("modalGenerarTitulo")).hide();
    
        } catch (err) {
            alert("❌ Error: " + err.message);
        }
    
        confirmarGeneracionBtn.textContent = "Generar contenido con IA";
        confirmarGeneracionBtn.disabled = false;
    });
    

});


