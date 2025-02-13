<template>
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <button class="close-btn" @click="close">X</button>
        <div class="status-dropdown">
          <label for="status-select">Status:</label>
          <select id="status-select" v-model="selectedStatus" @change="updateStatus">
            <!-- Opcije se generiraju iz liste svih listi -->
            <option
              v-for="(container, index) in containers"
              :key="index"
              :value="container.name">
              {{ container.name }}
            </option>
          </select>
        </div>
        <div class="task-details">
          <h2>{{ task.text }}</h2>
          <p><strong>Container:</strong> {{ containerName }}</p>
        </div>
        <div class="description-section">
          <h3>Description</h3>
          <textarea v-model="description" placeholder="Enter description..."></textarea>
        </div>
        <div class="comments-section">
          <h3>Comments</h3>
          <ul>
            <li v-for="(comment, index) in comments" :key="index">{{ comment }}</li>
          </ul>
          <div class="comment-section-baby">
            <textarea v-model="newComment" placeholder="Add a comment"></textarea>
          </div>
          <br>
          <button class="btn" @click="addComment">Add Comment</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits, ref, watch } from 'vue';
  
  const props = defineProps({
    show: {
      type: Boolean,
      default: false
    },
    task: {
      type: Object,
      default: () => ({ text: '', description: '' })
    },
    containerName: {
      type: String,
      default: ''
    },
    // Primamo sve liste kako bismo mogli prikazati status opcije
    containers: {
      type: Array,
      default: () => []
    }
  });
  
  const emit = defineEmits(['close', 'update-status', 'save-task']);
  
  const selectedStatus = ref(props.containerName);
  const description = ref(props.task.description || '');
  const comments = ref(props.task.comments ? [...props.task.comments] : []);
  const newComment = ref('');
  
  watch(
    () => props.task,
    (newTask) => {
      if (newTask) {
        description.value = newTask.description || '';
        // Ako su komentari definirani u tasku, kopiramo ih, inače postavljamo prazan niz
        comments.value = newTask.comments ? [...newTask.comments] : [];
      }
    },
    { immediate: true }
  );
  
  const updateStatus = () => {
    emit('update-status', { taskText: props.task.text, newStatus: selectedStatus.value });
  };
  
  const addComment = () => {
    if (newComment.value.trim() !== '') {
      comments.value.push(newComment.value.trim());
      newComment.value = '';
    }
  };
  
  // Kada zatvorimo modal, emitiramo save-task s ažuriranim podacima
  const close = () => {
    emit('save-task', { 
      taskText: props.task.text, 
      description: description.value, 
      comments: comments.value 
    });
    emit('close');
  };
  </script>
  
  <style scoped>
  /* CSS ostaje nepromijenjen */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(9, 56, 64, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  .status-dropdown {
    position: relative;
    background-color: #134851;
    padding: 20px;
    border-radius: 8px;
    width: 80%;
    max-width: 500px;
    color: rgb(134, 180, 220);
    border: 2px solid transparent;
  }
  #status-select {
    position: relative;
    background-color: #134851;
    padding: 20px;
    border-radius: 8px;
    width: 80%;
    max-width: 500px;
    color: rgb(134, 180, 220);
    border: 2px solid transparent;
  }
  .description-section textarea{
    position: relative;
    background-color: #134851;
    padding: 20px;
    margin-bottom:10px;
    border-radius: 8px;
    width: 80%;
    max-width: 500px;
    color: rgb(134, 180, 220);
    border: 2px solid transparent;
  }
  .comments-section {
    position: relative;
    background-color: #134851;
    padding: 20px;
    border-radius: 8px;
    width: 80%;
    max-width: 500px;
    color: rgb(134, 180, 220);
    border: 2px solid transparent;
  }
  .comment-section-baby textarea {
    background-color: #0e1c2a;  
    color: #ffffff;               
    border: 1px solid #585abd;    
    border-radius: 4px;        
    padding: 10px;             
    font-size: 14px;           
    width: 100%;               
    height: 80px;              
    box-sizing: border-box;
  }
  .modal-content {
    position: relative;
    background-color: #093840;
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 5px 5px rgba(224, 222, 222, 0.1);
    color: rgb(134, 180, 220);
    border: 2px solid transparent;
  }
  .close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    border: none;
    background: #0a4a54;
    color: rgb(134, 180, 220);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }
  .btn {
    border: none;
    background: #0a4a54;
    color: rgb(134, 180, 220);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }
  .btn:hover {
    background-color: rgb(86, 137, 169);
    color: #093840;
  }
  .close-btn:hover {
    background-color: rgb(86, 137, 169);
    color: #093840;
  }
  .completed {
    text-decoration: line-through;
    color: rgb(86, 137, 169);
  }
  </style>
  