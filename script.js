// Se ejecuta cuando la página se carga
window.onload = function() {
    updateDisplay();
};

// Función principal para actualizar toda la pantalla
function updateDisplay() {
    displayTankStatus();
    displayTrips(); // Llama a displayTrips sin argumentos para mostrar todo
}

// Obtiene los datos guardados del celular
function getAppData() {
    const defaultData = {
        tank: { liters: 0, totalCost: 0 },
        trips: []
    };
    const data = localStorage.getItem('truckAppData');
    return data ? JSON.parse(data) : defaultData;
}

// Guarda los datos en el celular
function saveAppData(data) {
    localStorage.setItem('truckAppData', JSON.stringify(data));
}

// Lógica del tanque de gasoil
function addFuel() {
    const litersAdded = parseFloat(document.getElementById('liters-added').value);
    const totalCost = parseFloat(document.getElementById('total-cost').value);
    if (isNaN(litersAdded) || isNaN(totalCost) || litersAdded <= 0 || totalCost <= 0) {
        alert('Por favor, ingresa valores válidos para los litros y el costo.');
        return;
    }
    const appData = getAppData();
    appData.tank.liters += litersAdded;
    appData.tank.totalCost += totalCost;
    saveAppData(appData);
    updateDisplay();
    document.getElementById('fuel-form').reset();
}

// Lógica del estado del tanque
function displayTankStatus() {
    const { tank } = getAppData();
    const statusDiv = document.getElementById('tank-status');
    const averagePrice = tank.liters > 0 ? (tank.totalCost / tank.liters) : 0;
    statusDiv.innerHTML = `
        <div class="status-item">
            <span class="liters">${tank.liters.toFixed(1)} L</span> Litros Restantes
        </div>
        <div class="status-item">
            <span class="price">$${averagePrice.toFixed(2)}</span> Costo Promedio / Litro
        </div>
    `;
}

// Lógica de los viajes
function addTrip() {
    const appData = getAppData();
    const averagePrice = appData.tank.liters > 0 ? (appData.tank.totalCost / appData.tank.liters) : 0;
    const serialCode = document.getElementById('serial-code').value;
    const destination = document.getElementById('destination').value;
    const litersUsed = parseFloat(document.getElementById('liters-used').value);
    const tripValue = parseFloat(document.getElementById('trip-value').value);
    if (!serialCode || !destination || isNaN(litersUsed) || isNaN(tripValue)) {
        alert('Completa todos los campos del viaje.');
        return;
    }
    if (litersUsed > appData.tank.liters) {
        alert('Error: No tienes suficientes litros en el tanque para este viaje.');
        return;
    }
    const tripFuelCost = litersUsed * averagePrice;
    const profit = tripValue - tripFuelCost;
    const trip = {
        id: Date.now(),
        serial: serialCode,
        dest: destination,
        value: tripValue,
        litersUsed: litersUsed,
        fuelCost: tripFuelCost,
        profit: profit,
        date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };
    appData.tank.liters -= litersUsed;
    appData.tank.totalCost -= tripFuelCost;
    appData.trips.unshift(trip);
    saveAppData(appData);
    updateDisplay();
    document.getElementById('trip-form').reset();
    document.getElementById('search-bar').value = ''; // Limpia el buscador
}

// Función de búsqueda
function searchTrips() {
    const searchTerm = document.getElementById('search-bar').value;
    displayTrips(searchTerm);
}

// Función de mostrar viajes
function displayTrips(searchTerm = '') { 
    const { trips } = getAppData();
    const historyDiv = document.getElementById('trip-history');
    historyDiv.innerHTML = '';

    const filteredTrips = trips.filter(trip => {
        return trip.serial.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (filteredTrips.length === 0) {
        historyDiv.innerHTML = '<p id="no-trips-message">No se encontraron viajes.</p>';
        return;
    }

    filteredTrips.forEach(trip => {
        const profitClass = trip.profit >= 0 ? 'ganancia' : 'perdida';
        const tripElement = document.createElement('div');
        tripElement.className = 'trip-item';
        
        tripElement.innerHTML = `
            <div class="trip-details">
                <span class="destination">${trip.dest}</span>
                <span class="date-code"><b>${trip.date}</b> - Cód: ${trip.serial}</span>
            </div>
            <div class="trip-result ${profitClass}">
                $${trip.profit.toFixed(2)}
            </div>
        `;
        historyDiv.appendChild(tripElement);
    });
}
