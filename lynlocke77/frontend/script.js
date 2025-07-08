// ==========================================
// LYNLOCKE JS - CLEAN VERSION
// This code manages team selection, matchups, and basic UI for the Lynlocke app
// ==========================================

// ------------------------
// GLOBALS & STATE
// ------------------------

let players = [];
let currentData = [];
let isEditing = false;
let selectedPokemon = { player1: null, player2: null };

// ------------------------
// UTILITY FUNCTIONS
// ------------------------

// Status Messages
function showStatusMessage(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.className = `status-message ${type} show`;
        setTimeout(() => statusDiv.classList.remove('show'), 3000);
    }
}

// Check sorting mode
function isAdvancedMode() {
    const advRadio = document.querySelector('input[name="sortingMode"][value="advanced"]');
    return advRadio && advRadio.checked;
}

function applyCurrentSorting() {
    if (isAdvancedMode()) {
        applyAdvancedSorting();
    } else {
        applySimplifiedSorting();
    }
}

// ------------------------
// MODAL HANDLING
// ------------------------

function openAddPlayerModal() {
    const modal = document.getElementById('addPlayerModal');
    if (modal) {
        modal.style.display = 'block';
        const firstInput = document.getElementById('playerName');
        if (firstInput) setTimeout(() => firstInput.focus(), 100);
    }
}

function closeAddPlayerModal() {
    const modal = document.getElementById('addPlayerModal');
    if (modal) {
        modal.style.display = 'none';
        const form = document.getElementById('addPlayerForm');
        if (form) form.reset();
    }
}

function openDeleteConfirmModal() {
    document.getElementById('deleteConfirmModal').style.display = 'block';
}

function closeDeleteConfirmModal() {
    document.getElementById('deleteConfirmModal').style.display = 'none';
}

// ------------------------
// DATA VALIDATION
// ------------------------

function validatePlayerData(playerData) {
    if (!playerData.name || playerData.name.length === 0) {
        showStatusMessage('Player name is required!', 'error');
        return false;
    }
    if (playerData.name.length > 20) {
        showStatusMessage('Player name must be 20 characters or less!', 'error');
        return false;
    }
    if (!playerData.Type1) {
        showStatusMessage('Primary type is required!', 'error');
        return false;
    }
    if (!playerData.DexNum || isNaN(playerData.DexNum)) {
        showStatusMessage('Player number is required!', 'error');
        return false;
    }
    if (playerData.DexNum < 1 || playerData.DexNum > 9999) {
        showStatusMessage('Player number must be between 1 and 9999!', 'error');
        return false;
    }
    if (players.some(player => player.DexNum === playerData.DexNum)) {
        showStatusMessage('Player number already exists!', 'error');
        return false;
    }
    if (playerData.Extra && playerData.Extra.length > 20) {
        showStatusMessage('Extra field must be 20 characters or less!', 'error');
        return false;
    }
    return true;
}

// ------------------------
// TEAM & MATCHUP TABLES
// ------------------------
// FIXED TABLE ROW GENERATION AND HIGHLIGHTING
// ===========================================

// ------------------------
// STANDARDIZED ROW CREATION
// ------------------------

// Standardized function to create table rows with consistent structure
function createStandardTableRow(pokemon) {
    const row = document.createElement('div');
    row.className = 'table-row pokemon-row';
    
    // Normalize data properties
    const normalizedData = {
        name: pokemon.name || pokemon.Name || '',
        type1: pokemon.Type1 || pokemon.type1 || '',
        type2: pokemon.Type2 || pokemon.type2 || '',
        dexNum: pokemon.DexNum || pokemon.dexNum || ''
    };
    
    // Store data as attributes for easy access
    row.dataset.name = normalizedData.name;
    row.dataset.type1 = normalizedData.type1;
    row.dataset.type2 = normalizedData.type2;
    row.dataset.dexNum = normalizedData.dexNum;
    
    // Create cell structure
    row.innerHTML = `
        <div class="cell-name">${normalizedData.name}</div>
        <div class="cell-type1">${normalizedData.type1}</div>
        <div class="cell-type2">${normalizedData.type2}</div>
        <div class="cell-dex">${String(normalizedData.dexNum).padStart(4, '0')}</div>
    `;
    
    return row;
}

