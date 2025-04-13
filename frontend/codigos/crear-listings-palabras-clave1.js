document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const productTitle = document.getElementById('productTitle');
    const charCount = document.getElementById('charCount');
    const titlePreview = document.getElementById('titlePreview');
    const lengthCheck = document.getElementById('lengthCheck');
    const keywordCheck = document.getElementById('keywordCheck');
    const repetitionCheck = document.getElementById('repetitionCheck');
    const brandCheck = document.getElementById('brandCheck');
    const scoreBar = document.getElementById('scoreBar');
    const scoreText = document.getElementById('scoreText');
    const rulesList = document.getElementById('rulesList');
    const newRuleText = document.getElementById('newRuleText');
    const addRuleBtn = document.getElementById('addRuleBtn');
    const customRulesContainer = document.getElementById('customRulesContainer');
    const newKeyword = document.getElementById('newKeyword');
    const newKeywordSearches = document.getElementById('newKeywordSearches');
    const newKeywordConversion = document.getElementById('newKeywordConversion');
    const addKeywordBtn = document.getElementById('addKeywordBtn');
    const keywordsList = document.getElementById('keywordsList');
    const keywordDensityChart = document.getElementById('keywordDensityChart');
    const repetitionAnalysis = document.getElementById('repetitionAnalysis');
    const optimizationSummary = document.getElementById('optimizationSummary');
    const bulletsContainer = document.getElementById('bulletsContainer');
    const addBulletBtn = document.getElementById('addBulletBtn');
    const productDescription = document.getElementById('productDescription');
    const descCharCount = document.getElementById('descCharCount');
    const descPreview = document.getElementById('descPreview');
    const searchTermsFields = document.querySelectorAll('.search-term-field');
    const searchTermsTags = document.getElementById('searchTermsTags');
    const showOnlyUsedKeywords = document.getElementById('showOnlyUsedKeywords');
    const saveTemplateBtn = document.getElementById('saveTemplateBtn');
    const saveTemplateModal = new bootstrap.Modal(document.getElementById('saveTemplateModal'));
    const confirmSaveTemplate = document.getElementById('confirmSaveTemplate');
    const exportReportBtn = document.getElementById('exportReportBtn');
    const importKeywordsBtn = document.getElementById('importKeywordsBtn');
   
    // Variables de estado
    let keywords = [];
    let customRules = [];
    let totalRules = 4; // Reglas base
    let usedKeywordsInTitle = [];
    let usedKeywordsInBullets = [];
    let usedKeywordsInDescription = [];
    let templates = [];
   
    // Event listeners
    productTitle.addEventListener('input', updateTitleAnalysis);
    addRuleBtn.addEventListener('click', addCustomRule);
    addKeywordBtn.addEventListener('click', addKeyword);
    addBulletBtn.addEventListener('click', addBulletPoint);
    productDescription.addEventListener('input', updateDescriptionPreview);
    showOnlyUsedKeywords.addEventListener('change', renderKeywords);
    saveTemplateBtn.addEventListener('click', () => saveTemplateModal.show());
    confirmSaveTemplate.addEventListener('click', saveTemplate);
    exportReportBtn.addEventListener('click', exportReport);
    importKeywordsBtn.addEventListener('click', importKeywords);
   
    // Configurar event listeners para bullet points existentes
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-bullet')) {
            e.target.closest('.bullet-point').remove();
            updateBulletPointsAnalysis();
        }
       
        if (e.target.classList.contains('bullet-text')) {
            e.target.nextElementSibling.querySelector('.remove-bullet').style.display = 'block';
        }
    });
   
    // Configurar event listeners para campos de términos de búsqueda
    searchTermsFields.forEach(field => {
        field.addEventListener('input', function() {
            const countElement = this.parentElement.querySelector('.search-term-count');
            countElement.textContent = this.value.length;
            updateSearchTermsAnalysis();
        });
    });
   
    // Funciones
    function updateTitleAnalysis() {
        const title = productTitle.value;
        const titleLength = title.length;
       
        // Actualizar contador de caracteres
        charCount.textContent = titleLength;
        charCount.className = titleLength >= 175 && titleLength <= 200 ? 'text-success fw-bold' : 'text-muted';
       
        // Actualizar vista previa con resaltado de palabras clave
        updateTitlePreview(title);
       
        // Verificar reglas
        checkRules(title);
       
        // Actualizar análisis general
        updateOptimizationSummary();
    }
   
    function updateTitlePreview(title) {
        let previewHtml = title;
       
        // Resaltar palabras clave en el título
        usedKeywordsInTitle = [];
        keywords.forEach(kw => {
            const keywordLower = kw.keyword.toLowerCase();
            if (title.toLowerCase().includes(keywordLower)) {
                usedKeywordsInTitle.push(kw);
                const regex = new RegExp(kw.keyword, 'gi');
                previewHtml = previewHtml.replace(regex, match =>
                    `<span class="highlight search-term">${match}<span class="term-tooltip">${kw.searches.toLocaleString()} búsquedas/mes | ${kw.conversion}% conversión</span></span>`
                );
            }
        });
       
        // Resaltar la marca PACKLIST
        if (title.toLowerCase().includes('packlist')) {
            const regex = /packlist/gi;
            previewHtml = previewHtml.replace(regex, match =>
                `<span class="highlight" style="background-color: #d4edda">${match}</span>`
            );
        }
       
        titlePreview.innerHTML = previewHtml;
    }
   
    function checkRules(title) {
        let completedRules = 0;
        const titleWords = title.toLowerCase().split(/\s+/);
        const wordCounts = {};
       
        // Contar repeticiones de palabras
        titleWords.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
       
        // 1. Verificar longitud (175-200 caracteres)
        const lengthOk = title.length >= 175 && title.length <= 200;
        lengthCheck.innerHTML = lengthOk ? '✅' : '❌';
        if (lengthOk) completedRules++;
       
        // 2. Verificar palabras clave (máx 3)
        usedKeywordsInTitle = keywords.filter(kw =>
            title.toLowerCase().includes(kw.keyword.toLowerCase())
        ).slice(0, 3);
        const keywordScore = Math.min(usedKeywordsInTitle.length, 3);
        keywordCheck.textContent = `${keywordScore}/3`;
        keywordCheck.className = keywordScore > 0 ? 'badge bg-success' : 'badge bg-secondary';
        if (keywordScore > 0) completedRules++;
       
        // 3. Verificar repetición de palabras (no más de 2 veces)
        const hasRepetition = Object.values(wordCounts).some(count => count > 2);
        repetitionCheck.innerHTML = !hasRepetition ? '✅' : '❌';
        if (!hasRepetition) completedRules++;
       
        // 4. Verificar marca PACKLIST
        const hasBrand = title.toLowerCase().includes('packlist');
        brandCheck.innerHTML = hasBrand ? '✅' : '❌';
        if (hasBrand) completedRules++;
       
        // Verificar reglas personalizadas
        let customCompleted = 0;
        customRules.forEach((rule, index) => {
            const ruleElement = document.getElementById(`customRule_${index}`);
            const checkElement = document.getElementById(`customRuleCheck_${index}`);
           
            if (ruleElement && checkElement) {
                const ruleMet = title.toLowerCase().includes(rule.text.toLowerCase());
                checkElement.innerHTML = ruleMet ? '✅' : '❌';
                if (ruleMet) customCompleted++;
            }
        });
       
        // Calcular puntuación total
        const totalCompleted = completedRules + customCompleted;
        const totalPossible = totalRules + customRules.length;
        const scorePercentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
       
        // Actualizar barra de puntuación
        scoreBar.style.width = `${scorePercentage}%`;
        scoreText.textContent = `${totalCompleted}/${totalPossible}`;
       
        // Actualizar color según puntuación
        if (scorePercentage >= 75) {
            scoreBar.className = 'progress-bar bg-success';
        } else if (scorePercentage >= 50) {
            scoreBar.className = 'progress-bar bg-warning';
        } else {
            scoreBar.className = 'progress-bar bg-danger';
        }
       
        // Actualizar análisis de densidad y repetición
        updateDensityAnalysis(titleWords, usedKeywordsInTitle);
        updateRepetitionAnalysis(wordCounts);
    }
   
    function updateDensityAnalysis(titleWords, usedKeywords) {
        let content = '<div class="mb-2">';
       
        if (usedKeywords.length > 0) {
            usedKeywords.forEach(kw => {
                const count = titleWords.filter(w => w === kw.keyword.toLowerCase()).length;
                const density = (count / titleWords.length * 100).toFixed(1);
               
                content += `
                    <div class="d-flex justify-content-between mb-1">
                        <span>${kw.keyword}</span>
                        <span>${count} veces (${density}%)</span>
                    </div>
                    <div class="progress mb-2">
                        <div class="progress-bar bg-info" role="progressbar" style="width: ${density}%"></div>
                    </div>
                `;
            });
        } else {
            content += '<p class="text-muted">No se han usado palabras clave aún.</p>';
        }
       
        content += '</div>';
        keywordDensityChart.innerHTML = content;
    }
   
    function updateRepetitionAnalysis(wordCounts) {
        let content = '<ul class="list-group list-group-flush">';
        let hasRepetition = false;
       
        for (const [word, count] of Object.entries(wordCounts)) {
            if (count > 1) {
                hasRepetition = true;
                const status = count > 2 ? 'text-danger' : 'text-warning';
                content += `
                    <li class="list-group-item d-flex justify-content-between">
                        <span>${word}</span>
                        <span class="${status}">${count} veces</span>
                    </li>
                `;
            }
        }
       
        if (!hasRepetition) {
            content += '<li class="list-group-item text-muted">No hay palabras repetidas.</li>';
        }
       
        content += '</ul>';
        repetitionAnalysis.innerHTML = content;
    }
   
    function addCustomRule() {
        const ruleText = newRuleText.value.trim();
        if (!ruleText) return;
       
        const ruleId = customRules.length;
        customRules.push({ text: ruleText });
       
        const ruleElement = document.createElement('div');
        ruleElement.className = 'custom-rule';
        ruleElement.id = `customRule_${ruleId}`;
        ruleElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <span>${ruleText}</span>
                <div>
                    <span id="customRuleCheck_${ruleId}" class="badge bg-secondary">❌</span>
                    <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeCustomRule(${ruleId})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
       
        customRulesContainer.appendChild(ruleElement);
        newRuleText.value = '';
       
        // Actualizar análisis
        updateTitleAnalysis();
    }
   
    function addKeyword() {
        const keyword = newKeyword.value.trim();
        const searches = parseInt(newKeywordSearches.value) || 0;
        const conversion = parseFloat(newKeywordConversion.value) || 0;
       
        if (!keyword) return;
       
        keywords.push({
            keyword,
            searches,
            conversion
        });
       
        renderKeywords();
       
        // Limpiar campos
        newKeyword.value = '';
        newKeywordSearches.value = '';
        newKeywordConversion.value = '';
       
        // Actualizar análisis
        updateTitleAnalysis();
        updateBulletPointsAnalysis();
        updateDescriptionPreview();
    }
   
    function renderKeywords() {
        keywordsList.innerHTML = '';
       
        // Ordenar por búsquedas descendente
        keywords.sort((a, b) => b.searches - a.searches);
       
        const showOnlyUsed = showOnlyUsedKeywords.checked;
        const currentTab = document.querySelector('#listingTabs .nav-link.active').id;
       
        keywords.forEach((kw, index) => {
            // Determinar si la palabra clave está siendo usada
            let isUsed = false;
            let usedIn = [];
           
            if (productTitle.value.toLowerCase().includes(kw.keyword.toLowerCase())) {
                isUsed = true;
                usedIn.push('Título');
            }
           
            // Verificar en bullet points
            const bulletTexts = Array.from(document.querySelectorAll('.bullet-text')).map(el => el.value.toLowerCase());
            if (bulletTexts.some(text => text.includes(kw.keyword.toLowerCase()))) {
                isUsed = true;
                usedIn.push('Bullets');
            }
           
            // Verificar en descripción
            if (productDescription.value.toLowerCase().includes(kw.keyword.toLowerCase())) {
                isUsed = true;
                usedIn.push('Descripción');
            }
           
            // Si estamos filtrando solo usadas y esta no lo está, saltar
            if (showOnlyUsed && !isUsed) return;
           
            const keywordElement = document.createElement('div');
            keywordElement.className = 'd-flex justify-content-between align-items-center mb-2';
           
            let badgeClass = 'bg-primary';
            if (usedIn.includes('Título')) badgeClass = 'bg-success';
            else if (usedIn.length > 0) badgeClass = 'bg-info';
           
            keywordElement.innerHTML = `
                <div>
                    <span class="keyword-badge badge ${badgeClass} me-2" onclick="insertKeyword('${kw.keyword}')">
                        ${kw.keyword}
                        ${usedIn.length > 0 ? `<sup>${usedIn.join(',')}</sup>` : ''}
                    </span>
                </div>
                <div class="d-flex align-items-center">
                    <span class="text-muted me-2">
                        ${kw.searches.toLocaleString()} | ${kw.conversion}%
                    </span>
                    <button class="btn btn-sm btn-outline-danger" onclick="removeKeyword(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            keywordsList.appendChild(keywordElement);
        });
       
        if (keywordsList.children.length === 0) {
            keywordsList.innerHTML = '<p class="text-muted">No hay palabras clave que coincidan con el filtro.</p>';
        }
    }
   
    function addBulletPoint() {
        const bulletPoints = document.querySelectorAll('.bullet-point');
        if (bulletPoints.length >= 5) {
            alert('Amazon permite un máximo de 5 bullet points');
            return;
        }
       
        const bulletDiv = document.createElement('div');
        bulletDiv.className = 'bullet-point mb-3';
        bulletDiv.innerHTML = `
            <textarea class="form-control bullet-text" rows="2" placeholder="Característica principal del producto..."></textarea>
            <div class="mt-2 d-flex justify-content-between">
                <small class="text-muted">Caracteres: <span class="bullet-char-count">0</span>/500</small>
                <button class="btn btn-sm btn-outline-danger remove-bullet">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
       
        bulletsContainer.appendChild(bulletDiv);
       
        // Configurar event listeners para el nuevo bullet point
        const textarea = bulletDiv.querySelector('.bullet-text');
        const charCount = bulletDiv.querySelector('.bullet-char-count');
       
        textarea.addEventListener('input', function() {
            charCount.textContent = this.value.length;
            updateBulletPointsAnalysis();
        });
       
        textarea.addEventListener('focus', function() {
            this.nextElementSibling.querySelector('.remove-bullet').style.display = 'block';
        });
    }
   
    function updateBulletPointsAnalysis() {
        const bulletTexts = Array.from(document.querySelectorAll('.bullet-text')).map(el => el.value);
        usedKeywordsInBullets = [];
       
        // Verificar palabras clave en bullet points
        keywords.forEach(kw => {
            if (bulletTexts.some(text => text.toLowerCase().includes(kw.keyword.toLowerCase()))) {
                usedKeywordsInBullets.push(kw);
            }
        });
       
        // Actualizar análisis general
        updateOptimizationSummary();
    }
   
    function updateDescriptionPreview() {
        const description = productDescription.value;
        descCharCount.textContent = description.length;
       
        let previewHtml = description;
       
        // Resaltar palabras clave en la descripción
        usedKeywordsInDescription = [];
        keywords.forEach(kw => {
            const keywordLower = kw.keyword.toLowerCase();
            if (description.toLowerCase().includes(keywordLower)) {
                usedKeywordsInDescription.push(kw);
                const regex = new RegExp(kw.keyword, 'gi');
                previewHtml = previewHtml.replace(regex, match =>
                    `<span class="highlight">${match}</span>`
                );
            }
        });
       
        // Convertir saltos de línea en <br>
        previewHtml = previewHtml.replace(/\n/g, '<br>');
       
        descPreview.innerHTML = previewHtml;
       
        // Actualizar análisis general
        updateOptimizationSummary();
    }
   
    function updateSearchTermsAnalysis() {
        searchTermsTags.innerHTML = '';
        const allTerms = [];
       
        searchTermsFields.forEach(field => {
            const terms = field.value.split(',').map(t => t.trim()).filter(t => t);
            terms.forEach(term => {
                allTerms.push(term);
               
                const termElement = document.createElement('span');
                termElement.className = 'keyword-tag badge bg-secondary';
                termElement.textContent = term;
                searchTermsTags.appendChild(termElement);
            });
        });
       
        // Actualizar análisis general
        updateOptimizationSummary();
    }
   
    function updateOptimizationSummary() {
        let content = '';
       
        // Resumen de palabras clave
        const allUsedKeywords = [...new Set([
            ...usedKeywordsInTitle.map(k => k.keyword),
            ...usedKeywordsInBullets.map(k => k.keyword),
            ...usedKeywordsInDescription.map(k => k.keyword)
        ])];
       
        if (allUsedKeywords.length > 0) {
            content += `
                <div class="mb-3">
                    <h6>Palabras clave utilizadas</h6>
                    <div class="d-flex flex-wrap">
                        ${allUsedKeywords.map(kw => `
                            <span class="keyword-tag badge bg-primary me-1 mb-1">${kw}</span>
                        `).join('')}
                    </div>
                </div>
            `;
        }
       
        // Estadísticas de uso
        const titleLength = productTitle.value.length;
        const descLength = productDescription.value.length;
        const bulletsCount = document.querySelectorAll('.bullet-point').length;
        const bulletsLength = Array.from(document.querySelectorAll('.bullet-text')).reduce((sum, el) => sum + el.value.length, 0);
        const searchTermsCount = Array.from(document.querySelectorAll('.search-term-field')).reduce((sum, el) => sum + el.value.split(',').filter(t => t.trim()).length, 0);
       
        content += `
            <div class="mb-3">
                <h6>Estadísticas</h6>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Longitud del título</span>
                        <span>${titleLength}/200 caracteres</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Bullet points</span>
                        <span>${bulletsCount}/5 | ${bulletsLength} caracteres</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Descripción</span>
                        <span>${descLength}/2000 caracteres</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Términos de búsqueda</span>
                        <span>${searchTermsCount} términos</span>
                    </li>
                </ul>
            </div>
        `;
       
        // Recomendaciones
        let recommendations = [];
       
        if (titleLength < 175) {
            recommendations.push('El título es demasiado corto. Intenta llegar a al menos 175 caracteres.');
        } else if (titleLength > 200) {
            recommendations.push('El título excede el límite de 200 caracteres.');
        }
       
        if (bulletsCount < 3) {
            recommendations.push('Considera añadir más bullet points (Amazon permite hasta 5).');
        }
       
        if (descLength < 500) {
            recommendations.push('La descripción podría ser más detallada. Intenta llegar a al menos 500 caracteres.');
        }
       
        if (searchTermsCount < 15) {
            recommendations.push('Puedes añadir más términos de búsqueda para mejorar la visibilidad.');
        }
       
        if (recommendations.length > 0) {
            content += `
                <div>
                    <h6>Recomendaciones</h6>
                    <ul class="list-group list-group-flush">
                        ${recommendations.map(rec => `
                            <li class="list-group-item">
                                <i class="fas fa-exclamation-circle text-warning me-2"></i> ${rec}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
       
        optimizationSummary.innerHTML = content || '<p class="text-muted">Completa los campos para ver el análisis</p>';
    }
   
    function saveTemplate() {
        const templateName = document.getElementById('templateName').value.trim();
        if (!templateName) {
            alert('Por favor ingresa un nombre para la plantilla');
            return;
        }
       
        const includeTitle = document.getElementById('includeTitle').checked;
        const includeBullets = document.getElementById('includeBullets').checked;
        const includeDescription = document.getElementById('includeDescription').checked;
        const includeSearchTerms = document.getElementById('includeSearchTerms').checked;
       
        const template = {
            name: templateName,
            title: includeTitle ? productTitle.value : '',
            bullets: includeBullets ? Array.from(document.querySelectorAll('.bullet-text')).map(el => el.value) : [],
            description: includeDescription ? productDescription.value : '',
            searchTerms: includeSearchTerms ? Array.from(document.querySelectorAll('.search-term-field')).map(el => el.value) : []
        };
       
        templates.push(template);
        saveTemplateModal.hide();
       
        // Mostrar notificación
        alert(`Plantilla "${templateName}" guardada correctamente.`);
       
        // Limpiar campos del modal
        document.getElementById('templateName').value = '';
    }
   
    function exportReport() {
        const report = {
            title: productTitle.value,
            titleScore: scoreText.textContent,
            bullets: Array.from(document.querySelectorAll('.bullet-text')).map(el => el.value),
            description: productDescription.value,
            searchTerms: Array.from(document.querySelectorAll('.search-term-field')).map(el => el.value),
            keywords: keywords,
            analysis: optimizationSummary.textContent
        };
       
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
       
        const a = document.createElement('a');
        a.href = url;
        a.download = `amazon-listing-report-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
   
    function importKeywords() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.csv';
       
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
           
            reader.onload = event => {
                try {
                    const data = JSON.parse(event.target.result);
                   
                    if (Array.isArray(data)) {
                        keywords = [...keywords, ...data];
                        renderKeywords();
                        alert(`${data.length} palabras clave importadas correctamente.`);
                    } else if (data.keywords) {
                        keywords = [...keywords, ...data.keywords];
                        renderKeywords();
                        alert(`${data.keywords.length} palabras clave importadas correctamente.`);
                    } else {
                        throw new Error('Formato no reconocido');
                    }
                } catch (error) {
                    alert('Error al importar el archivo. Asegúrate de que es un archivo JSON válido.');
                    console.error(error);
                }
            };
           
            reader.readAsText(file);
        };
       
        input.click();
    }
   
    // Funciones globales para botones
    window.insertKeyword = function(keyword) {
        const currentTab = document.querySelector('#listingTabs .nav-link.active').id;
        let targetElement;
       
        if (currentTab === 'title-tab') {
            targetElement = productTitle;
        } else if (currentTab === 'bullets-tab') {
            const activeBullet = document.querySelector('.bullet-text:focus');
            targetElement = activeBullet || document.querySelector('.bullet-text');
           
            if (!targetElement) {
                addBulletPoint();
                targetElement = document.querySelector('.bullet-text:last-child');
            }
        } else if (currentTab === 'description-tab') {
            targetElement = productDescription;
        } else {
            // Para términos de búsqueda, insertar en el primer campo
            targetElement = document.querySelector('.search-term-field');
        }
       
        if (!targetElement) return;
       
        const startPos = targetElement.selectionStart;
        const endPos = targetElement.selectionEnd;
        const currentText = targetElement.value;
       
        // Insertar la palabra clave en la posición del cursor
        targetElement.value = currentText.substring(0, startPos) + keyword + currentText.substring(endPos);
       
        // Mover el cursor después de la palabra insertada
        targetElement.selectionStart = targetElement.selectionEnd = startPos + keyword.length;
       
        // Actualizar análisis
        if (currentTab === 'title-tab') {
            updateTitleAnalysis();
        } else if (currentTab === 'bullets-tab') {
            updateBulletPointsAnalysis();
        } else if (currentTab === 'description-tab') {
            updateDescriptionPreview();
        } else {
            updateSearchTermsAnalysis();
        }
       
        targetElement.focus();
    };
   
    window.removeKeyword = function(index) {
        if (confirm('¿Estás seguro de que quieres eliminar esta palabra clave?')) {
            keywords.splice(index, 1);
            renderKeywords();
           
            // Actualizar todos los análisis
            updateTitleAnalysis();
            updateBulletPointsAnalysis();
            updateDescriptionPreview();
        }
    };
   
    window.removeCustomRule = function(index) {
        const ruleElement = document.getElementById(`customRule_${index}`);
        if (ruleElement) {
            ruleElement.remove();
            customRules.splice(index, 1);
           
            // Reindexar las reglas restantes
            customRules.forEach((rule, newIndex) => {
                const oldId = `customRule_${newIndex >= index ? newIndex + 1 : newIndex}`;
                const newId = `customRule_${newIndex}`;
                const element = document.getElementById(oldId);
                if (element) {
                    element.id = newId;
                    const checkElement = element.querySelector('span[id^="customRuleCheck_"]');
                    if (checkElement) checkElement.id = `customRuleCheck_${newIndex}`;
                }
            });
           
            updateTitleAnalysis();
        }
    };
   
    window.applyBulletTemplate = function(templateId) {
        // Limpiar bullet points existentes
        document.querySelectorAll('.bullet-point').forEach(el => el.remove());
       
        // Añadir bullet points según la plantilla seleccionada
        let bullets = [];
       
        if (templateId === 1) {
            bullets = [
                "Material premium de alta calidad para mayor durabilidad",
                "Diseño ergonómico para mayor comodidad de uso",
                "Garantía de 2 años incluida con tu compra"
            ];
        } else if (templateId === 2) {
            bullets = [
                "Especificaciones técnicas: dimensiones, peso, materiales",
                "Compatibilidad con los principales modelos del mercado",
                "Certificaciones de seguridad y calidad internacionales"
            ];
        }
       
        // Añadir los bullet points
        bullets.forEach(bullet => {
            addBulletPoint();
            const lastBullet = document.querySelector('.bullet-point:last-child .bullet-text');
            lastBullet.value = bullet;
            lastBullet.dispatchEvent(new Event('input'));
        });
       
        // Actualizar análisis
        updateBulletPointsAnalysis();
    };
   
    window.formatText = function(type) {
        const textarea = productDescription;
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        const selectedText = textarea.value.substring(startPos, endPos);
        let newText = selectedText;
       
        switch(type) {
            case 'bold':
                newText = `<b>${selectedText}</b>`;
                break;
            case 'italic':
                newText = `<i>${selectedText}</i>`;
                break;
            case 'ul':
                newText = selectedText.split('\n').map(line => line ? `<li>${line}</li>` : '').join('\n');
                break;
        }
       
        // Reemplazar el texto seleccionado
        textarea.value = textarea.value.substring(0, startPos) + newText + textarea.value.substring(endPos);
       
        // Restaurar la selección
        textarea.selectionStart = startPos;
        textarea.selectionEnd = startPos + newText.length;
       
        // Actualizar vista previa
        updateDescriptionPreview();
        textarea.focus();
    };
   
    // Ejemplo de palabras clave iniciales
    keywords = [
        { keyword: 'organizador', searches: 12000, conversion: 3.2 },
        { keyword: 'viaje', searches: 8500, conversion: 2.8 },
        { keyword: 'maleta', searches: 7500, conversion: 2.5 },
        { keyword: 'cosmeticos', searches: 6000, conversion: 3.5 },
        { keyword: 'accesorios', searches: 5000, conversion: 2.1 },
        { keyword: 'packlist', searches: 3000, conversion: 4.1 },
        { keyword: 'premium', searches: 8000, conversion: 2.9 },
        { keyword: 'calidad', searches: 7000, conversion: 2.7 }
    ];
   
    // Inicializar
    renderKeywords();
    updateTitleAnalysis();
    addBulletPoint(); // Añadir un bullet point inicial
});
