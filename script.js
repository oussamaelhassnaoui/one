// Data structure for customers
let customers = [];
let currentCustomer = null;
let currentCustomerIndex = -1;

// Define the medium voltage fields with their natural order
const mediumVoltageFields = [
    { id: "activeImpPleine", label: "01-ACTIVE IMP PLEINE", order: 5 },
    { id: "activeImpPointe", label: "02-ACTIVE IMP POINTE", order: 6 },
    { id: "activeImpCreuse", label: "03-ACTIVE IMP CREUSE", order: 7 },
    { id: "energieActImpTot", label: "04-ENERGIE ACT IMP TOT", order: 4 },
    { id: "energieReactImpHpl", label: "05-ENERGIE REACT IMP HPL", order: 9 },
    { id: "energieReactImpHp", label: "06-ENERGIE REACT IMP HP", order: 10 },
    { id: "energieReactImpHc", label: "07-ENERGIE REACT IMP HC", order: 11 },
    { id: "reactiveImpTotale", label: "08-REACTIVE IMP TOTALE", order: 8 },
    { id: "energieActiveExpHpl", label: "09-ENERGIE ACTIVE EXP HPL", order: 20 },
    { id: "energieActiveExpHp", label: "10-ENERGIE ACTIVE EXP HP", order: 21 },
    { id: "energieActiveExpHc", label: "11-ENERGIE ACTIVE EXP HC", order: 22 },
    { id: "energieActiveExpTot", label: "12-ENERGIE ACTIVE EXP TOT", order: 19 },
    { id: "heuresUtilisationHuc", label: "13-HEURES UTILISATION-HUC", order: 12 },
    { id: "puissActImpHpl", label: "14-PUISS ACT IMP HPL", order: 1 },
    { id: "puissActImpHp", label: "15-PUISS ACT IMP HP", order: 2 },
    { id: "puissActImpHc", label: "16-PUISS ACT IMP HC", order: 3 },
    { id: "energieActiveImpPh1", label: "17-ENERGIE ACTIVE IMP PH1", order: 13 },
    { id: "energieActiveImpPh2", label: "18-ENERGIE ACTIVE IMP PH2", order: 14 },
    { id: "energieActiveImpPh3", label: "19-ENERGIE ACTIVE IMP PH3", order: 15 },
    { id: "energieActiveExpPh1", label: "20-ENERGIE ACTIVE EXP PH1", order: 16 },
    { id: "energieActiveExpPh2", label: "21-ENERGIE ACTIVE EXP PH2", order: 17 },
    { id: "energieActiveExpPh3", label: "22-ENERGIE ACTIVE EXP PH3", order: 18 }
];

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const suggestionsContainer = document.getElementById('suggestions');
const allCustomersSection = document.getElementById('all-customers-section');
const customerDetailSection = document.getElementById('customer-detail-section');
const noResultsElement = document.getElementById('no-results');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const confirmationModal = document.getElementById('confirmation-modal');
const confirmSaveButton = document.getElementById('confirm-save');
const confirmCancelButton = document.getElementById('confirm-cancel');

// Navigation
const navButtons = document.querySelectorAll('.nav-button');
const pages = document.querySelectorAll('.page');

// Import page elements
const fileInput = document.getElementById('file-input');
const importButton = document.getElementById('import-button');
const importStatus = document.getElementById('import-status');
const fileInputLabel = document.querySelector('.file-input-label');
const selectedFileInfo = document.getElementById('selected-file-info');

// History page elements
const historyList = document.getElementById('history-list');

// Export buttons
const exportButton = document.getElementById('export-button');
const exportButton2 = document.getElementById('export-button2');
const exportButton3 = document.getElementById('export-button3');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadCustomers();
    setupEventListeners();
    autoFocusSearch();
    renderAllCustomers();
});