// Improved function to extract data from any row format
function extractRowData(row) {
    // Skip header rows
    if (row.classList.contains('table-header') || row.classList.contains('team-header')) {
        return null;
    }
    
    // First try to get data from dataset (preferred method)
    if (row.dataset.name) {
        return {
            name: row.dataset.name,
            type1: row.dataset.type1,
            type2: row.dataset.type2,
            dexNum: row.dataset.dexNum
        };
    }
    
    // Fallback: try to parse from text content
    const cells = row.querySelectorAll('.cell-name, .cell-type1, .cell-type2, .cell-dex');
    if (cells.length === 4) {
        return {
            name: cells[0].textContent.trim(),
            type1: cells[1].textContent.trim(),
            type2: cells[2].textContent.trim(),
            dexNum: cells[3].textContent.trim()
        };
    }
    
    // Last resort: split by pipe separator
    const parts = row.textContent.split('|').map(s => s.trim());
    if (parts.length >= 4) {
        return {
            name: parts[0],
            type1: parts[1],
            type2: parts[2],
            dexNum: parts[3]
        };
    }
    
    return null;
}

// ------------------------
// IMPROVED TEAM TABLE MANAGEMENT
// ------------------------

function updateTeamTable(teamNumber, pokemonData) {
    const teamContainer = document.querySelector(`.player${teamNumber}-team .team-rows`);
    if (!teamContainer) return false;
    
    // Count existing Pokemon rows (exclude header)
    const currentRows = teamContainer.querySelectorAll('.pokemon-row');
    if (currentRows.length >= 6) {
        showStatusMessage('Team is full! Maximum 6 Pokemon allowed.', 'error');
        return false;
    }
    
    // Create standardized row
    const newRow = createStandardTableRow(pokemonData);
    teamContainer.appendChild(newRow);
    
    return true;
}

// Improved team data collection
function collectTeamData(teamNumber) {
    const teamRows = document.querySelectorAll(`.player${teamNumber}-team .pokemon-row`);
    const teamData = [];
    
    teamRows.forEach(row => {
        const data = extractRowData(row);
        if (data) {
            teamData.push({
                TeamNumber: String(teamNumber),
                Name: data.name,
                Type1: data.type1,
                Type2: data.type2,
                DexNum: data.dexNum,
                Extra: ''
            });
        }
    });
    
    return teamData;
}


// Improved matchup data collection
function collectMatchupsData() {
    const matchupRows = document.querySelectorAll('.matchup-rows .matchup-row');
    const matchupsData = [];
    
    matchupRows.forEach(row => {
        // Try to get data from dataset first
        if (row.dataset.p1Name) {
            matchupsData.push({
                P1Dex: row.dataset.p1Dex,
                P1Type2: row.dataset.p1Type2,
                P1Type1: row.dataset.p1Type1,
                P1Name: row.dataset.p1Name,
                P2Name: row.dataset.p2Name,
                P2Type1: row.dataset.p2Type1,
                P2Type2: row.dataset.p2Type2,
                P2Dex: row.dataset.p2Dex
            });
        } else {
            // Fallback to cell parsing
            const cells = row.querySelectorAll('.matchup-cell');
            if (cells.length === 8) {
                matchupsData.push({
                    P1Dex: cells[0].textContent,
                    P1Type2: cells[1].textContent,
                    P1Type1: cells[2].textContent,
                    P1Name: cells[3].textContent,
                    P2Name: cells[4].textContent,
                    P2Type1: cells[5].textContent,
                    P2Type2: cells[6].textContent,
                    P2Dex: cells[7].textContent
                });
            }
        }
    });
    
    return matchupsData;
}

// Display Functions
function updateTeamsDisplay(teamsData) {
    const team1Container = document.querySelector('.player1-team .team-rows');
    const team2Container = document.querySelector('.player2-team .team-rows');
    if (!team1Container || !team2Container) return;
    
    // Clear and add headers
    const header = `
        <div class="table-header team-header">
            <div>Name</div>
            <div>Primary Type</div>
            <div>Secondary Type</div>
            <div>Dex</div>
        </div>`;
    
    team1Container.innerHTML = header;
    team2Container.innerHTML = header;
    
    // Add Pokemon rows
    teamsData.forEach(pokemon => {
        const container = pokemon.TeamNumber === '1' ? team1Container : team2Container;
        const row = createStandardTableRow(pokemon);
        container.appendChild(row);
    });
}

