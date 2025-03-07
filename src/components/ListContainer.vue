<template>
  <div class="list-container">
    <h3>{{ container.name }}</h3>
    <ul 
      class="task-list"
      :class="{ 'droppable': isDroppable }"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="onDrop"
    >
      <li
        v-for="(item, index) in container.items"
        :key="index"
        class="task-item"
        draggable="true"
        :class="{ 'draggable': isDragging }"
        @dragstart="onDragStart($event, item, index)"
        @dragend="onDragEnd"
      >
        <!-- Klikom na tekst se otvara skočni prozor s detaljima zadatka -->
        <span :class="{ completed }" @click.stop="openTask(item)">{{ item.text }}</span>
        <!-- Gumbići za uređivanje i brisanje -->
        <div class="task-actions">
          <button class="edit-btn" @click.stop="editTask(item)">Edit</button>
          <button class="delete-btn" @click.stop="deleteTask(index)">Delete</button>
        </div>
      </li>
    </ul>

    <!-- Gumb za dodavanje novog zadatka -->
    <button class="add-card-btn" @click="$emit('add-item', index)">Add Card</button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed } from 'vue';

const props = defineProps({
  container: {
    type: Object,
    default: () => ({ name: '', items: [] })
  },
  index: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['add-item', 'show-task', 'task-dropped', 'submit-workspace']);

const isDroppable = ref(false);
const isDragging = ref(false);

const completed = computed(() => {
  return props.container.name === 'done';
});

// Otvara skočni prozor s podacima o zadatku
const openTask = (task) => {
  emit('show-task', task, props.container.name);
};

// Pokreće drag operaciju
const onDragStart = (event, task, taskIndex) => {
  isDragging.value = true;
  const data = {
    task,
    sourceContainerIndex: props.index,
    taskIndex
  };
  event.dataTransfer.setData("application/json", JSON.stringify(data));
  event.dataTransfer.effectAllowed = "move";
};

const onDragEnd = () => {
  isDragging.value = false;
};

const onDrop = (event) => {
  event.preventDefault();
  isDroppable.value = false;
  const data = event.dataTransfer.getData("application/json");
  if (data) {
    try {
      const parsedData = JSON.parse(data);
      emit('task-dropped', { 
        ...parsedData, 
        destinationContainerIndex: props.index 
      });
    } catch (error) {
      console.error("Error parsing drop data", error);
    }
  }
};

const handleDragOver = () => {
  isDroppable.value = true;
};

const handleDragLeave = () => {
  isDroppable.value = false;
};

// Funkcija za uređivanje zadatka (otvara prompt za promjenu naziva)
const editTask = (item) => {
  const newText = prompt("Edit task name", item.text);
  if(newText !== null && newText.trim() !== "") {
    item.text = newText;
  }
  emit('submit-workspace')
};

// Funkcija za brisanje zadatka
const deleteTask = (index) => {
  props.container.items.splice(index, 1);
  emit('submit-workspace')
};
</script>

<style scoped>
.list-container {
  background-color: #093840;
  border-radius: 8px;
  padding: 16px;
  margin: 10px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  color: rgb(134, 180, 220);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.list-container h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  text-transform: capitalize;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
}

ul.droppable {
  border: 2px dashed rgb(134, 180, 220);
  padding: 8px;
  border-radius: 6px;
}

.task-item {
  background: rgba(0, 150, 255, 0.15);
  border: 1px solid rgba(0, 150, 255, 0.15);
  padding: 12px 16px;
  margin-bottom: 12px;
  border-radius: 6px;
  cursor: grab;
  transition: background 0.2s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-list {
  padding: 2px 6px;
  margin-bottom: 12px;
  border-radius: 6px;
}

.task-item:active {
  cursor: grabbing;
  transform: scale(1.05);
  box-shadow: 0px 6px 14px rgba(0, 0, 0, 0.2);
}

.draggable {
  opacity: 0.8;
  transform: scale(1.1);
}

.completed {
  text-decoration: line-through;
  color: rgb(86, 137, 169);
}

.add-card-btn {
  display: block;
  width: 100%;
  background-color: #0a4a54;
  color: rgb(134, 180, 220);
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-card-btn:hover {
  background-color: rgb(86, 137, 169);
  color: #093840;
}

/* Stilovi za gumbiće za edit i delete */
.task-actions {
  display: flex;
  gap: 5px;
}

.edit-btn, .delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #67b4e1;
  font-size: 0.8rem;
}

.edit-btn:hover, .delete-btn:hover {
  color: #ccc;
}
</style>
