// ==========================================
// BEGINNER'S GUIDE TO JAVASCRIPT
// This code manages a contact system and player database
// ==========================================

// GLOBAL VARIABLES - These are variables that can be used anywhere in our code
// Think of them as containers that hold information for the entire program

// Array to store all our player data - an array is like a list that can hold multiple items
let players = [];

// Variables for managing contact information
let currentData = []; // Array to store current contact data being displayed
let isEditing = false; // Boolean (true/false) to track if we're editing a contact

// DOM ELEMENTS - These are references to HTML elements on our webpage
// DOM stands for "Document Object Model" - it's how JavaScript talks to HTML

// Getting references to HTML elements by their ID
// document.getElementById() finds an HTML element with a specific ID
const contactForm = document.getElementById('contactForm');
const editForm = document.getElementById('editForm');
const editModal = document.getElementById('editModal');
const contactsTableBody = document.getElementById('contactsTableBody');
const recordCount = document.getElementById('recordCount');
const statusMessage = document.getElementById('statusMessage');
const searchInput = document.getElementById('searchInput');

// EVENT LISTENER - This waits for the webpage to finish loading before running our code
// 'DOMContentLoaded' means "when the HTML page is fully loaded"
document.addEventListener('DOMContentLoaded', function() {
    // Call these functions when the page loads
    initializeApp();        // Set up the application
    setupEventListeners();  // Set up all our button clicks and form submissions
    loadContacts();         // Load contacts from the database
});

// FUNCTION DEFINITION - This is how we create reusable blocks of code
function initializeApp() {
    // querySelector finds the first element that matches the CSS selector
    // '.btn-success' means "find an element with the class 'btn-success'"
    const addPlayerBtn = document.querySelector('.btn-success');
    
    // IF STATEMENT - Only run this code if the button exists
    if (addPlayerBtn) {
        // addEventListener adds a "listener" that waits for an event (like a click)
        // When the button is clicked, run the openAddPlayerModal function
        addPlayerBtn.addEventListener('click', openAddPlayerModal);
    }
    
    // Get reference to the add player form
    const addPlayerForm = document.getElementById('addPlayerForm');
    if (addPlayerForm) {
        // Listen for form submission (when user clicks submit or presses Enter)
        addPlayerForm.addEventListener('submit', handleAddPlayer);
    }
    
    // WINDOW EVENT LISTENER - Listen for clicks anywhere on the page
    window.addEventListener('click', function(event) {
        // Get reference to the modal (popup window)
        const addPlayerModal = document.getElementById('addPlayerModal');
        
        // If user clicks outside the modal, close it
        // event.target is the element that was clicked
        if (event.target === addPlayerModal) {
            closeAddPlayerModal();
        }
        
        // Same logic for the edit modal
        if (event.target === editModal) {
            closeEditModal();
        }
    });
    
    // KEYBOARD EVENT LISTENER - Listen for key presses
    document.addEventListener('keydown', function(event) {
        // If user presses the Escape key, close modals
        if (event.key === 'Escape') {
            closeAddPlayerModal();
            // If we're currently editing, close the edit modal too
            if (isEditing) {
                closeEditModal();
            }
        }
    });
}

