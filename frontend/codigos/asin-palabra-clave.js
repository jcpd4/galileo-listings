document.addEventListener('DOMContentLoaded', function() {
    const analyzeBtn = document.getElementById('analyze-btn');
    const asinInput = document.getElementById('asin');
    const resultsSection = document.getElementById('results');
    const currentKeywordsContainer = document.getElementById('current-keywords');
    const recommendedKeywordsContainer = document.getElementById('recommended-keywords');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const currentCount = document.getElementById('current-count');
    const recommendedCount = document.getElementById('recommended-count');
    const exportCurrentBtn = document.getElementById('export-current');
    const exportRecommendedBtn = document.getElementById('export-recommended');
    const exportBothBtn = document.getElementById('export-both');
    
    // Data storage
    let currentKeywordsData = [];
    let recommendedKeywordsData = [];
    let currentSort = { column: 'volume', direction: 'desc' };
    let recommendedSort = { column: 'volume', direction: 'desc' };

    analyzeBtn.addEventListener('click', function() {
        const asin = asinInput.value.trim();
        
        // Validate ASIN format (basic validation)
        if (!asin || asin.length < 10) {
            showError('Por favor ingresa un ASIN válido de Amazon (10 caracteres)');
            return;
        }
        
        // Show loading state
        btnText.textContent = 'Analizando...';
        btnSpinner.classList.remove('hidden');
        analyzeBtn.disabled = true;
        
        // Hide previous results and errors
        resultsSection.classList.add('hidden');
        errorMessage.classList.add('hidden');
        
        // Simulate API call (in a real implementation, you would call your backend here)
        setTimeout(() => {
            try {
                // This is where you would normally make an actual API call to your backend
                // which would then call the Google Ads API
                // For this example, we'll simulate a response with more data
                const mockResponse = {
                    currentKeywords: [
                        { keyword: 'auriculares inalámbricos', volume: 45000, position: 3, cpc: 1.25, trend: 'up' },
                        { keyword: 'audífonos bluetooth', volume: 32000, position: 5, cpc: 0.95, trend: 'stable' },
                        { keyword: 'headphones wireless', volume: 28000, position: 8, cpc: 1.10, trend: 'up' },
                        { keyword: 'audífonos deportivos', volume: 18000, position: 12, cpc: 0.85, trend: 'down' },
                        { keyword: 'auriculares con micrófono', volume: 22000, position: 15, cpc: 0.78, trend: 'up' },
                        { keyword: 'cascos inalámbricos', volume: 15000, position: 18, cpc: 0.65, trend: 'stable' },
                        { keyword: 'auriculares gaming', volume: 25000, position: 7, cpc: 1.15, trend: 'up' },
                        { keyword: 'bluetooth headphones', volume: 35000, position: 4, cpc: 1.20, trend: 'up' }
                    ],
                    recommendedKeywords: [
                        { keyword: 'auriculares inalámbricos deportivos', volume: 15000, competition: 'MEDIUM', cpc: 0.90, potential: 'HIGH' },
                        { keyword: 'audífonos bluetooth para correr', volume: 12000, competition: 'LOW', cpc: 0.75, potential: 'HIGH' },
                        { keyword: 'headphones wireless noise cancelling', volume: 25000, competition: 'HIGH', cpc: 1.45, potential: 'MEDIUM' },
                        { keyword: 'auriculares con micrófono gaming', volume: 18000, competition: 'MEDIUM', cpc: 1.05, potential: 'HIGH' },
                        { keyword: 'cascos bluetooth plegables', volume: 8000, competition: 'LOW', cpc: 0.60, potential: 'MEDIUM' },
                        { keyword: 'auriculares deportivos resistentes al agua', volume: 9500, competition: 'LOW', cpc: 0.85, potential: 'HIGH' },
                        { keyword: 'wireless earbuds for gym', volume: 14000, competition: 'MEDIUM', cpc: 0.95, potential: 'MEDIUM' },
                        { keyword: 'auriculares con cancelación de ruido', volume: 21000, competition: 'HIGH', cpc: 1.30, potential: 'MEDIUM' }
                    ]
                };
                
                // Store the data
                currentKeywordsData = mockResponse.currentKeywords;
                recommendedKeywordsData = mockResponse.recommendedKeywords;
                
                // Sort data initially
                sortData('current', currentSort.column, currentSort.direction);
                sortData('recommended', recommendedSort.column, recommendedSort.direction);
                
                displayResults();
                
                // Reset button state
                btnText.textContent = 'Analizar';
                btnSpinner.classList.add('hidden');
                analyzeBtn.disabled = false;
            } catch (error) {
                showError('Error al conectar con la API. Por favor intenta nuevamente.');
                btnText.textContent = 'Analizar';
                btnSpinner.classList.add('hidden');
                analyzeBtn.disabled = false;
            }
        }, 1500);
    });
    
    function displayResults() {
        // Clear previous results
        currentKeywordsContainer.innerHTML = '';
        recommendedKeywordsContainer.innerHTML = '';
        
        // Display current keywords
        currentKeywordsData.forEach(keyword => {
            const keywordElement = createKeywordRow(keyword, true);
            currentKeywordsContainer.appendChild(keywordElement);
        });
        
        // Display recommended keywords
        recommendedKeywordsData.forEach(keyword => {
            const keywordElement = createKeywordRow(keyword, false);
            recommendedKeywordsContainer.appendChild(keywordElement);
        });
        
        // Update counts
        currentCount.textContent = currentKeywordsData.length;
        recommendedCount.textContent = recommendedKeywordsData.length;
        
        // Show results section
        resultsSection.classList.remove('hidden');
    }
    
    function createKeywordRow(keywordData, isCurrent) {
        const row = document.createElement('tr');
        
        // Keyword cell
        const keywordCell = document.createElement('td');
        keywordCell.className = 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 keyword-cell';
        keywordCell.textContent = keywordData.keyword;
        row.appendChild(keywordCell);
        
        // Volume cell
        const volumeCell = document.createElement('td');
        volumeCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
        volumeCell.textContent = keywordData.volume.toLocaleString();
        row.appendChild(volumeCell);
        
        if (isCurrent) {
            // Position cell
            const positionCell = document.createElement('td');
            positionCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
            
            const positionBadge = document.createElement('span');
            positionBadge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' + 
                (keywordData.position <= 5 ? 'bg-green-100 text-green-800' : 
                 keywordData.position <= 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800');
            positionBadge.textContent = keywordData.position;
            
            positionCell.appendChild(positionBadge);
            row.appendChild(positionCell);
            
            // CPC cell
            const cpcCell = document.createElement('td');
            cpcCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
            cpcCell.textContent = `$${keywordData.cpc.toFixed(2)}`;
            row.appendChild(cpcCell);
            
            // Trend cell
            const trendCell = document.createElement('td');
            trendCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
            
            const trendIcon = document.createElement('i');
            trendIcon.className = keywordData.trend === 'up' ? 'fas fa-arrow-up text-green-500' : 
                                  keywordData.trend === 'down' ? 'fas fa-arrow-down text-red-500' : 
                                  'fas fa-minus text-gray-500';
            
            trendCell.appendChild(trendIcon);
            row.appendChild(trendCell);
        } else {
            // Competition cell
            const competitionCell = document.createElement('td');
            competitionCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
            
            const competitionBadge = document.createElement('span');
            competitionBadge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' + 
                (keywordData.competition === 'HIGH' ? 'bg-red-100 text-red-800' : 
                 keywordData.competition === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800');
            competitionBadge.textContent = getCompetitionText(keywordData.competition);
            
            competitionCell.appendChild(competitionBadge);
            row.appendChild(competitionCell);
            
            // CPC cell
            const cpcCell = document.createElement('td');
            cpcCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
            cpcCell.textContent = `$${keywordData.cpc.toFixed(2)}`;
            row.appendChild(cpcCell);
            
            // Potential cell
            const potentialCell = document.createElement('td');
            potentialCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
            
            const potentialBadge = document.createElement('span');
            potentialBadge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' + 
                (keywordData.potential === 'HIGH' ? 'bg-green-100 text-green-800' : 
                 keywordData.potential === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800');
            potentialBadge.textContent = getPotentialText(keywordData.potential);
            
            potentialCell.appendChild(potentialBadge);
            row.appendChild(potentialCell);
        }
        
        return row;
    }
    
    function getCompetitionText(competition) {
        switch(competition) {
            case 'HIGH': return 'Alta';
            case 'MEDIUM': return 'Media';
            case 'LOW': return 'Baja';
            default: return competition;
        }
    }
    
    function getPotentialText(potential) {
        switch(potential) {
            case 'HIGH': return 'Alto';
            case 'MEDIUM': return 'Medio';
            case 'LOW': return 'Bajo';
            default: return potential;
        }
    }
    
    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
    }
    
    // Sorting functionality
    document.querySelectorAll('.sortable-header').forEach(header => {
        header.addEventListener('click', function() {
            const column = this.getAttribute('data-sort');
            const table = this.getAttribute('data-table');
            
            // Determine new sort direction
            let direction = 'asc';
            if ((table === 'current' && currentSort.column === column) || 
                (table === 'recommended' && recommendedSort.column === column)) {
                direction = (table === 'current' ? currentSort.direction : recommendedSort.column === column ? recommendedSort.direction : 'asc') === 'asc' ? 'desc' : 'asc';
            }
            
            // Update sort state
            if (table === 'current') {
                currentSort = { column, direction };
            } else {
                recommendedSort = { column, direction };
            }
            
            // Sort data
            sortData(table, column, direction);
            
            // Update UI
            updateSortIcons(table, column, direction);
            displayResults();
        });
    });
    
    function sortData(table, column, direction) {
        const data = table === 'current' ? currentKeywordsData : recommendedKeywordsData;
        
        data.sort((a, b) => {
            // Handle different data types
            if (column === 'keyword') {
                return direction === 'asc' 
                    ? a[column].localeCompare(b[column]) 
                    : b[column].localeCompare(a[column]);
            } else if (column === 'competition' || column === 'potential') {
                // Convert to numerical value for sorting
                const aValue = getCompetitionValue(a[column]);
                const bValue = getCompetitionValue(b[column]);
                return direction === 'asc' ? aValue - bValue : bValue - aValue;
            } else if (column === 'trend') {
                // Trends: up > stable > down
                const trendOrder = { 'up': 3, 'stable': 2, 'down': 1 };
                return direction === 'asc' 
                    ? trendOrder[a[column]] - trendOrder[b[column]] 
                    : trendOrder[b[column]] - trendOrder[a[column]];
            } else {
                // Numerical columns (volume, position, cpc)
                return direction === 'asc' 
                    ? a[column] - b[column] 
                    : b[column] - a[column];
            }
        });
        
        if (table === 'current') {
            currentKeywordsData = data;
        } else {
            recommendedKeywordsData = data;
        }
    }
    
    function getCompetitionValue(competition) {
        switch(competition) {
            case 'HIGH': return 3;
            case 'MEDIUM': return 2;
            case 'LOW': return 1;
            default: return 0;
        }
    }
    
    function updateSortIcons(table, column, direction) {
        // Reset all icons
        document.querySelectorAll(`.sort-icon[data-table="${table}"]`).forEach(icon => {
            icon.className = 'fas fa-sort sort-icon';
        });
        
        // Set active icon
        const activeIcon = document.querySelector(`.sort-icon[data-sort="${column}"][data-table="${table}"]`);
        if (activeIcon) {
            activeIcon.className = direction === 'asc' 
                ? 'fas fa-sort-up sort-icon active' 
                : 'fas fa-sort-down sort-icon active';
        }
    }
    
    // Export functions
    exportCurrentBtn.addEventListener('click', function() {
        exportToCSV(currentKeywordsData, 'palabras_clave_actuales', true);
    });
    
    exportRecommendedBtn.addEventListener('click', function() {
        exportToCSV(recommendedKeywordsData, 'palabras_clave_recomendadas', false);
    });
    
    exportBothBtn.addEventListener('click', function() {
        // Create a combined CSV with both datasets
        const combinedData = {
            currentKeywords: currentKeywordsData,
            recommendedKeywords: recommendedKeywordsData
        };
        exportCombinedToCSV(combinedData, 'palabras_clave_combinadas');
    });
    
    function exportToCSV(data, filename, isCurrent) {
        if (!data || data.length === 0) {
            alert('No hay datos para exportar');
            return;
        }
        
        let csv = '';
        
        // Add headers
        if (isCurrent) {
            csv += 'Palabra clave,Volumen,Posición,CPC,Tendencia\n';
        } else {
            csv += 'Palabra clave,Volumen,Competencia,CPC,Potencial\n';
        }
        
        // Add data rows
        data.forEach(item => {
            if (isCurrent) {
                csv += `"${item.keyword}",${item.volume},${item.position},${item.cpc.toFixed(2)},"${item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'}"\n`;
            } else {
                csv += `"${item.keyword}",${item.volume},"${getCompetitionText(item.competition)}",${item.cpc.toFixed(2)},"${getPotentialText(item.potential)}"\n`;
            }
        });
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    function exportCombinedToCSV(data, filename) {
        if ((!data.currentKeywords || data.currentKeywords.length === 0) && 
            (!data.recommendedKeywords || data.recommendedKeywords.length === 0)) {
            alert('No hay datos para exportar');
            return;
        }
        
        let csv = '';
        
        // Add current keywords section
        if (data.currentKeywords && data.currentKeywords.length > 0) {
            csv += 'PALABRAS CLAVE ACTUALES\n';
            csv += 'Palabra clave,Volumen,Posición,CPC,Tendencia\n';
            
            data.currentKeywords.forEach(item => {
                csv += `"${item.keyword}",${item.volume},${item.position},${item.cpc.toFixed(2)},"${item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'}"\n`;
            });
            
            csv += '\n';
        }
        
        // Add recommended keywords section
        if (data.recommendedKeywords && data.recommendedKeywords.length > 0) {
            csv += 'PALABRAS CLAVE RECOMENDADAS\n';
            csv += 'Palabra clave,Volumen,Competencia,CPC,Potencial\n';
            
            data.recommendedKeywords.forEach(item => {
                csv += `"${item.keyword}",${item.volume},"${getCompetitionText(item.competition)}",${item.cpc.toFixed(2)},"${getPotentialText(item.potential)}"\n`;
            });
        }
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});