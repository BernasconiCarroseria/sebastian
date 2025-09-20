// Se ejecuta cuando la página se carga
window.onload = function() {
    updateDisplay();
};

// Función principal para actualizar toda la pantalla
function updateDisplay() {
    displayTankStatus();
    displayTrips();
}

// Obtiene los datos guardados del celular (o crea datos nuevos si no existen)
function getAppData() {
    const defaultData = {
        tank: {
            liters: 0,
            totalCost: 0
        },
        trips: []
    };
    const data = localStorage.getItem('truckAppData');
    return data ? JSON.parse(data) : defaultData;
}

// Guarda los datos en el celular
function saveAppData(data) {
    localStorage.setItem('truckAppData', JSON.stringify(data));
}

// --- LÓGICA DEL TANQUE DE GASOIL ---

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

function displayTankStatus() {
    const { tank } = getAppData();
    const statusDiv = document.getElementById('tank-status');
    
    // Calcula el costo promedio por litro. Si no hay litros, el costo es 0.
    const averagePrice = tank.liters > 0 ? (tank.totalCost / tank.liters) : 0;

    statusDiv.innerHTML = `
        <div class="status-item">
            <span class="liters">${tank.liters.toFixed(1)} L</span>
            Litros Restantes
        </div>
        <div class="status-item">
            <span class="price">$${averagePrice.toFixed(2)}</span>
            Costo Promedio / Litro
        </div>
    `;
}

// --- LÓGICA DE LOS VIAJES ---

function addTrip() {
    const appData = getAppData();
    const averagePrice = appData.tank.liters > 0 ? (appData.tank.totalCost / appData.tank.liters) : 0;

    // Obtener valores del formulario
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
    
    // Calcular el costo del combustible para este viaje
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
    
    // Actualizar el estado del tanque
    appData.tank.liters -= litersUsed;
    appData.tank.totalCost -= tripFuelCost; // Se resta el costo para mantener el promedio correcto
    
    // Añadir el viaje al historial
    appData.trips.unshift(trip);
    
    saveAppData(appData);
    updateDisplay();
    document.getElementById('trip-form').reset();
}

function displayTrips() {
    const { trips } = getAppData();
    const historyDiv = document.getElementById('trip-history');
    historyDiv.innerHTML = '';

    if (trips.length === 0) {
        historyDiv.innerHTML = '<p id="no-trips-message">Todavía no has guardado ningún viaje.</p>';
        return;
    }

    trips.forEach(trip => {
        const profitClass = trip.profit >= 0 ? 'ganancia' : 'perdida';
        const tripElement = document.createElement('div');
        tripElement.className = 'trip-item';
        
        tripElement.innerHTML = `
            <div class="trip-details">
                <span class="destination">${trip.dest}</span>
                <span class="date-code">${trip.date} - ${trip.litersUsed.toFixed(1)} Lts consumidos</span>
            </div>
            <div class="trip-result ${profitClass}">
                $${trip.profit.toFixed(2)}
            </div>
        `;
        historyDiv.appendChild(tripElement);
    });
}