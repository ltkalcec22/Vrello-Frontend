<template>
  <div class="board-header">
    <div class="board-name">
      <h1>Tasks</h1>
    </div>
    <div class="navbar">
      <button @click="openFilters" aria-label="Open Filters">
        <span class="icon">🔍</span> Filters
      </button>
      <button @click="shareBoard" aria-label="Share Board">
        <span class="icon">🔗</span> Share
      </button>
      <button @click="openSettings" aria-label="Open Settings">
        <span class="icon">⚙️</span> Settings
      </button>
    </div>
  </div>

  <!-- Settings dropdown s funkcijama -->
  <div v-if="isSettingsDropdownVisible" class="settings-dropdown">
    <ul>
      <li @click="toggleDarkMode">Toggle Dark Mode</li>
      <li @click="resetBoard">Reset Board</li>
      <li @click="exportData">Export Board Data</li>
      <li @click="closeSettings">Close</li>
    </ul>
  </div>

  <!-- Filters dropdown (slično workspace dropdownu) -->
  <div v-if="isFiltersDropdownVisible" class="filters-dropdown">
    <ul>
      <li v-for="filter in allFilters" :key="filter">
        <label>
          <input type="checkbox" :value="filter" v-model="selectedFilters" />
          {{ filter }}
        </label>
      </li>
      <li class="filter-actions">
        <button @click="applyFilters">Apply</button>
        <button @click="resetFilters">Reset</button>
        <button @click="closeFilters">Close</button>
      </li>
    </ul>
  </div>

  <!-- Workspace dropdown -->
  <div v-if="isWorkspaceDropdownVisible" class="workspace-dropdown">
    <ul>
      <li v-for="(workspace, index) in workspaces" :key="index" @click="setActiveWorkspace(workspace.id)">
        {{ workspace.name }}
      </li>
    </ul>
  </div>

  <div class="app-container">
    <aside class="sidebar">
      <h2>Workspaces</h2>
      <ul>
        <li v-for="(workspace, index) in workspaces" :key="index" class="workspace-item">
          <span @click="setActiveWorkspace(workspace.id)" :class="{ active: workspace.id == activeWorkspace }">
            {{ workspace.name }}
          </span>
          <button class="edit-workspace" @click.stop="editWorkspace(index)">Edit</button>
          <button class="delete-workspace" @click.stop="deleteWorkspace(workspace.id)">Delete</button>
        </li>
      </ul>
      <div class="add-workspace">
        <input v-model="newWorkspace" placeholder="New workspace name" />
        <button @click="addWorkspace">Add workspace</button>
      </div>
    </aside>
    <main class="main-container">
     
      <ListContainer
        v-for="(container, i) in containersList"
        :key="`container-${i}`"
        :container="container"
        :index="i"
        @add-item="handleAddItem"
        @show-task="openTaskWindow"
        @task-dropped="handleTaskDropped"
        @submit-workspace="submitWorkspace"
      />
      <TaskWindow
        v-if="showTaskWindow && selectedTask"
        :task="selectedTask"
        :containerName="selectedContainer"
        :containers="containersList"
        @close="closeTaskWindow"
        @update-status="moveTask"
        @save-task="saveTask"
      />
      <div class="create-new-list">
        <input type="text" v-model="newListName" placeholder="New list name" />
        <br />
        <button @click="addNewList">Create new list</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ListContainer from '../components/ListContainer.vue';
import TaskWindow from '../components/TaskWindow.vue';
import { useApiService } from '@/stores/apiService';
import { storeToRefs } from 'pinia';

const apiService = useApiService();
const { workspaces, containers } = storeToRefs(apiService);

const activeWorkspace = ref(0);
const newWorkspace = ref('');
const newListName = ref('');
const selectedTask = ref({ text: '', completed: false, description: '' });
const selectedContainer = ref('');
const showTaskWindow = ref(false);

// --- Settings dropdown funkcionalnost ---
const isSettingsDropdownVisible = ref(false);
const openSettings = () => {
  isSettingsDropdownVisible.value = !isSettingsDropdownVisible.value;
};
const closeSettings = () => {
  isSettingsDropdownVisible.value = false;
};

const darkMode = ref(false);
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
  if (darkMode.value) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
};

// submitWorkspace – koristi userData.value.id i šalje pojedinačni workspace objekt
const submitWorkspace = async (workspaceName) => {
  await apiService.submitWorkspace(workspaceName);
};

const resetBoard = () => {
  workspaces.value = [];
};

const exportData = () => {
  const data = JSON.stringify(workspaces.value);
  console.log('Exported Board Data:', data);
  alert('Board data exported to console.');
};

// --- Filters dropdown funkcionalnost ---
const isFiltersDropdownVisible = ref(false);
const selectedFilters = ref([]);
const containersList = computed(() =>{
  if(containers.value.length){
    return containers.value.filter((container) => container.workspace_id == activeWorkspace.value )
  }
  return [] 
}
);

