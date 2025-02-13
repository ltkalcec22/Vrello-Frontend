<template>
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
        @close="closeTaskWindow"
        @update-status="moveTask"
      />
      <div class="create-new-list">
        <input type="text" v-model="newListName" placeholder="New list name" />
        <br />
        <button @click="addNewList">Create new list</button>
      </div>
    </main>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import ListContainer from '../components/ListContainer.vue';
  import TaskWindow from '../components/TaskWindow.vue';
  
  const containersList = ref([
    {
      name: 'to do',
      items: [
        { text: 'Task one', completed: false, description: '' },
        { text: 'Neki task', completed: false, description: '' }
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
  };
  
  const selectedTask = ref({ text: '', completed: false, description: '' });
  const selectedContainer = ref('');
  const showTaskWindow = ref(false);
  
  const openTaskWindow = (task, containerName) => {
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
      task.completed = newStatus === 'done';
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
  };
  
  const handleAddItem = (listIndex) => {
    const newItem = {
      text: `New Task ${containersList.value[listIndex].items.length + 1}`,
      completed: false,
      description: ''
    };
    containersList.value[listIndex].items.push(newItem);
  };
  </script>
  
  <style scoped>
  /* Glavni kontejner – postavljen tako da elementi budu raspoređeni u gornjem lijevom kutu */
  .main-container {
    position: relative;
    display: flex;
    flex-wrap: wrap;           /* Omogućava da se list-containeri prelamaju ako ima više njih */
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    padding: 20px;
    background-color: #0a4a54;
    min-height: calc(100vh - 60px);
  }
  
  /* Stilovi za list-container */
  .list-container {
    background-color: #093840;
    border-radius: 8px;
    padding: 16px;
    width: 250px;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  }
  
  .list-container h3 {
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: 600;
    color: #172b4d;
    text-transform: capitalize;
  }
  
  /* Element za kreiranje nove liste – sada pozicioniran u gornjem lijevom kutu */
  .create-new-list {
    position: absolute;
    top: 20px;
    right: 20px;
    background-color: #093840;
    padding: 12px;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }
  
  /* Univerzalni stilovi za gumbe i inpute */
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
  
  /* ::v-deep omogućava nadjačavanje stilova child komponenti, npr. task-item unutar ListContainer */
  ::v-deep .task-item {
    padding: 12px 16px;
    margin-bottom: 12px;
    border-radius: 6px;
  }
  </style>
  