// Set up event listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', handleSearchInput);
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Navigation
    navButtons.forEach(button => {
        if (button.id !== 'export-button' && button.id !== 'export-button2' && button.id !== 'export-button3') {
            button.addEventListener('click', function() {
                const targetPage = this.getAttribute('data-target');
                switchPage(targetPage);
            });
        }
    });
    
    // Export functionality
    exportButton.addEventListener('click', exportData);
    exportButton2.addEventListener('click', exportData);
    exportButton3.addEventListener('click', exportData);
    
    // Import functionality
    importButton.addEventListener('click', handleFileImport);
    
    // File input functionality
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            selectedFileInfo.textContent = `Fichier sélectionné: ${this.files[0].name}`;
            selectedFileInfo.style.display = 'block';
        } else {
            selectedFileInfo.style.display = 'none';
        }
    });
    
    // Drag and drop functionality
    fileInputLabel.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });
    
    fileInputLabel.addEventListener('dragleave', function() {
        this.classList.remove('drag-over');
    });
    
    fileInputLabel.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            selectedFileInfo.textContent = `Fichier déposé: ${e.dataTransfer.files[0].name}`;
            selectedFileInfo.style.display = 'block';
            
            // Trigger change event manually
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
        }
    });
    
    // Modal buttons
    confirmSaveButton.addEventListener('click', saveConsumptionConfirmed);
    confirmCancelButton.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === confirmationModal) {
            closeModal();
        }
    });
}

// Auto-focus search input
function autoFocusSearch() {
    searchInput.focus();
}

// Switch between pages
function switchPage(pageId) {
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    document.getElementById(pageId).classList.add('active');
    
    navButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-target') === pageId) {
            button.classList.add('active');
        }
    });
    
    // Load data for specific pages
    if (pageId === 'history-page') {
        renderHistory();
    } else if (pageId === 'home-page') {
        renderAllCustomers();
    }
}

// Load customers from localStorage
function loadCustomers() {
    // Clear existing data to allow fresh import
    // localStorage.removeItem('electricityCustomers');
    
    const storedCustomers = localStorage.getItem('electricityCustomers');
    if (storedCustomers) {
        customers = JSON.parse(storedCustomers);
    }
}

// Save customers to localStorage
function saveCustomers() {
    localStorage.setItem('electricityCustomers', JSON.stringify(customers));
}

