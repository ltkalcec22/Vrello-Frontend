<template>
    <div class="board-header">
    <div class="board-name">
      <h1>Tasks</h1>
    </div>
    <div class="board-actions">
      <button aria-label="Star board">★</button>
      <button aria-label="Workspace visible">Workspace</button>
      <button aria-label="Filters">Filters</button>
      <button aria-label="Share board">Share</button>
      <button aria-label="More">…</button>
    </div>
  </div>
  <div class="app-container">
  <aside class="sidebar">
      <h2>Workspaces</h2>
      <ul>
        <li 
          v-for="(workspace, index) in workspaces" 
          :key="index" 
          @click="setActiveWorkspace(index)"
          :class="{ active: index === activeWorkspace }"
        >
          {{ workspace.name }}
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
      />
      <TaskWindow
        v-if="showTaskWindow && selectedTask"
        :show="showTaskWindow"
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
  import { ref } from 'vue';
  import ListContainer from '../components/ListContainer.vue';
  import TaskWindow from '../components/TaskWindow.vue';
  import { useApiService } from '../stores/apiService';

  const apiService = useApiService();
  
  const containersList = ref([
    {
      name: 'to do',
      items: [
        { text: 'Task one', description: '' },
        { text: 'Neki task', description: '' }
      ]
    },
    {
      name: 'doing',
      items: []
    },
    {
      name: 'done',
      items: []
    }
  ]);
  
  const newListName = ref('');
  
  const addNewList = () => {
    if (newListName.value.trim() !== '') {
      containersList.value.push({
        name: newListName.value.toLowerCase(),
        items: []
      });
      newListName.value = '';
    }
    apiService.submitTasks(containersList.value)
  };
  
  const selectedTask = ref({ text: '', completed: false, description: '' });
  const selectedContainer = ref('');
  const showTaskWindow = ref(false);
  
  const openTaskWindow = (task, containerName) => {
    // Ako zadatak nema property comments, inicijaliziraj ga
    if (!task.comments) {
      task.comments = [];
    }
    selectedTask.value = task;
    selectedContainer.value = containerName;
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
  
  const handleTaskDropped = (data) => {
    const { task, sourceContainerIndex, taskIndex, destinationContainerIndex } = data;
    if (sourceContainerIndex === destinationContainerIndex) return;
  
    const sourceContainer = containersList.value[sourceContainerIndex];
    const destinationContainer = containersList.value[destinationContainerIndex];
  
    if (sourceContainer && destinationContainer) {
      const removedTask = sourceContainer.items.splice(taskIndex, 1)[0];
      destinationContainer.items.push(removedTask);
    }
    apiService.submitTasks(containersList.value)
  };
  
  const handleAddItem = (listIndex) => {
    const newItem = {
      text: `New Task ${containersList.value[listIndex].items.length + 1}`,
      description: '',
      comments: []  // Dodajemo prazan niz komentara
    };
    containersList.value[listIndex].items.push(newItem);
    apiService.submitTasks(containersList.value)
  };
  
  // Ova funkcija ažurira opis i komentare u odgovarajućem tasku
  const saveTask = ({ taskText, description, comments }) => {
    containersList.value.forEach((container) => {
      container.items.forEach((item) => {
        if (item.text === taskText) {
          item.description = description;
          item.comments = comments;
        }
      });
    });
  };
  </script>
  
  <style scoped>
.app-container {
  display: flex;
  height: calc(100vh - 173px);
}

.sidebar {
  width: 200px;
  background: #1d1e22; /* Usklađeno s list-container */
  color: rgb(86, 137, 169);
  padding: 20px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
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

.sidebar li {
  padding: 10px;
  cursor: pointer;
  transition: background 0.3s, color 0.3s;
  border-radius: 6px;
}

.sidebar li.active {
  background: #0a4a54; /* Usklađeno s gumbima */
  font-weight: bold;
  color: white;
}

.sidebar li:hover {
  background: #005a8e;
  color: rgb(208, 188, 188);
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

.board-header {
  background-color: #0b3f44; /* Usklađeno s main-container */
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

.board-actions button {
  background: none;
  border: none;
  margin-left: 10px;
  font-size: 1rem;
  cursor: pointer;
  color: white;
}

.main-container {
  background-color: #33656a;
  width:100%;
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
  background-color: #093840; /* Originalna boja */
  border-radius: 8px;
  padding: 16px;
  width: 250px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
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
  background-color: #093840; /* Originalna boja */
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.create-new-list {
  background-color: #093840;
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
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
  box-shadow: 0 0 0 2px rgba(14, 74, 108, 0.2);
}

::v-deep .task-item {
  padding: 12px 16px;
  margin-bottom: 12px;
  border-radius: 6px;
}

  </style>
  