function updateMatchupsDisplay(matchupsData) {
    const matchupRows = document.querySelector('.matchup-rows');
    if (!matchupRows) return;
    matchupRows.innerHTML = '';
    
    matchupsData.forEach(matchup => {
        const row = document.createElement('div');
        row.className = 'matchup-row';
        
        // Store data in dataset for easy access
        row.dataset.p1Name = matchup.P1Name;
        row.dataset.p1Type1 = matchup.P1Type1;
        row.dataset.p1Type2 = matchup.P1Type2;
        row.dataset.p1Dex = matchup.P1Dex;
        row.dataset.p2Name = matchup.P2Name;
        row.dataset.p2Type1 = matchup.P2Type1;
        row.dataset.p2Type2 = matchup.P2Type2;
        row.dataset.p2Dex = matchup.P2Dex;
        
        [
            matchup.P1Dex,
            matchup.P1Type2,
            matchup.P1Type1,
            matchup.P1Name,
            matchup.P2Name,
            matchup.P2Type1,
            matchup.P2Type2,
            matchup.P2Dex
        ].forEach(content => {
            const cell = document.createElement('div');
            cell.className = 'matchup-cell';
            cell.textContent = content || '-';
            row.appendChild(cell);
        });
        
        matchupRows.appendChild(row);
    });
    
    setupMatchupRowSelection();
}

// ------------------------
// IMPROVED MATCHUP FUNCTIONS
// ------------------------

function createMatchupRow(p1Row, p2Row) {
    const p1Data = extractRowData(p1Row);
    const p2Data = extractRowData(p2Row);
    
    if (!p1Data || !p2Data) {
        console.error('Failed to extract data from rows');
        return null;
    }
    
    const row = document.createElement('div');
    row.className = 'matchup-row';
    
    // Store data for easy access
    row.dataset.p1Name = p1Data.name;
    row.dataset.p1Type1 = p1Data.type1;
    row.dataset.p1Type2 = p1Data.type2;
    row.dataset.p1Dex = p1Data.dexNum;
    row.dataset.p2Name = p2Data.name;
    row.dataset.p2Type1 = p2Data.type1;
    row.dataset.p2Type2 = p2Data.type2;
    row.dataset.p2Dex = p2Data.dexNum;
    
    const cells = [
        p1Data.dexNum,
        p1Data.type2,
        p1Data.type1,
        p1Data.name,
        p2Data.name,
        p2Data.type1,
        p2Data.type2,
        p2Data.dexNum
    ];
    
    cells.forEach(content => {
        const cell = document.createElement('div');
        cell.className = 'matchup-cell';
        cell.textContent = content || '-';
        row.appendChild(cell);
    });
    
    return row;
}




// ------------------------
// EVENT HANDLING & INIT
// ------------------------

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') closeAddPlayerModal();
    });

    // Splash screen animation
    const splash = document.getElementById('splashScreen');
    if (splash) {
        splash.addEventListener('click', function() {
            splash.classList.add('slide-out');
            setTimeout(() => { splash.style.display = 'none'; }, 700);
        });
    }
});