// Render all customers on home page
function renderAllCustomers() {
    if (customers.length === 0) {
        allCustomersSection.innerHTML = '<p>Aucun client disponible. Importez des données depuis la page "Importer".</p>';
        return;
    }
    
    allCustomersSection.innerHTML = customers.map((customer, index) => {
        const lastRecord = customer.records.length > 0 
            ? customer.records[customer.records.length - 1] 
            : null;
            
        return `
            <div class="customer-card-mini" data-index="${index}">
                <h3 class="customer-name-mini">${customer.customerName}</h3>
                <div class="customer-details-mini">
                    <div class="detail-item-mini">
                        <span class="detail-label-mini">Contrat</span>
                        <span class="detail-value-mini">${customer.contractNumber}</span>
                    </div>
                    <div class="detail-item-mini">
                        <span class="detail-label-mini">Appareil</span>
                        <span class="detail-value-mini">${customer.deviceNumber}</span>
                    </div>
                    <div class="detail-item-mini">
                        <span class="detail-label-mini">Téléphone</span>
                        <span class="detail-value-mini">${customer.phoneNumber || 'N/A'}</span>
                    </div>
                    <div class="detail-item-mini">
                        <span class="detail-label-mini">Dernière conso.</span>
                        <span class="detail-value-mini">${lastRecord ? `${lastRecord.kwh} kWh` : 'Aucune'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click events to customer cards
    document.querySelectorAll('.customer-card-mini').forEach(card => {
        card.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            showCustomerDetail(index);
        });
    });
}

// Show customer detail
function showCustomerDetail(index) {
    if (index < 0 || index >= customers.length) return;
    
    currentCustomerIndex = index;
    currentCustomer = customers[index];
    
    allCustomersSection.classList.add('hidden');
    customerDetailSection.classList.remove('hidden');
    
    displayCustomerDetail();
}

// Display customer detail
function displayCustomerDetail() {
    if (!currentCustomer) return;
    
    const lastRecord = currentCustomer.records.length > 0 
        ? currentCustomer.records[currentCustomer.records.length - 1] 
        : null;
    
    // Check if this is a medium voltage client
    const isMediumVoltage = currentCustomer.isMediumVoltage || false;
    
    customerDetailSection.innerHTML = `
        <div class="customer-card">
            <div class="customer-header">
                <h2 class="customer-name">${currentCustomer.customerName}</h2>
                <div class="navigation-buttons">
                    <button class="nav-btn" id="prev-customer">Précédent</button>
                    <button class="nav-btn" id="next-customer">Suivant</button>
                    <button class="nav-btn" id="back-to-list">Retour à la liste</button>
                </div>
            </div>
            
            <div class="customer-details">
                <div class="detail-item">
                    <span class="detail-label">N° de contrat</span>
                    <span class="detail-value">${currentCustomer.contractNumber}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">N° d'appareil</span>
                    <span class="detail-value">${currentCustomer.deviceNumber}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">Téléphone</span>
                    <span class="detail-value">${currentCustomer.phoneNumber || 'Non disponible'}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">Type de client</span>
                    <span class="detail-value">${isMediumVoltage ? 'Moyenne Tension' : 'Basse Tension'}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">Dernière consommation</span>
                    <span class="detail-value">${lastRecord ? `${lastRecord.kwh} kWh (${formatDate(lastRecord.date)})` : 'Aucune donnée'}</span>
                </div>
            </div>
            
            ${currentCustomer.records.length > 0 ? `
            <div class="last-consumption">
                <div class="consumption-title">Historique des consommations</div>
                <div class="history-list">
                    ${currentCustomer.records.slice(-5).reverse().map(record => `
                        <div class="history-entry">
                            <span class="history-date">${formatDate(record.date)}</span>
                            <span class="history-kwh">${record.kwh} kWh</span>
                        </div>
                    `).join('')}
                    ${currentCustomer.records.length > 5 ? `<div style="text-align: center; margin-top: 10px; color: #777;">${currentCustomer.records.length - 5} entrées supplémentaires</div>` : ''}
                </div>
            </div>
            ` : ''}
            
            <div class="consumption-form">
                <h3 class="form-title">Nouvelle consommation</h3>
                ${isMediumVoltage ? `
                    <div class="medium-voltage-fields">
                        <h4>Champs Moyenne Tension</h4>
                        ${mediumVoltageFields.map(field => `
                            <div class="form-group">
                                <label class="form-label" for="${field.id}"><span class="field-number">${field.order}</span> ${field.label}</label>
                                <input type="number" id="${field.id}" class="form-input" placeholder="Entrez la valeur pour ${field.label}" min="0" step="0.01">
                            </div>
                        `).join('')}
                        <div class="form-group">
                            <label class="form-label" for="medium-voltage-date">Date de relevé</label>
                            <input type="date" id="medium-voltage-date" class="form-input" value="${getCurrentDate()}">
                        </div>
                    </div>
                ` : `
                    <div class="form-group">
                        <label class="form-label" for="kwh-input">Consommation (kWh)</label>
                        <input type="number" id="kwh-input" class="form-input" placeholder="Entrez la consommation en kWh" min="0" step="0.1">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="date-input">Date de consommation</label>
                        <input type="date" id="date-input" class="form-input" value="${getCurrentDate()}">
                    </div>
                `}
                
                <button id="save-consumption" class="btn-primary">${isMediumVoltage ? 'Enregistrer les données MT' : 'Enregistrer la consommation'}</button>
            </div>
        </div>
    `;
    
    // Add event listeners for navigation buttons
    document.getElementById('prev-customer').addEventListener('click', function() {
        if (currentCustomerIndex > 0) {
            showCustomerDetail(currentCustomerIndex - 1);
        }
    });
    
    document.getElementById('next-customer').addEventListener('click', function() {
        if (currentCustomerIndex < customers.length - 1) {
            showCustomerDetail(currentCustomerIndex + 1);
        }
    });
    
    document.getElementById('back-to-list').addEventListener('click', function() {
        customerDetailSection.classList.add('hidden');
        allCustomersSection.classList.remove('hidden');
    });
    
    // Add event listener to save button
    document.getElementById('save-consumption').addEventListener('click', function() {
        if (isMediumVoltage) {
            saveMediumVoltageData();
        } else {
            saveStandardConsumption();
        }
    });
}

// Save standard consumption data
function saveStandardConsumption() {
    const kwhInput = document.getElementById('kwh-input');
    const dateInput = document.getElementById('date-input');
    
    const kwh = parseFloat(kwhInput.value);
    const date = dateInput.value;
    
    if (isNaN(kwh) || kwh <= 0) {
        showToast('Veuillez entrer une consommation valide');
        return;
    }
    
    if (!date) {
        showToast('Veuillez sélectionner une date');
        return;
    }
    
    // Check for duplicate date
    const duplicate = currentCustomer.records.some(record => record.date === date);
    if (duplicate) {
        showToast('Une consommation existe déjà pour cette date');
        return;
    }
    
    // Show confirmation modal
    openModal(kwh, date);
}

// Save medium voltage data
function saveMediumVoltageData() {
    const dateInput = document.getElementById('medium-voltage-date');
    const date = dateInput.value;
    
    if (!date) {
        showToast('Veuillez sélectionner une date');
        return;
    }
    
    // Collect all medium voltage field values
    const mediumVoltageData = {};
    let hasValidData = false;
    
    for (const field of mediumVoltageFields) {
        const input = document.getElementById(field.id);
        const value = parseFloat(input.value);
        
        if (!isNaN(value) && value >= 0) {
            mediumVoltageData[field.id] = value;
            hasValidData = true;
        } else {
            mediumVoltageData[field.id] = null;
        }
    }
    
    if (!hasValidData) {
        showToast('Veuillez entrer au moins une valeur valide');
        return;
    }
    
    // Check for duplicate date
    const duplicate = currentCustomer.records.some(record => record.date === date);
    if (duplicate) {
        showToast('Des données existent déjà pour cette date');
        return;
    }
    
    // Show confirmation modal for medium voltage data
    openMediumVoltageModal(mediumVoltageData, date);
}

// Open confirmation modal for standard consumption
function openModal(kwh, date) {
    document.getElementById('confirmation-modal').innerHTML = `
        <div class="modal-content">
            <h3>Confirmer l'enregistrement</h3>
            <p>Voulez-vous vraiment enregistrer une consommation de <strong>${kwh} kWh</strong> pour le <strong>${formatDate(date)}</strong> ?</p>
            <div class="modal-buttons">
                <button id="confirm-cancel" class="btn-secondary">Annuler</button>
                <button id="confirm-save" class="btn-primary">Enregistrer</button>
            </div>
        </div>
    `;
    
    document.getElementById('confirmation-modal').classList.remove('hidden');
    
    // Reattach event listeners
    document.getElementById('confirm-save').addEventListener('click', () => saveConsumptionConfirmed(kwh, date));
    document.getElementById('confirm-cancel').addEventListener('click', closeModal);
}

// Open confirmation modal for medium voltage data
function openMediumVoltageModal(data, date) {
    document.getElementById('confirmation-modal').innerHTML = `
        <div class="modal-content">
            <h3>Confirmer l'enregistrement</h3>
            <p>Voulez-vous vraiment enregistrer les données de moyenne tension pour le <strong>${formatDate(date)}</strong> ?</p>
            <div class="modal-buttons">
                <button id="confirm-cancel" class="btn-secondary">Annuler</button>
                <button id="confirm-save" class="btn-primary">Enregistrer</button>
            </div>
        </div>
    `;
    
    document.getElementById('confirmation-modal').classList.remove('hidden');
    
    // Reattach event listeners
    document.getElementById('confirm-save').addEventListener('click', () => saveMediumVoltageConfirmed(data, date));
    document.getElementById('confirm-cancel').addEventListener('click', closeModal);
}

// Close modal
function closeModal() {
    document.getElementById('confirmation-modal').classList.add('hidden');
}

// Save consumption after confirmation
function saveConsumptionConfirmed(kwh, date) {
    if (!currentCustomer) return;
    
    // Add new record
    currentCustomer.records.push({
        date: date,
        kwh: kwh
    });
    
    // Sort records by date
    currentCustomer.records.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Update customer in the main array
    customers[currentCustomerIndex] = currentCustomer;
    
    // Save to localStorage
    saveCustomers();
    
    // Update display
    displayCustomerDetail();
    
    // Close modal and show success message
    closeModal();
    showToast('Consommation enregistrée avec succès!');
}

// Save medium voltage data after confirmation
function saveMediumVoltageConfirmed(data, date) {
    if (!currentCustomer) return;
    
    // Add new record with medium voltage data
    currentCustomer.records.push({
        date: date,
        isMediumVoltage: true,
        ...data
    });
    
    // Sort records by date
    currentCustomer.records.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Update customer in the main array
    customers[currentCustomerIndex] = currentCustomer;
    
    // Save to localStorage
    saveCustomers();
    
    // Update display
    displayCustomerDetail();
    
    // Close modal and show success message
    closeModal();
    showToast('Données de moyenne tension enregistrées avec succès!');
}

// Handle search input with autocomplete
function handleSearchInput() {
    const query = searchInput.value.trim().toLowerCase();
    
    if (query.length === 0) {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.classList.add('hidden');
        return;
    }
    
    const suggestions = customers.filter(customer => 
        customer.contractNumber.toLowerCase().includes(query) ||
        customer.deviceNumber.toLowerCase().includes(query) ||
        customer.customerName.toLowerCase().includes(query) ||
        (customer.phoneNumber && customer.phoneNumber.toLowerCase().includes(query))
    ).slice(0, 5); // Limit to 5 suggestions
    
    renderSuggestions(suggestions, query);
}

// Render autocomplete suggestions
function renderSuggestions(suggestions, query) {
    if (suggestions.length === 0) {
        suggestionsContainer.innerHTML = '<div class="suggestion-item">Aucun résultat trouvé</div>';
        suggestionsContainer.classList.remove('hidden');
        return;
    }
    
    suggestionsContainer.innerHTML = suggestions.map(customer => {
        const highlightMatch = (text) => {
            if (!query) return text;
            const regex = new RegExp(`(${query})`, 'gi');
            return text.replace(regex, '<span class="suggestion-highlight">$1</span>');
        };
        
        return `
            <div class="suggestion-item" data-id="${customer.contractNumber}">
                <div>${highlightMatch(customer.customerName)}</div>
                <small>${highlightMatch(customer.contractNumber)} | ${highlightMatch(customer.deviceNumber)}</small>
            </div>
        `;
    }).join('');
    
    suggestionsContainer.classList.remove('hidden');
    
    // Add click events to suggestions
    document.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function() {
            const customerId = this.getAttribute('data-id');
            const customer = customers.find(c => c.contractNumber === customerId);
            if (customer) {
                const index = customers.indexOf(customer);
                showCustomerDetail(index);
                suggestionsContainer.classList.add('hidden');
                searchInput.value = '';
            }
        });
    });
}

// Perform search
function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    
    if (query.length === 0) {
        showToast('Veuillez entrer un terme de recherche');
        return;
    }
    
    const foundCustomer = customers.find(customer => 
        customer.contractNumber.toLowerCase().includes(query) ||
        customer.deviceNumber.toLowerCase().includes(query) ||
        customer.customerName.toLowerCase().includes(query) ||
        (customer.phoneNumber && customer.phoneNumber.toLowerCase().includes(query))
    );
    
    if (foundCustomer) {
        const index = customers.indexOf(foundCustomer);
        showCustomerDetail(index);
        noResultsElement.classList.add('hidden');
        suggestionsContainer.classList.add('hidden');
    } else {
        customerDetailSection.classList.add('hidden');
        allCustomersSection.classList.add('hidden');
        noResultsElement.classList.remove('hidden');
        suggestionsContainer.classList.add('hidden');
    }
    
    searchInput.blur();
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Handle file import
function handleFileImport() {
    const file = fileInput.files[0];
    
    if (!file) {
        showImportStatus('Veuillez sélectionner un fichier', 'error');
        return;
    }
    
    const fileType = file.name.split('.').pop().toLowerCase();
    
    if (fileType === 'csv') {
        parseCSV(file);
    } else if (fileType === 'xlsx' || fileType === 'xls') {
        parseExcel(file);
    } else {
        showImportStatus('Format de fichier non supporté. Veuillez utiliser CSV ou Excel.', 'error');
    }
}

// Parse CSV file
function parseCSV(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n');
            
            if (lines.length < 2) {
                showImportStatus('Fichier CSV invalide', 'error');
                return;
            }
            
            // Assuming first line is header
            const headers = lines[0].split(',').map(h => h.trim());
            
            // Find required columns (we'll be flexible with naming)
            const contractCol = headers.findIndex(h => 
                h.toLowerCase().includes('contrat') || 
                h.toLowerCase().includes('contract'));
                
            const deviceCol = headers.findIndex(h => 
                h.toLowerCase().includes('appareil') || 
                h.toLowerCase().includes('device'));
                
            const nameCol = headers.findIndex(h => 
                h.toLowerCase().includes('nom') || 
                h.toLowerCase().includes('name'));
                
            const phoneCol = headers.findIndex(h => 
                h.toLowerCase().includes('telephone') || 
                h.toLowerCase().includes('phone'));
                
            // Look for service column that indicates tension type
            const serviceCol = headers.findIndex(h => 
                h.toLowerCase().includes('service'));
            
            if (contractCol === -1 || deviceCol === -1 || nameCol === -1) {
                showImportStatus('Colonnes requises manquantes dans le CSV', 'error');
                return;
            }
            
            const newCustomers = [];
            
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                
                if (values.length < Math.max(contractCol, deviceCol, nameCol) + 1) continue;
                
                const contractNumber = values[contractCol];
                const deviceNumber = values[deviceCol];
                const customerName = values[nameCol];
                const phoneNumber = phoneCol !== -1 ? values[phoneCol] : '';
                
                // Check if this is a medium voltage client based on service column
                let isMediumVoltage = false;
                if (serviceCol !== -1 && values[serviceCol]) {
                    const serviceValue = values[serviceCol].toLowerCase();
                    isMediumVoltage = serviceValue.includes('moyenne') || serviceValue.includes('medium');
                }
                
                // Skip if required fields are empty
                if (!contractNumber || !deviceNumber || !customerName) continue;
                
                // Check if customer already exists
                const existingCustomer = customers.find(c => c.contractNumber === contractNumber);
                
                if (!existingCustomer) {
                    newCustomers.push({
                        contractNumber,
                        deviceNumber,
                        customerName,
                        phoneNumber,
                        isMediumVoltage,
                        records: []
                    });
                }
            }
            
            // Add new customers to existing ones
            customers = [...customers, ...newCustomers];
            saveCustomers();
            
            showImportStatus(`${newCustomers.length} clients importés avec succès`, 'success');
            fileInput.value = ''; // Clear file input
            
            // Refresh the customer list
            renderAllCustomers();
            
        } catch (error) {
            console.error('Error parsing CSV:', error);
            showImportStatus('Erreur lors de la lecture du fichier CSV', 'error');
        }
    };
    
    reader.onerror = function() {
        showImportStatus('Erreur lors de la lecture du fichier', 'error');
    };
    
    reader.readAsText(file, 'utf-8');
}

// Parse Excel file (simplified - assumes first sheet)
function parseExcel(file) {
    showImportStatus('Le traitement des fichiers Excel n\'est pas encore implémenté dans cette version. Veuillez utiliser un fichier CSV.', 'error');
    // In a full implementation, we would use a library like SheetJS here
}

// Show import status message
function showImportStatus(message, type) {
    importStatus.textContent = message;
    importStatus.className = `status-${type}`;
}

// Render history page
function renderHistory() {
    if (customers.length === 0) {
        historyList.innerHTML = '<p>Aucune donnée disponible. Importez d\'abord des clients.</p>';
        return;
    }
    
    // Collect all records with customer info
    const allRecords = [];
    
    customers.forEach(customer => {
        customer.records.forEach(record => {
            allRecords.push({
                ...record,
                customerName: customer.customerName,
                contractNumber: customer.contractNumber,
                isMediumVoltage: customer.isMediumVoltage || false
            });
        });
    });
    
    // Sort by date descending
    allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (allRecords.length === 0) {
        historyList.innerHTML = '<p>Aucune consommation enregistrée.</p>';
        return;
    }
    
    historyList.innerHTML = allRecords.map(record => `
        <div class="history-entry">
            <div>
                <div class="history-date">${formatDate(record.date)}</div>
                <small>${record.customerName} (${record.contractNumber}) ${record.isMediumVoltage ? '(MT)' : ''}</small>
            </div>
            ${record.kwh ? 
                `<span class="history-kwh">${record.kwh} kWh</span>` : 
                `<span class="history-kwh">Données MT</span>`}
        </div>
    `).join('');
}

// Export data to CSV
function exportData() {
    if (customers.length === 0) {
        showToast('Aucune donnée à exporter');
        return;
    }
    
    // Create CSV content with horizontal parameter layout
    let csvContent = "";
    
    // Add header row
    csvContent += "N° Client,N° de contrat,N° d'appareil,Nétiquettes\n";
    
    // Process each customer
    customers.forEach((customer, customerIndex) => {
        // If customer has no records, add one row with client info only
        if (customer.records.length === 0) {
            csvContent += `${customerIndex + 1},${customer.contractNumber},${customer.deviceNumber},\n`;
        } else {
            // For each record, create rows with parameters stacked vertically
            customer.records.forEach((record, recordIndex) => {
                // Add client info with date
                csvContent += `${customerIndex + 1},${customer.contractNumber},${customer.deviceNumber},${record.date}\n`;
                
                // Add all medium voltage parameters as separate rows under the same client
                if (customer.isMediumVoltage && record.isMediumVoltage) {
                    // Add each parameter as a separate row
                    csvContent += `,,"",01-ACTIVE IMP PLEINE,${record.activeImpPleine || ''}\n`;
                    csvContent += `,,"",02-ACTIVE IMP POINTE,${record.activeImpPointe || ''}\n`;
                    csvContent += `,,"",03-ACTIVE IMP CREUSE,${record.activeImpCreuse || ''}\n`;
                    csvContent += `,,"",04-ENERGIE ACT IMP TOT,${record.energieActImpTot || ''}\n`;
                    csvContent += `,,"",05-ENERGIE REACT IMP HPL,${record.energieReactImpHpl || ''}\n`;
                    csvContent += `,,"",06-ENERGIE REACT IMP HP,${record.energieReactImpHp || ''}\n`;
                    csvContent += `,,"",07-ENERGIE REACT IMP HC,${record.energieReactImpHc || ''}\n`;
                    csvContent += `,,"",08-REACTIVE IMP TOTALE,${record.reactiveImpTotale || ''}\n`;
                    csvContent += `,,"",09-ENERGIE ACTIVE EXP HPL,${record.energieActiveExpHpl || ''}\n`;
                    csvContent += `,,"",10-ENERGIE ACTIVE EXP HP,${record.energieActiveExpHp || ''}\n`;
                    csvContent += `,,"",11-ENERGIE ACTIVE EXP HC,${record.energieActiveExpHc || ''}\n`;
                    csvContent += `,,"",12-ENERGIE ACTIVE EXP TOT,${record.energieActiveExpTot || ''}\n`;
                    csvContent += `,,"",13-HEURES UTILISATION-HUC,${record.heuresUtilisationHuc || ''}\n`;
                    csvContent += `,,"",14-PUISS ACT IMP HPL,${record.puissActImpHpl || ''}\n`;
                    csvContent += `,,"",15-PUISS ACT IMP HP,${record.puissActImpHp || ''}\n`;
                    csvContent += `,,"",16-PUISS ACT IMP HC,${record.puissActImpHc || ''}\n`;
                    csvContent += `,,"",17-ENERGIE ACTIVE IMP PH1,${record.energieActiveImpPh1 || ''}\n`;
                    csvContent += `,,"",18-ENERGIE ACTIVE IMP PH2,${record.energieActiveImpPh2 || ''}\n`;
                    csvContent += `,,"",19-ENERGIE ACTIVE IMP PH3,${record.energieActiveImpPh3 || ''}\n`;
                    csvContent += `,,"",20-ENERGIE ACTIVE EXP PH1,${record.energieActiveExpPh1 || ''}\n`;
                    csvContent += `,,"",21-ENERGIE ACTIVE EXP PH2,${record.energieActiveExpPh2 || ''}\n`;
                    csvContent += `,,"",22-ENERGIE ACTIVE EXP PH3,${record.energieActiveExpPh3 || ''}\n`;
                } else {
                    // For standard clients, just add the kWh consumption
                    csvContent += `,,"",Consommation (kWh),${record.kwh || ''}\n`;
                }
                
                // Add blank row separator
                csvContent += ",,,,\n";
            });
        }
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'rapport_consommation_parametres.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Rapport exporté avec succès!');
}

// Show toast notification
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 3000);
}

// Sample data for initial testing
function createSampleData() {
    if (customers.length === 0) {
        customers = [
            {
                contractNumber: "CT001",
                deviceNumber: "DV001",
                customerName: "Jean Dupont",
                phoneNumber: "0123456789",
                isMediumVoltage: false,
                records: [
                    { date: "2025-01-15", kwh: 120 },
                    { date: "2025-02-15", kwh: 135 }
                ]
            },
            {
                contractNumber: "CT002",
                deviceNumber: "DV002",
                customerName: "Marie Martin",
                phoneNumber: "0987654321",
                isMediumVoltage: true,
                records: [
                    { 
                        date: "2025-01-20", 
                        isMediumVoltage: true,
                        activeImpPleine: 150.5,
                        activeImpPointe: 200.3,
                        activeImpCreuse: 180.7,
                        energieActImpTot: 450.7,
                        energieReactImpHpl: 45.2,
                        energieReactImpHp: 38.9,
                        energieReactImpHc: 32.1,
                        reactiveImpTotale: 116.2,
                        energieActiveExpHpl: 0,
                        energieActiveExpHp: 0,
                        energieActiveExpHc: 0,
                        energieActiveExpTot: 0,
                        heuresUtilisationHuc: 680,
                        puissActImpHpl: 45.5,
                        puissActImpHp: 52.3,
                        puissActImpHc: 38.7,
                        energieActiveImpPh1: 145.8,
                        energieActiveImpPh2: 152.3,
                        energieActiveImpPh3: 152.6,
                        energieActiveExpPh1: 0,
                        energieActiveExpPh2: 0,
                        energieActiveExpPh3: 0
                    }
                ]
            },
            {
                contractNumber: "CT003",
                deviceNumber: "DV003",
                customerName: "Pierre Durand",
                phoneNumber: "",
                isMediumVoltage: false,
                records: []
            }
        ];
        saveCustomers();
        renderAllCustomers();
    }
}

// Uncomment the line below to create sample data for testing
// createSampleData();