// Function to set up all our event listeners (button clicks, form submissions, etc.)
function setupEventListeners() {
    // FORM SUBMISSION LISTENERS
    // Check if the form exists before adding listener (prevents errors)
    if (contactForm) {
        // When contact form is submitted, run handleAddContact function
        contactForm.addEventListener('submit', handleAddContact);
    }
    if (editForm) {
        // When edit form is submitted, run handleUpdateContact function
        editForm.addEventListener('submit', handleUpdateContact);
    }
    
    // BUTTON CLICK LISTENERS
    // Get reference to refresh button and add click listener
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadContacts);
    }
    
    // Clear all button - deletes all contacts
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', handleClearAll);
    }
    
    // Cancel button - resets the form
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', resetForm);
    }
    
    // Search button - searches for contacts
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    // Show all button - displays all contacts
    const showAllBtn = document.getElementById('showAllBtn');
    if (showAllBtn) {
        showAllBtn.addEventListener('click', loadContacts);
    }
    
    // SEARCH INPUT LISTENER
    // Listen for key presses in the search box
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            // If user presses Enter key, trigger search
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    // MODAL CLOSE BUTTON
    // Find the close button (X) on the modal
    const closeBtn = document.querySelector('.close');
    if (closeBtn && !closeBtn.onclick) {
        // Add click listener to close the edit modal
        closeBtn.addEventListener('click', closeEditModal);
    }
    
    // KEYBOARD SHORTCUTS
    // Listen for keyboard shortcuts throughout the application
    document.addEventListener('keydown', function(e) {
        // Ctrl+N or Cmd+N (Mac) to focus on name input
        // e.ctrlKey checks if Ctrl is pressed, e.metaKey checks if Cmd is pressed
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault(); // Prevent default browser behavior
            const nameInput = document.getElementById('name');
            if (nameInput) {
                nameInput.focus(); // Put cursor in the name input field
            }
        }
        
        // Ctrl+F or Cmd+F to focus on search box
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault(); // Prevent default browser search
            if (searchInput) {
                searchInput.focus(); // Put cursor in search box
            }
        }
    });
}

// MODAL FUNCTIONS - Functions to open and close popup windows

// Function to open the "Add Player" modal/popup
function openAddPlayerModal() {
    // Get reference to the modal element
    const modal = document.getElementById('addPlayerModal');
    if (modal) {
        // Show the modal by setting its display style to 'block'
        modal.style.display = 'block';
        
        // Focus on the first input field for better user experience
        const firstInput = document.getElementById('playerName');
        if (firstInput) {
            // setTimeout delays the focus by 100 milliseconds to ensure modal is fully shown
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

// Function to close the "Add Player" modal
function closeAddPlayerModal() {
    const modal = document.getElementById('addPlayerModal');
    if (modal) {
        // Hide the modal by setting display to 'none'
        modal.style.display = 'none';
        
        // Reset the form to clear all input fields
        const form = document.getElementById('addPlayerForm');
        if (form) {
            form.reset(); // Built-in method to clear all form fields
        }
    }
}

// FORM HANDLING FUNCTIONS

// Function to handle adding a new player
// Modify the existing handleAddPlayer function
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

    // Determine which team to add to based on which button was clicked
    const teamNumber = event.submitter.textContent.includes('Player 1') ? 1 : 2;
    
    // Validate data before adding
    if (!validatePlayerData(pokemonData)) {
        return;
    }
}
    // Try to update the team table
    if (updateTeamTable(teamNumber, pokemonData)) {
        // Add the new player to our players array
        players.push(pokemonData);
        
        // Show success message
        showStatusMessage(`Pokemon added to Player ${teamNumber}'s team!`, 'success');
        
        // Close the modal popup
        closeAddPlayerModal();
    }

// Function to validate player data before saving
function validatePlayerData(playerData) {
    // Check if name exists and is not empty
    if (!playerData.name || playerData.name.length === 0) {
        showStatusMessage('Player name is required!', 'error');
        return false; // Return false means validation failed
    }
    
    // Check if name is too long
    if (playerData.name.length > 20) {
        showStatusMessage('Player name must be 20 characters or less!', 'error');
        return false;
    }
    
    // Check if primary type is selected
    if (!playerData.Type1) {
        showStatusMessage('Primary type is required!', 'error');
        return false;
    }
    
    // Check if number exists and is a valid number
    // isNaN() means "is Not a Number" - returns true if the value is not a number
    if (!playerData.DexNum || isNaN(playerData.DexNum)) {
        showStatusMessage('Player number is required!', 'error');
        return false;
    }
    
    // Check if number is within valid range
    if (playerData.DexNum < 1 || playerData.DexNum > 9999) {
        showStatusMessage('Player number must be between 1 and 9999!', 'error');
        return false;
    }
    
    // Check if player number already exists
    // .some() method checks if at least one item in the array matches the condition
    if (players.some(player => player.DexNum === playerData.DexNum)) {
        showStatusMessage('Player number already exists!', 'error');
        return false;
    }
    
    // Check extra field length if it exists
    if (playerData.Extra && playerData.Extra.length > 20) {
        showStatusMessage('Extra field must be 20 characters or less!', 'error');
        return false;
    }
    
    return true; // All validations passed
}

// Function to close the edit modal
function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.style.display = 'none'; // Hide the modal
        if (editForm) {
            editForm.reset(); // Clear the form
        }
        isEditing = false; // Update our tracking variable
    }
}