function initializeApp() {
    // Team row selection
    const player1Team = document.querySelector('.player1-team');
    const player2Team = document.querySelector('.player2-team');
    if (player1Team) player1Team.addEventListener('click', handleRowSelection);
    if (player2Team) player2Team.addEventListener('click', handleRowSelection);

    // Add to Active Team
    const addToActiveBtn = document.querySelector('.btn-primary');
    if (addToActiveBtn) addToActiveBtn.addEventListener('click', addToActiveTeam);

    // Outside click clears selections, but NOT when interacting with certain UI
    document.addEventListener('click', (event) => {
        if (
            event.target.closest('.player1-team') ||
            event.target.closest('.player2-team') ||
            event.target.closest('.btn-primary') ||
            event.target.closest('.btn-danger') || // DELETE button
            event.target.closest('#deleteConfirmModal')
        ) return;
        clearSelections();
    });

    // Add Player Modal
    const addPlayerBtn = document.querySelector('.btn-success');
    if (addPlayerBtn) addPlayerBtn.addEventListener('click', openAddPlayerModal);

    // Add Player Form
    const addPlayerForm = document.getElementById('addPlayerForm');
    if (addPlayerForm) {
        const newForm = addPlayerForm.cloneNode(true);
        addPlayerForm.parentNode.replaceChild(newForm, addPlayerForm);
        newForm.addEventListener('submit', handleAddPlayer);
    }

    // Save/Load buttons
    const saveButton = document.querySelector('.btn-info');
    if (saveButton) saveButton.addEventListener('click', saveTeams);

    const loadButton = document.querySelector('.btn-secondary');
    if (loadButton) loadButton.addEventListener('click', loadTeams);

    // Remove from Team (Matchup) button
    const removeFromTeamBtn = document.querySelector('.btn-warning');
    if (removeFromTeamBtn) removeFromTeamBtn.addEventListener('click', removeSelectedMatchups);

    // Delete button logic
    const deleteBtn = document.querySelector('.btn-danger');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            const selectedP1 = document.querySelector('.player1-team .table-row.selected');
            const selectedP2 = document.querySelector('.player2-team .table-row.selected');
            if (!selectedP1 && !selectedP2) {
                showStatusMessage('Select a row from Player 1 and/or Player 2 team to delete.', 'info');
                return;
            }
            openDeleteConfirmModal();
        });
    }

    // Delete modal confirm/cancel
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', deleteSelectedSideRows);

    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteConfirmModal);

    // Sorting mode radio buttons
    document.querySelectorAll('input[name="sortingMode"]').forEach(radio => {
        radio.addEventListener('change', applyCurrentSorting);
    });

    setupMatchupRowSelection();
    applyCurrentSorting();
}

// ------------------------
// TEAM/MATCHUP LOGIC
// ------------------------

// ------------------------
// IMPROVED ADD PLAYER HANDLER
// ------------------------

function handleAddPlayer(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const pokemonData = {
        name: formData.get('name').trim(),
        Type1: formData.get('Type1'),
        Type2: formData.get('Type2') || '',
        DexNum: parseInt(formData.get('DexNum')),
        Extra: formData.get('Extra') ? formData.get('Extra').trim() : null
    };
    
    const teamNumber = event.submitter.textContent.includes('Player 1') ? 1 : 2;
    
    if (!validatePlayerData(pokemonData)) return;
    
    if (updateTeamTable(teamNumber, pokemonData)) {
        players.push(pokemonData);
        showStatusMessage(`Pokemon added to Player ${teamNumber}'s team!`, 'success');
        closeAddPlayerModal();
        applyCurrentSorting();
    }
}

// Team Row Selection Handler
function handleRowSelection(event) {
    const row = event.target.closest('.table-row');
    if (!row) return;
    const isPlayer1Team = row.closest('.player1-team') !== null;
    const team = isPlayer1Team ? 'player1' : 'player2';
    const previousSelection = document.querySelector(`.${team}-team .selected`);
    if (previousSelection) previousSelection.classList.remove('selected');
    row.classList.add('selected');
    selectedPokemon[team] = row;
}

// Matchup Row Selection (supports multi-select with Ctrl/Cmd)
function setupMatchupRowSelection() {
    const matchupRows = document.querySelector('.matchup-rows');
    if (!matchupRows) return;
    matchupRows.addEventListener('click', function(event) {
        const row = event.target.closest('.matchup-row');
        if (!row) return;
        if (event.ctrlKey || event.metaKey) {
            row.classList.toggle('selected');
        } else {
            document.querySelectorAll('.matchup-row.selected').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
        }
    });
}

// Add to Active Team (Matchup)
function parseRowData(row) {
    // Skip header rows
    if (row.classList.contains('table-header') || row.classList.contains('team-header')) {
        return null;
    }
    
    // Try to get data from dataset first (preferred method)
    if (row.dataset.name) {
        return {
            name: row.dataset.name,
            type1: row.dataset.type1,
            type2: row.dataset.type2,
            dexNum: row.dataset.dexNum
        };
    }
    
    // Parse from cell structure
    const cells = row.querySelectorAll('.cell-name, .cell-type1, .cell-type2, .cell-dex');
    if (cells.length === 4) {
        return {
            name: cells[0].textContent.trim(),
            type1: cells[1].textContent.trim(),
            type2: cells[2].textContent.trim(),
            dexNum: cells[3].textContent.trim()
        };
    }
    
    // Fallback: try to parse from div structure
    const nameCell = row.querySelector('.cell-name');
    const type1Cell = row.querySelector('.cell-type1');
    const type2Cell = row.querySelector('.cell-type2');
    const dexCell = row.querySelector('.cell-dex');
    
    if (nameCell && type1Cell && type2Cell && dexCell) {
        return {
            name: nameCell.textContent.trim(),
            type1: type1Cell.textContent.trim(),
            type2: type2Cell.textContent.trim(),
            dexNum: dexCell.textContent.trim()
        };
    }
    
    // Last resort: try to extract from combined text
    // This assumes the format is "Name Primary Secondary 0001" (space-separated)
    const text = row.textContent.trim();
    const parts = text.split(/\s+/);
    if (parts.length >= 4) {
        // Last part should be the dex number
        const dexNum = parts[parts.length - 1];
        // Second to last should be secondary type
        const type2 = parts[parts.length - 2];
        // Third to last should be primary type
        const type1 = parts[parts.length - 3];
        // Everything else is the name
        const name = parts.slice(0, parts.length - 3).join(' ');
        
        return { name, type1, type2, dexNum };
    }
    
    return null;
}

