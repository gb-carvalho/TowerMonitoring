const grid = document.getElementById('grid');
let towers = [];


document.getElementById('addTower').addEventListener('click', showAddTowerForm);

function showAddTowerForm() {
    // Verifica se já existe um formulário aberto e remove, se necessário
    const existingForm = document.querySelector('.add-tower-form');
    if (existingForm) {
        existingForm.remove();
    }

    const form = document.createElement('form');
    form.classList.add('tower');
    form.classList.add('add-tower-form');
    form.innerHTML = `
        <input type="text" name="name" placeholder="Nome da Torre" required>
        <select name="type" required>
            <option value="autoportante">Autoportante</option>
            <option value="estaiada">Estaiada</option>
        </select>
        <select name="status" required>
            <option value="liberada">Liberada</option>
            <option value="embargada">Embargada</option>
            <option value="judicial_s_liminar">Judicial sem limiar</option>
            <option value="judicial_c_liminar">Judicial com limiar</option>
        </select>
        <button type="submit">Adicionar</button>
    `;
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const name = form.name.value;
        const type = form.type.value;
        const status = form.status.value;
        addTower(name, type, status);
        form.remove(); // Remove o formulário após adicionar a torre
    });

    grid.appendChild(form);
}


function showEditTowerForm(towerElement, tower) {
    const form = document.createElement('form');
    form.classList.add('tower');
    form.classList.add('add-tower-form');
    form.innerHTML = `
        <input type="text" name="name" placeholder="Nome da Torre" value="${tower.name}" required>
        <select name="type" required>
            <option value="autoportante" ${tower.type === 'autoportante' ? 'selected' : ''}>Autoportante</option>
            <option value="estaiada" ${tower.type === 'estaiada' ? 'selected' : ''}>Estaiada</option>
        </select>
        <select name="status" required>
            <option value="liberada" ${tower.status === 'liberada' ? 'selected' : ''}>Liberada</option>
            <option value="embargada" ${tower.status === 'embargada' ? 'selected' : ''}>Embargada</option>
            <option value="judicial_s_liminar" ${tower.status === 'judicial_s_liminar' ? 'selected' : ''}>Judicial sem limiar</option>
            <option value="judicial_c_liminar" ${tower.status === 'judicial_c_liminar' ? 'selected' : ''}>Judicial com limiar</option>
        </select>
        <button type="submit">Salvar</button>
    `;

    // Substituir o card da torre pelo formulário
    grid.replaceChild(form, towerElement);

    // Manipulador de eventos para processar a edição
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        editTower(form, tower, towerElement);
    });
}

function isNameTaken(newName, excludeName = '') {
    return towers.some(tower => tower.name === newName && tower.name !== excludeName);
}

function createTowerElement(name, type, status, replaceElement = null) {
    const towerElement = document.createElement('div');
    towerElement.classList.add('tower');
    towerElement.dataset.name = name;
    towerElement.innerHTML = `
        <img src="${type === 'autoportante' ? 'autoportante.jpeg' : 'estaiada.jpeg'}">
        <span class="status ${status}">${name}</span>
        <button class="delete">X</button>
        <button class="edit">?</button>
    `;
    const deleteButton = towerElement.querySelector('.delete');
    deleteButton.addEventListener('click', () => deleteTower(name));
    const editButton = towerElement.querySelector('.edit');
    editButton.addEventListener('click', () => {
        const tower = towers.find(t => t.name === name);
        if (tower) {
            showEditTowerForm(towerElement, tower);
        }
    });

    // Substituir elemento ou adicionar ao grid
    if (replaceElement) {
        replaceElement.replaceWith(towerElement);
         updateGrid();
    } else {
        grid.appendChild(towerElement);
    }
}

function addTower(name, type, status) {
    if (isNameTaken(name)) {
        alert('Erro: Já existe uma torre com esse nome.');
        return;
    }

    towers.push({ name, type, status });
    updateGrid();
}

function deleteTower(name) {
    // Encontra a torre pelo nome e remove do array
    towers = towers.filter(tower => tower.name !== name);
    updateGrid();
}

function editTower(form, originalTower, towerElement) {
    const updatedName = form.name.value;
    const updatedType = form.type.value;
    const updatedStatus = form.status.value;

    if (isNameTaken(updatedName, originalTower.name)) {
        alert('Erro: Já existe uma torre com esse nome.');
        return;
    }

    // Atualiza os dados da torre
    originalTower.name = updatedName;
    originalTower.type = updatedType;
    originalTower.status = updatedStatus;

    // Atualiza o grid com as novas informações
    createTowerElement(originalTower.name, originalTower.type, originalTower.status, towerElement);
}

function updateGrid() {
    grid.innerHTML = '';
    towers.forEach((tower, id) => createTowerElement(tower.name, tower.type, tower.status));
}

document.getElementById('saveTowers').addEventListener('click', () => {
    console.log(towers);
    const csvContent = "data:text/csv;charset=utf-8," + towers.map(tower => `${tower.name},${tower.type},${tower.status}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "torres.csv");
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
});


document.getElementById('loadTowers').addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        processCSV(text);
    };
    reader.readAsText(file);
});

function processCSV(csvText) {
    // Limpa as torres existentes
    towers = [];
    updateGrid();

    const lines = csvText.trim().split("\n");
    lines.forEach(line => {
        const [name, type, status] = line.split(",");
        addTower(name, type, status);
    });
}