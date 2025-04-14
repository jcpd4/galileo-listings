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

    confirmarGeneracionBtn.addEventListener("click", async () => {
        const palabrasSeleccionadas = Array.from(modalKeywordList.querySelectorAll(".btn-primary")).map(btn => btn.textContent.trim());
        const intencion = document.getElementById("selectIntencion").value;
        const energia = document.getElementById("selectEnergia").value;

        const prompt = `Crea un título de producto para Amazon con estilo ${intencion}, energía ${energia}.
Debe empezar con "PACKLIST®", contener estas palabras clave (si las hay): ${palabrasSeleccionadas.join(", ") || "ninguna"}.
Cumple las siguientes reglas:
- Usa las palabras clave naturalmente
- Entre 180 y 200 caracteres
- Profesional y atractivo para SEO
- No repitas palabras innecesariamente
- Termina con una frase que impacte y convierta
- Tienes que devolver solo que te pido, no información extra

Ejemplo: PACKLIST® Invitaciones de Cumpleaños – 12 Invitaciones con Diseño de Gorila para tu Fiesta – Invitaciones Originales y Divertidas para Cumpleaños Infantiles, Fiestas Temáticas y Eventos`;

        confirmarGeneracionBtn.textContent = "Generando...";
        confirmarGeneracionBtn.disabled = true;

        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                                     
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: prompt }] }]
                })
            });

            const data = await res.json();
            const texto = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

            if (texto) {
                const campo = document.getElementById("productTitle");
                campo.value = texto;
                campo.dispatchEvent(new Event("input"));
                bootstrap.Modal.getInstance(document.getElementById("modalGenerarTitulo")).hide();
            } else {
                alert("⚠️ No se recibió respuesta de la IA.");
            }
        } catch (err) {
            alert("❌ Error: " + err.message);
        }

        confirmarGeneracionBtn.textContent = "Generar título ahora";
        confirmarGeneracionBtn.disabled = false;
    });
});