function createMatchupRow(p1Row, p2Row) {
    const p1Data = parseRowData(p1Row);
    const p2Data = parseRowData(p2Row);
    
    if (!p1Data || !p2Data) {
        console.error('Failed to extract data from rows');
        console.log('P1 Row:', p1Row);
        console.log('P2 Row:', p2Row);
        return null;
    }
    
    const row = document.createElement('div');
    row.className = 'matchup-row';
    
    // Store data for easy access
    row.dataset.p1Name = p1Data.name;
    row.dataset.p1Type1 = p1Data.type1;
    row.dataset.p1Type2 = p1Data.type2;
    row.dataset.p1Dex = p1Data.dexNum;
    row.dataset.p2Name = p2Data.name;
    row.dataset.p2Type1 = p2Data.type1;
    row.dataset.p2Type2 = p2Data.type2;
    row.dataset.p2Dex = p2Data.dexNum;
    
    const cells = [
        p1Data.dexNum,
        p1Data.type2,
        p1Data.type1,
        p1Data.name,
        p2Data.name,
        p2Data.type1,
        p2Data.type2,
        p2Data.dexNum
    ];
    
    cells.forEach(content => {
        const cell = document.createElement('div');
        cell.className = 'matchup-cell';
        cell.textContent = content || '-';
        row.appendChild(cell);
    });
    
    return row;
}

function addToActiveTeam() {
    if (!selectedPokemon.player1 || !selectedPokemon.player2) {
        showStatusMessage('Please select one Pokemon from each team', 'error');
        return;
    }
    const matchupRows = document.querySelector('.matchup-rows');
    if (!matchupRows) {
        showStatusMessage('Error: Matchup table not found', 'error');
        return;
    }
    if (matchupRows.children.length >= 6) {
        showStatusMessage('Maximum number of matchups reached (6)', 'error');
        return;
    }
    const newRow = createMatchupRow(selectedPokemon.player1, selectedPokemon.player2);
    matchupRows.appendChild(newRow);
    clearSelections();
    showStatusMessage('Matchup added successfully', 'success');
    applyCurrentSorting();
}

function removeSelectedMatchups() {
    const selectedRows = document.querySelectorAll('.matchup-rows .matchup-row.selected');
    if (selectedRows.length === 0) {
        showStatusMessage('Select one or more matchup rows to remove.', 'info');
        return;
    }
    selectedRows.forEach(row => row.remove());
    showStatusMessage(`${selectedRows.length} matchup(s) removed.`, 'success');
    applyCurrentSorting();
}

function clearSelections() {
    document.querySelectorAll('.table-row.selected').forEach(row => row.classList.remove('selected'));
    selectedPokemon.player1 = null;
    selectedPokemon.player2 = null;
}

// Delete from side teams
function deleteSelectedSideRows() {
    const selectedP1 = document.querySelector('.player1-team .table-row.selected');
    const selectedP2 = document.querySelector('.player2-team .table-row.selected');
    let deletedCount = 0;
    if (selectedP1) { selectedP1.remove(); deletedCount++; }
    if (selectedP2) { selectedP2.remove(); deletedCount++; }

    if (deletedCount === 0) {
        showStatusMessage('No side table row selected for deletion.', 'info');
    } else {
        showStatusMessage(`${deletedCount} Pokémon deleted from team(s).`, 'success');
    }
    closeDeleteConfirmModal();
    clearSelections();
    applyCurrentSorting();
}