const allFilters = computed(() => {
  return [...new Set(containersList.value.map(container => container.name.toLowerCase()))];
});
const filteredContainersList = computed(() => {
  if (selectedFilters.value.length === 0) {
    return containersList.value;
  }
  return containersList.value.filter(container =>
    selectedFilters.value.includes(container.name.toLowerCase())
  );
});
const openFilters = () => {
  isFiltersDropdownVisible.value = true;
};
const closeFilters = () => {
  isFiltersDropdownVisible.value = false;
};
const applyFilters = () => {
  closeFilters();
};
const resetFilters = () => {
  selectedFilters.value = [];
  closeFilters();
};

// --- Workspace dropdown i ostale funkcionalnosti ---
const isWorkspaceDropdownVisible = ref(false);
const toggleWorkspaceDropdown = () => {
  isWorkspaceDropdownVisible.value = !isWorkspaceDropdownVisible.value;
};
const setActiveWorkspace = (id) => {
  apiService.fetchContainers(id)
  activeWorkspace.value = id;
  isWorkspaceDropdownVisible.value = false;
};

// addWorkspace – dodaje novi workspace lokalno i poziva submitWorkspace s { name: workspaceName }
const addWorkspace = () => {
  apiService.submitWorkspace(newWorkspace.value)
};

// handleAddItem – dodaje novi task (karticu) u određeni container
const handleAddItem = async (listIndex) => {
  const container = containersList.value[listIndex];
  if (!container || !container.id) {
    console.error("Container id is missing for container at index", listIndex);
    return;
  }

  const newTask = {
    list_container_id: container.id,
    text: `New task`,
    description: '',
    comments: ""
  };
  // Pozivamo API endpoint za kreiranje zadatka
  await apiService.submitTasks(newTask);
  await apiService.fetchTasks(container.id)
};

const addNewList = async () => {
  await apiService.submitContainer(activeWorkspace.value, newListName.value)
};

const openTaskWindow = (task) => {
  console.log('open task', task)
  if (!task.comments) {
    task.comments = [];
  }
  selectedTask.value = task;
  showTaskWindow.value = true;
};

const closeTaskWindow = () => {
  showTaskWindow.value = false;
};

const moveTask = ({ taskText, newStatus }) => {
  let task = null;
  containersList.value.forEach((container) => {
    const index = container.items.findIndex((item) => item.text === taskText);
    if (index !== -1) {
      task = container.items.splice(index, 1)[0];
    }
  });
  if (task) {
    const targetContainer = containersList.value.find(
      (container) => container.name.toLowerCase() === newStatus.toLowerCase()
    );
    if (targetContainer) {
      targetContainer.items.push(task);
    }
  }
};

const handleTaskDropped = async (data) => {
  const { task, destinationContainerIndex } = data;
  const newListContainerId = containersList.value[destinationContainerIndex].id;

  await apiService.updateTask(task, newListContainerId)
  await apiService.fetchTasks(task.list_container_id);
};

const saveTask = ({ taskText, description, comments }) => {
  containersList.value.forEach((container) => {
    container.items.forEach((item) => {
      if (item.text === taskText) {
        item.description = description;
        item.comments = comments;
      }
    });
  });
  apiService.updateTask(taskText, description, comments);
};

const shareBoard = () => {
  navigator.clipboard.writeText(window.location.href)
    .then(() => alert('Board URL copied to clipboard!'))
    .catch(() => alert('Failed to copy URL.'));
};

const editWorkspace = async (index) => {
  const currentWorkspace = workspaces.value[index];
  const newName = prompt("Enter new name for workspace:", currentWorkspace.name);
  if (newName !== null && newName.trim() !== "") {
    await apiService.updateWorkspace(currentWorkspace.id, newName)
    await apiService.fetchWorkspaces()
  }
  console.log("Workspace edited locally.");
};

const deleteWorkspace = async (id) => {
  if (confirm("Are you sure you want to delete this workspace?")) {
    await apiService.deleteWorkspace(id)
    await apiService.fetchWorkspaces()
    if (activeWorkspace.value >= workspaces.value.length) {
      if(workspaces.value.length){
        activeWorkspace.value = workspaces.value[0].id
      }
    }
  }
  console.log("Workspace deleted locally.");
};

apiService.fetchWorkspaces().then(()=>{
  if(workspaces.value.length){
    activeWorkspace.value = workspaces.value[0].id
    apiService.fetchContainers(activeWorkspace.value)
  }
})
</script>

<style scoped>
.board-header {
  background-color: #0b3f44;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.board-name h1 {
  margin: 0;
  font-size: 1.5rem;
}

.navbar {
  display: flex;
  gap: 15px;
}

.navbar button {
  background: #4c778c;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.navbar button:hover {
  color: #ccc;
}

