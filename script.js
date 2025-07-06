// ==========================================
// LYNLOCKE JS - CLEAN VERSION
// This code manages team selection, matchups, and basic UI for the Lynlocke app
// ==========================================

// GLOBALS
let players = [];
let currentData = [];
let isEditing = false;

let selectedPokemon = {
    player1: null,
    player2: null
};

// Status message utility
function showStatusMessage(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.className = `status-message ${type} show`;
        setTimeout(() => {
            statusDiv.classList.remove('show');
        }, 3000);
    }
}

// MODAL HANDLING
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

// DATA VALIDATION
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

// TEAM TABLES
function createPokemonTableRow(pokemon) {
    return `<div class="table-row">${pokemon.name} | ${pokemon.Type1} | ${pokemon.Type2 || ''} | ${String(pokemon.DexNum).padStart(4, '0')}</div>`;
}

function updateTeamTable(teamNumber, pokemonData) {
    const teamContainer = document.querySelector(`.player${teamNumber}-team .placeholder-table`);
    if (!teamContainer) return false;
    const header = teamContainer.querySelector('.table-header');
    const currentRows = teamContainer.querySelectorAll('.table-row');
    if (currentRows.length >= 6) {
        showStatusMessage('Team is full! Maximum 6 Pokemon allowed.', 'error');
        return false;
    }
    const newRow = document.createElement('div');
    newRow.className = 'table-row';
    newRow.textContent = `${pokemonData.name} | ${pokemonData.Type1} | ${pokemonData.Type2 || ''} | ${String(pokemonData.DexNum).padStart(4, '0')}`;
    teamContainer.appendChild(newRow);
    return true;
}

// EVENT LISTENERS
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') closeAddPlayerModal();
    });
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

    // Outside click clears selections, but NOT when interacting with Delete or the confirmation modal
    document.addEventListener('click', (event) => {
        if (
            event.target.closest('.player1-team') ||
            event.target.closest('.player2-team') ||
            event.target.closest('.btn-primary') ||
            event.target.closest('.btn-danger') || // DELETE button
            event.target.closest('#deleteConfirmModal')
        ) {
            return;
        }
        clearSelections();
    });

    // Add Player modal
    const addPlayerBtn = document.querySelector('.btn-success');
    if (addPlayerBtn) addPlayerBtn.addEventListener('click', openAddPlayerModal);

    const addPlayerForm = document.getElementById('addPlayerForm');
    if (addPlayerForm) {
        const newForm = addPlayerForm.cloneNode(true);
        addPlayerForm.parentNode.replaceChild(newForm, addPlayerForm);
        newForm.addEventListener('submit', function(event) {
            handleAddPlayer(event);
        });
    }

    // Save/Load buttons
    const saveButton = document.querySelector('.btn-info');
    if (saveButton) saveButton.addEventListener('click', saveTeams);

    const loadButton = document.querySelector('.btn-secondary');
    if (loadButton) loadButton.addEventListener('click', loadTeams);

    // Remove from Team button (for matchup rows)
    const removeFromTeamBtn = document.querySelector('.btn-warning');
    if (removeFromTeamBtn) {
        removeFromTeamBtn.addEventListener('click', removeSelectedMatchups);
    }

    // Delete button logic
    const deleteBtn = document.querySelector('.btn-danger');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            // Only open modal if a side row is selected
            const selectedP1 = document.querySelector('.player1-team .table-row.selected');
            const selectedP2 = document.querySelector('.player2-team .table-row.selected');
            if (!selectedP1 && !selectedP2) {
                showStatusMessage('Select a row from Player 1 and/or Player 2 team to delete.', 'info');
                return;
            }
            openDeleteConfirmModal();
        });
    }

    // Modal confirm/cancel handlers
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', deleteSelectedSideRows);
    }
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', closeDeleteConfirmModal);
    }

    setupMatchupRowSelection();

}

// ADD PLAYER FORM HANDLER
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
    }
}

// TEAM DATA COLLECTION
function collectTeamData(teamNumber) {
    const teamRows = document.querySelectorAll(`.player${teamNumber}-team .table-row`);
    return Array.from(teamRows).map(row => {
        const [name, type1, type2, dexNum] = row.textContent.split('|').map(s => s.trim());
        return {
            TeamNumber: String(teamNumber),
            Name: name,
            Type1: type1,
            Type2: type2 || '',
            DexNum: dexNum,
            Extra: ''
        };
    });
}