// ------------------------
// SAVE/LOAD TEAMS AND MATCHUPS
// ------------------------

async function saveTeams() {
    try {
        const team1Data = collectTeamData(1);
        const team2Data = collectTeamData(2);
        const matchupsData = collectMatchupsData();
        const saveData = {
            teams: [].concat(team1Data, team2Data),
            matchups: matchupsData
        };
        showStatusMessage('Saving data...', 'info');
        const response = await pywebview.api.save_teams(saveData);
        if (response.success) {
            showStatusMessage('Data saved successfully', 'success');
        } else {
            showStatusMessage(response.message || 'Failed to save data', 'error');
        }
    } catch (error) {
        console.error('Error saving data:', error);
        showStatusMessage('Error saving data', 'error');
    }
    applyCurrentSorting();
}

async function loadTeams() {
    try {
        showStatusMessage('Loading data...', 'info');
        const response = await pywebview.api.load_teams();
        if (response.success) {
            if (response.teams && response.teams.length > 0) updateTeamsDisplay(response.teams);
            if (response.matchups && response.matchups.length > 0) updateMatchupsDisplay(response.matchups);
            showStatusMessage('Data loaded successfully', 'success');
        } else {
            showStatusMessage(response.message || 'No saved data found', 'info');
        }
    } catch (error) {
        console.error('Error loading data:', error);
        showStatusMessage('Error loading data', 'error');
    }
    applyCurrentSorting();
}

// ------------------------
// SORTING LOGIC
// ------------------------

// Utility: Get matchup names and types for sorting

function sortByName(arr) {
    return arr.sort((a, b) => a.name.localeCompare(b.name));
}

// Improved function to get current matchup data
function getCurrentMatchupData() {
    const matchupRows = document.querySelectorAll('.matchup-rows .matchup-row');
    const data = {
        P1Names: [],
        P2Names: [],
        P1Types: { type1: [], type2: [] },
        P2Types: { type1: [], type2: [] }
    };
    
    matchupRows.forEach(row => {
        if (row.dataset.p1Name) {
            // Use dataset if available
            data.P1Names.push(row.dataset.p1Name);
            data.P2Names.push(row.dataset.p2Name);
            data.P1Types.type1.push(row.dataset.p1Type1);
            data.P1Types.type2.push(row.dataset.p1Type2);
            data.P2Types.type1.push(row.dataset.p2Type1);
            data.P2Types.type2.push(row.dataset.p2Type2);
        } else {
            // Fallback to cell parsing
            const cells = row.querySelectorAll('.matchup-cell');
            if (cells.length === 8) {
                data.P1Names.push(cells[3].textContent.trim());
                data.P2Names.push(cells[4].textContent.trim());
                data.P1Types.type1.push(cells[2].textContent.trim());
                data.P1Types.type2.push(cells[1].textContent.trim());
                data.P2Types.type1.push(cells[5].textContent.trim());
                data.P2Types.type2.push(cells[6].textContent.trim());
            }
        }
    });
    
    return data;
}

// Improved function to get team data for sorting
function getTeamDataForSorting(teamClass) {
    const rows = document.querySelectorAll(`.${teamClass} .pokemon-row`);
    const teamData = [];
    
    rows.forEach(row => {
        const data = extractRowData(row);
        if (data) {
            teamData.push({
                row: row,
                name: data.name,
                type1: data.type1,
                type2: data.type2,
                dexNum: data.dexNum
            });
        }
    });
    
    return teamData;
}