.settings-dropdown,
.filters-dropdown,
.workspace-dropdown {
  background: linear-gradient(135deg, #0b3f44, #033a4a);
  color: white;
  padding: 10px;
  border: 1px solid #00384d;
  opacity: 0;
  transform: translateY(-10px);
  animation: dropdownSlide 0.3s ease forwards;
}

@keyframes dropdownSlide {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.settings-dropdown ul,
.filters-dropdown ul,
.workspace-dropdown ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.settings-dropdown li,
.filters-dropdown li,
.workspace-dropdown li {
  padding: 8px;
  cursor: pointer;
  transition: background 0.1s, transform 0.3s;
}

.settings-dropdown li:hover,
.filters-dropdown li:hover,
.workspace-dropdown li:hover {
  background-color: #005a8e;
  transform: scale(1.005);
}

.filters-dropdown .filter-actions {
  display: flex;
  gap: 10px;
  padding-top: 10px;
}
body.dark-mode .settings-dropdown,
body.dark-mode .filters-dropdown,
body.dark-mode .workspace-dropdown {
  background: linear-gradient(135deg, #1a1a1a, #333333);
  color: #ddd;
  border: 1px solid #444;
  opacity: 0;
  transform: translateY(-10px);
  animation: dropdownSlide 0.3s ease forwards;
}

body.dark-mode .settings-dropdown ul,
body.dark-mode .filters-dropdown ul,
body.dark-mode .workspace-dropdown ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

body.dark-mode .settings-dropdown li,
body.dark-mode .filters-dropdown li,
body.dark-mode .workspace-dropdown li {
  padding: 8px;
  cursor: pointer;
  transition: background 0.1s, transform 0.3s;
}

body.dark-mode .settings-dropdown li:hover,
body.dark-mode .filters-dropdown li:hover,
body.dark-mode .workspace-dropdown li:hover {
  background-color: #555;
  transform: scale(1.005);
}

body.dark-mode .filters-dropdown .filter-actions {
  display: flex;
  gap: 10px;
  padding-top: 10px;
}

.app-container {
  display: flex;
  height: calc(100vh - 173px);
}

.sidebar {
  width: 270px;
  background: #1d1e22;
  color: rgb(86, 137, 169);
  padding: 20px;
  box-shadow: 0 5px 10px rgba(0,0,0,0.1);
  height: calc(100vh - 173px);
}

.sidebar h2 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #abaeb3;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li:hover {
  background: rgb(52, 57, 58);
  padding: 0;
  border-radius: 5px;
}

.workspace-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}

.workspace-item span {
  flex: 1;
  cursor: pointer;
}
.active{
  background-color: #555;
}

.edit-workspace,
.delete-workspace {
  background: none;
  border: none;
  color: #ccc;
  margin-left: 5px;
  cursor: pointer;
  font-size: 0.9rem;
}

.edit-workspace:hover,
.delete-workspace:hover {
  color: #fff;
}

.add-workspace {
  margin-top: 20px;
}

.add-workspace input {
  width: 90%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #4a4c4c;
  color: rgb(86, 137, 169);
  font-size: 14px;
}

.add-workspace button {
  width: 100%;
  padding: 8px;
  background: #4a4c4c;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.3s, transform 0.2s;
}

.add-workspace button:hover {
  background: #005a8e;
}

.main-container {
  background-color: #33656a;
  width: 100%;
  height: calc(100vh - 173px);
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 24px;
  padding: 20px;
}

.list-container {
  background-color: #093840;
  border-radius: 8px;
  padding: 16px;
  width: 250px;
  box-shadow: 0 5px 10px rgba(0,0,0,0.1);
  transition: transform 0.2s ease-in-out;
}

.list-container:hover {
  transform: scale(1.02);
}

.list-container h3 {
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #172b4d;
  text-transform: capitalize;
}

.create-new-list {
  background-color: #093840;
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

button {
  margin-top: 10px;
  margin-bottom: 5px;
  background-color: #0a4a54;
  color: rgb(86, 137, 169);
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

button:hover {
  background-color: #005a8e;
}

input[type="text"] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #0a4a54;
  color: rgb(86, 137, 169);
  font-size: 14px;
  width: 200px;
}

input[type="text"]:focus {
  outline: none;
  border-color: #0079bf;
  box-shadow: 0 0 0 2px rgba(14,74,108,0.2);
}

::v-deep .task-item {
  padding: 12px 16px;
  margin-bottom: 12px;
  border-radius: 6px;
}
</style>

<!-- Globalni stilovi za dark mode -->
<style>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}
body.dark-mode {
  background: url('/background3.jpg') no-repeat center center fixed !important;
  background-size: cover !important;
  color: #e0e0e0;
}
body.dark-mode .board-header {
  background-color: #1f1f1f !important;
}
body.dark-mode .navbar button {
  color: #e0e0e0 !important;
}
body.dark-mode .workspace-dropdown,
body.dark-mode .filters-dropdown,
body.dark-mode .settings-dropdown {
  background-color: #1f1f1f !important;
}
body.dark-mode .sidebar {
  background: #2c2c2c !important;
  color: #c0c0c0 !important;
}
body.dark-mode .main-container {
  background-color: #1e1e1e !important;
}
body.dark-mode .list-container {
  background-color: #2e2e2e !important;
  color: #e0e0e0 !important;
}
body.dark-mode input[type="text"] {
  background-color: #2e2e2e !important;
  color: #e0e0e0 !important;
}
body.dark-mode button {
  background-color: #333 !important;
  color: #e0e0e0 !important;
}
</style>