// MATCHUP MANAGEMENT
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

function parseRowData(row) {
    const [name, type1, type2, dexNum] = row.textContent.split('|').map(s => s.trim());
    return { name, type1, type2, dexNum };
}

function createMatchupRow(p1Row, p2Row) {
    const p1Data = parseRowData(p1Row);
    const p2Data = parseRowData(p2Row);
    const row = document.createElement('div');
    row.className = 'matchup-row';
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
}

function clearSelections() {
    document.querySelectorAll('.table-row.selected').forEach(row => {
        row.classList.remove('selected');
    });
    selectedPokemon.player1 = null;
    selectedPokemon.player2 = null;
}

// MATCHUP DATA COLLECTION
function collectMatchupsData() {
    const matchupRows = document.querySelectorAll('.matchup-rows .matchup-row');
    return Array.from(matchupRows).map(row => {
        const cells = row.querySelectorAll('.matchup-cell');
        return {
            P1Dex: cells[0].textContent,
            P2Type2: cells[1].textContent,
            P1Type1: cells[2].textContent,
            P1Name: cells[3].textContent,
            P2Name: cells[4].textContent,
            P2Type1: cells[5].textContent,
            P2Type2: cells[6].textContent,
            P2Dex: cells[7].textContent
        };
    });
}

// TEAM/MATCHUP DISPLAY
function updateTeamsDisplay(teamsData) {
    const team1Container = document.querySelector('.player1-team .placeholder-table');
    const team2Container = document.querySelector('.player2-team .placeholder-table');
    if (!team1Container || !team2Container) return;
    const header = '<div class="table-header">Name | Primary Type | Secondary Type | Dex</div>';
    team1Container.innerHTML = header;
    team2Container.innerHTML = header;
    teamsData.forEach(pokemon => {
        const container = pokemon.TeamNumber === '1' ? team1Container : team2Container;
        const row = document.createElement('div');
        row.className = 'table-row';
        row.textContent = `${pokemon.Name} | ${pokemon.Type1} | ${pokemon.Type2} | ${pokemon.DexNum}`;
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
        [
            matchup.P1Dex,
            matchup.P2Type2,
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

    setupMatchupRowSelection(); // new line

}

// SAVE/LOAD TEAMS AND MATCHUPS
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
}

// Add event delegation for selecting matchup rows (supports multi-select with Ctrl/Cmd)
function setupMatchupRowSelection() {
    const matchupRows = document.querySelector('.matchup-rows');
    if (!matchupRows) return;

    matchupRows.addEventListener('click', function(event) {
        const row = event.target.closest('.matchup-row');
        if (!row) return;

        if (event.ctrlKey || event.metaKey) {
            // Toggle selection for multi-select
            row.classList.toggle('selected');
        } else {
            // Single selection: clear all others
            document.querySelectorAll('.matchup-row.selected').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
        }
    });
}

function removeSelectedMatchups() {
    const selectedRows = document.querySelectorAll('.matchup-rows .matchup-row.selected');
    if (selectedRows.length === 0) {
        showStatusMessage('Select one or more matchup rows to remove.', 'info');
        return;
    }
    selectedRows.forEach(row => row.remove());
    showStatusMessage(`${selectedRows.length} matchup(s) removed.`, 'success');
}

function openDeleteConfirmModal() {
    document.getElementById('deleteConfirmModal').style.display = 'block';
}

function closeDeleteConfirmModal() {
    document.getElementById('deleteConfirmModal').style.display = 'none';
}

function deleteSelectedSideRows() {
    // Find selected rows in side tables
    const selectedP1 = document.querySelector('.player1-team .table-row.selected');
    const selectedP2 = document.querySelector('.player2-team .table-row.selected');
    let deletedCount = 0;

    if (selectedP1) {
        selectedP1.remove();
        deletedCount++;
    }
    if (selectedP2) {
        selectedP2.remove();
        deletedCount++;
    }

    if (deletedCount === 0) {
        showStatusMessage('No side table row selected for deletion.', 'info');
    } else {
        showStatusMessage(`${deletedCount} Pokémon deleted from team(s).`, 'success');
    }
    closeDeleteConfirmModal();
    clearSelections();
}   