// Improved simplified sorting with better highlighting
function applySimplifiedSorting() {
    const matchupData = getCurrentMatchupData();
    const p1Team = getTeamDataForSorting('player1-team');
    const p2Team = getTeamDataForSorting('player2-team');
    
    // Clear existing highlights
    p1Team.forEach(e => e.row.classList.remove('matchup-green', 'matchup-red', 'matchup-yellow'));
    p2Team.forEach(e => e.row.classList.remove('matchup-green', 'matchup-red', 'matchup-yellow'));
    
    // Categorize Player 1 team
    let p1green = [], p1normal = [], p1red = [];
    p1Team.forEach(entry => {
        if (matchupData.P1Names.includes(entry.name)) {
            entry.row.classList.add('matchup-green');
            p1green.push(entry);
        } else if (matchupData.P1Types.type1.includes(entry.type1)) {
            entry.row.classList.add('matchup-red');
            p1red.push(entry);
        } else {
            p1normal.push(entry);
        }
    });
    
    // Categorize Player 2 team
    let p2green = [], p2normal = [], p2red = [];
    p2Team.forEach(entry => {
        if (matchupData.P2Names.includes(entry.name)) {
            entry.row.classList.add('matchup-green');
            p2green.push(entry);
        } else if (matchupData.P2Types.type1.includes(entry.type1)) {
            entry.row.classList.add('matchup-red');
            p2red.push(entry);
        } else {
            p2normal.push(entry);
        }
    });
    
    // Apply yellow highlighting for name matches
    applyYellowHighlighting(p1Team, p2Team);
    
    // Resort teams
    reSortTeam('player1-team', p1green, p1normal, p1red);
    reSortTeam('player2-team', p2green, p2normal, p2red);
}


// Improved advanced sorting
function applyAdvancedSorting() {
    const matchupData = getCurrentMatchupData();
    const p1Team = getTeamDataForSorting('player1-team');
    const p2Team = getTeamDataForSorting('player2-team');
    
    // Clear existing highlights
    p1Team.forEach(e => e.row.classList.remove('matchup-green', 'matchup-red', 'matchup-yellow'));
    p2Team.forEach(e => e.row.classList.remove('matchup-green', 'matchup-red', 'matchup-yellow'));
    
    // Categorize Player 1 team
    let p1green = [], p1normal = [], p1red = [];
    p1Team.forEach(entry => {
        if (matchupData.P1Names.includes(entry.name)) {
            entry.row.classList.add('matchup-green');
            p1green.push(entry);
        } else if (hasTypeMatch(entry, matchupData.P1Types)) {
            entry.row.classList.add('matchup-red');
            p1red.push(entry);
        } else {
            p1normal.push(entry);
        }
    });
    
    // Categorize Player 2 team
    let p2green = [], p2normal = [], p2red = [];
    p2Team.forEach(entry => {
        if (matchupData.P2Names.includes(entry.name)) {
            entry.row.classList.add('matchup-green');
            p2green.push(entry);
        } else if (hasTypeMatch(entry, matchupData.P2Types)) {
            entry.row.classList.add('matchup-red');
            p2red.push(entry);
        } else {
            p2normal.push(entry);
        }
    });
    
    // Apply yellow highlighting for name matches
    applyYellowHighlighting(p1Team, p2Team);
    
    // Resort teams
    reSortTeam('player1-team', p1green, p1normal, p1red);
    reSortTeam('player2-team', p2green, p2normal, p2red);
}

// Helper function to check type matches for advanced sorting
function hasTypeMatch(entry, matchupTypes) {
    return (matchupTypes.type1.includes(entry.type1) || 
            matchupTypes.type1.includes(entry.type2) ||
            matchupTypes.type2.includes(entry.type1) || 
            matchupTypes.type2.includes(entry.type2)) &&
           (entry.type1 || entry.type2);
}

// Helper function to apply yellow highlighting
function applyYellowHighlighting(p1Team, p2Team) {
    p2Team.forEach(entry => {
        if (entry.row.classList.contains('matchup-green') || entry.row.classList.contains('matchup-red')) {
            p1Team.forEach(e => {
                if (e.name === entry.name && !e.row.classList.contains('matchup-green') && !e.row.classList.contains('matchup-red')) {
                    e.row.classList.add('matchup-yellow');
                }
            });
        }
    });
    
    p1Team.forEach(entry => {
        if (entry.row.classList.contains('matchup-green') || entry.row.classList.contains('matchup-red')) {
            p2Team.forEach(e => {
                if (e.name === entry.name && !e.row.classList.contains('matchup-green') && !e.row.classList.contains('matchup-red')) {
                    e.row.classList.add('matchup-yellow');
                }
            });
        }
    });
}

// Helper function to resort teams
function reSortTeam(teamClass, green, normal, red) {
    const container = document.querySelector(`.${teamClass} .team-rows`);
    if (!container) return;
    
    const header = container.querySelector('.table-header');
    container.innerHTML = '';
    
    if (header) container.appendChild(header);
    
    sortByName(green).forEach(e => container.appendChild(e.row));
    sortByName(normal).forEach(e => container.appendChild(e.row));
    sortByName(red).forEach(e => container.appendChild(e.row));
}