// Function to show status messages to the user
function showStatusMessage(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    if (statusDiv) {
        statusDiv.textContent = message; // Set the message text
        // Set CSS classes for styling (success = green, error = red, etc.)
        statusDiv.className = `status-message ${type} show`;
        
        // Hide the message after 3 seconds (3000 milliseconds)
        setTimeout(() => {
            statusDiv.classList.remove('show');
        }, 3000);
    }
}

// Helper function to create table row HTML from Pokemon data
function createPokemonTableRow(pokemon) {
    return `<div class="table-row">${pokemon.name} | ${pokemon.Type1} | ${pokemon.Type2 || ''} | ${String(pokemon.DexNum).padStart(4, '0')}</div>`;
}

// Function to update specific team's table
function updateTeamTable(teamNumber, pokemonData) {
    // Get the correct team container
    const teamContainer = document.querySelector(`.player${teamNumber}-team .placeholder-table`);
    if (!teamContainer) return false;

    // Keep the header and add new row
    const header = teamContainer.querySelector('.table-header');
    const currentRows = teamContainer.querySelectorAll('.table-row');
    
    // Check team size limit (maximum 6 Pokemon)
    if (currentRows.length >= 6) {
        showStatusMessage('Team is full! Maximum 6 Pokemon allowed.', 'error');
        return false;
    }

    // Clear placeholder data if this is the first real entry
    if (currentRows.length === 3 && teamContainer.querySelector('.table-row').textContent.includes('Bulbasaur')) {
        teamContainer.innerHTML = '';
        teamContainer.appendChild(header);
    }

    // Add the new Pokemon row
    const newRow = document.createElement('div');
    newRow.innerHTML = createPokemonTableRow(pokemonData);
    teamContainer.appendChild(newRow.firstChild);
    
    return true;
}


// Security function to prevent XSS attacks
function escapeHtml(text) {
    // Create a temporary div element
    const div = document.createElement('div');
    // Set the text content (this automatically escapes HTML)
    div.textContent = text;
    // Return the escaped HTML
    return div.innerHTML;
}

// CONTACT MANAGEMENT FUNCTIONS

// ASYNC FUNCTION - This function can wait for other operations to complete
async function loadContacts() {
    try { // TRY-CATCH block handles errors gracefully
        showStatusMessage('Loading contacts...', 'info');
        
        // AWAIT keyword waits for the API call to complete
        // pywebview.api is a bridge to communicate with Python backend
        const response = await pywebview.api.get_all_records();
        
        // Check if the operation was successful
        if (response.success) {
            currentData = response.data; // Store the data
            updateTable(currentData);     // Update the display
            updateRecordCount(response.count); // Update the count
            showStatusMessage('Contacts loaded successfully', 'success');
        } else {
            showStatusMessage('Failed to load contacts', 'error');
        }
    } catch (error) {
        // CATCH block runs if there's an error
        console.error('Error loading contacts:', error);
        showStatusMessage('Error loading contacts', 'error');
    }
}

// Function to update the HTML table with contact data
function updateTable(data) {
    // Return early if table body doesn't exist
    if (!contactsTableBody) return;
    
    // Clear existing table content
    contactsTableBody.innerHTML = '';
    
    // If no data, show a message
    if (data.length === 0) {
        contactsTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: #666;">
                    No contacts found. Add a new contact to get started!
                </td>
            </tr>
        `;
        return;
    }
    
    // FOREACH LOOP - Execute code for each item in the array
    data.forEach(contact => {
        // Create a new table row element
        const row = document.createElement('tr');
        
        // Set the HTML content of the row
        // Template literals (backticks) allow multi-line strings and variable insertion
        row.innerHTML = `
            <td>${contact.ID}</td>
            <td>${escapeHtml(contact.Name)}</td>
            <td>${escapeHtml(contact.Email)}</td>
            <td>${escapeHtml(contact.Phone)}</td>
            <td>${escapeHtml(contact.Notes)}</td>
            <td>
                <button class="btn btn-warning btn-small" onclick="editContact('${contact.ID}')">
                    Edit
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteContact('${contact.ID}')">
                    Delete
                </button>
            </td>
        `;
        
        // Add the row to the table body
        contactsTableBody.appendChild(row);
    });
}

// Function to update the record count display
function updateRecordCount(count) {
    if (recordCount) {
        recordCount.textContent = count; // Update the displayed number
    }
}

// Function to handle adding a new contact
async function handleAddContact(e) {
    e.preventDefault(); // Prevent form from submitting normally
    
    // Get form data
    const formData = new FormData(contactForm);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        notes: formData.get('notes') || '' // Use empty string if notes is null
    };
    
    try {
        showStatusMessage('Adding contact...', 'info');
        
        // Call the Python backend to add the contact
        const response = await pywebview.api.add_record(
            contactData.name,
            contactData.email,
            contactData.phone,
            contactData.notes
        );
        
        if (response.success) {
            showStatusMessage(response.message, 'success');
            resetForm();      // Clear the form
            loadContacts();   // Refresh the table
        } else {
            showStatusMessage(response.message, 'error');
        }
    } catch (error) {
        console.error('Error adding contact:', error);
        showStatusMessage('Error adding contact', 'error');
    }
}

// Function to handle updating an existing contact
async function handleUpdateContact(e) {
    e.preventDefault();
    
    const formData = new FormData(editForm);
    const contactId = document.getElementById('editId').value;
    
    try {
        showStatusMessage('Updating contact...', 'info');
        
        // Call Python backend to update the contact
        const response = await pywebview.api.update_record(
            contactId,
            formData.get('name'),
            formData.get('email'),
            formData.get('phone'),
            formData.get('notes') || ''
        );
        
        if (response.success) {
            showStatusMessage(response.message, 'success');
            closeEditModal();
            loadContacts(); // Refresh the table
        } else {
            showStatusMessage(response.message, 'error');
        }
    } catch (error) {
        console.error('Error updating contact:', error);
        showStatusMessage('Error updating contact', 'error');
    }
}

// Function to edit a contact
function editContact(contactId) {
    // FIND METHOD - Find the first item in array that matches the condition
    const contact = currentData.find(c => c.ID === contactId);
    
    if (!contact) {
        showStatusMessage('Contact not found', 'error');
        return;
    }
    
    // Populate the edit form with existing data
    document.getElementById('editId').value = contact.ID;
    document.getElementById('editName').value = contact.Name;
    document.getElementById('editEmail').value = contact.Email;
    document.getElementById('editPhone').value = contact.Phone;
    document.getElementById('editNotes').value = contact.Notes;
    
    // Show the edit modal
    editModal.style.display = 'block';
    isEditing = true; // Update our tracking variable
}

// Function to delete a contact
async function deleteContact(contactId) {
    // CONFIRM function shows a dialog asking user to confirm the action
    if (!confirm('Are you sure you want to delete this contact?')) {
        return; // Exit if user cancels
    }
    
    try {
        showStatusMessage('Deleting contact...', 'info');
        
        // Call Python backend to delete the contact
        const response = await pywebview.api.delete_record(contactId);
        
        if (response.success) {
            showStatusMessage(response.message, 'success');
            loadContacts(); // Refresh the table
        } else {
            showStatusMessage(response.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting contact:', error);
        showStatusMessage('Error deleting contact', 'error');
    }
}

// Function to handle search functionality
async function handleSearch() {
    // Get search query, default to empty string if searchInput doesn't exist
    const query = searchInput ? searchInput.value.trim() : '';
    
    try {
        showStatusMessage('Searching...', 'info');
        
        // Call Python backend to search
        const response = await pywebview.api.search_records(query);
        
        if (response.success) {
            updateTable(response.data);
            updateRecordCount(response.count);
            
            // Show different messages based on whether there was a search query
            if (query) {
                showStatusMessage(`Found ${response.count} result(s) for "${query}"`, 'success');
            } else {
                showStatusMessage('Showing all contacts', 'success');
            }
        } else {
            showStatusMessage('Search failed', 'error');
        }
    } catch (error) {
        console.error('Error searching:', error);
        showStatusMessage('Search error', 'error');
    }
}

// Function to clear all contacts
async function handleClearAll() {
    // Double-check with user before deleting everything
    if (!confirm('Are you sure you want to delete ALL contacts? This action cannot be undone!')) {
        return;
    }
    
    try {
        showStatusMessage('Clearing all data...', 'info');
        
        // Call Python backend to clear all data
        const response = await pywebview.api.clear_all_data();
        
        if (response.success) {
            showStatusMessage(response.message, 'success');
            loadContacts(); // Refresh the table
        } else {
            showStatusMessage(response.message, 'error');
        }
    } catch (error) {
        console.error('Error clearing data:', error);
        showStatusMessage('Error clearing data', 'error');
    }
}

// Function to reset the contact form
function resetForm() {
    if (contactForm) {
        contactForm.reset(); // Clear all form fields
        const nameInput = document.getElementById('name');
        if (nameInput) {
            nameInput.focus(); // Put cursor back in name field
        }
    }
}

// UTILITY FUNCTIONS - Helper functions for player management

// Function to get all players (getter function)
function getAllPlayers() {
    return players; // Return the entire players array
}

// Function to find a specific player by their number
function getPlayerByNumber(dexNum) {
    // FIND method returns the first matching item, or undefined if not found
    return players.find(player => player.DexNum === dexNum);
}

// Function to remove a player by their number
function removePlayerByNumber(dexNum) {
    // FINDINDEX returns the position of the item in the array, or -1 if not found
    const index = players.findIndex(player => player.DexNum === dexNum);
    
    if (index !== -1) {
        // SPLICE method removes item(s) from an array
        // splice(index, 1) means "remove 1 item starting at index"
        players.splice(index, 1);
        return true; // Return true to indicate success
    }
    return false; // Return false if player not found
}

// Function to clear all players
function clearAllPlayers() {
    players = []; // Reset the array to empty
    showStatusMessage('All players cleared!', 'success');
}

// ==========================================
// KEY CONCEPTS FOR BEGINNERS:
// ==========================================
// 1. VARIABLES: Containers that store data (let, const)
// 2. FUNCTIONS: Reusable blocks of code
// 3. ARRAYS: Lists that can hold multiple items
// 4. OBJECTS: Collections of key-value pairs
// 5. EVENT LISTENERS: Code that waits for user interactions
// 6. ASYNC/AWAIT: Handling operations that take time
// 7. DOM MANIPULATION: Changing HTML elements with JavaScript
// 8. CONDITIONAL STATEMENTS: if/else logic
// 9. LOOPS: Repeating code (forEach, find, etc.)
// 10. ERROR HANDLING: try/catch blocks