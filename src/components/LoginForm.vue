<template>
    <form @submit.prevent="login" style="display: flex; flex-direction: column; width: 300px;">
    <label>Username</label>
    <input v-model="username" type="text" style="width: 90%;"  placeholder="Enter your username"> 

    <label>Password</label>
    <input v-model="password" type="password" style="width: 90%;" placeholder="Enter your password">

    <button style="margin-top: 10px; width:98%">Log in</button>
</form>

</template>

<script setup>
import { ref } from 'vue';
import { useApiService } from '../stores/apiService';

const apiService = useApiService();

const username = ref('');
const password = ref('')
const login = () => {
    apiService.login(username.value, password.value);
}
</script>

<style scoped>
form {
    max-width: 400px;
    margin: 20px auto;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

label {
    display: block;
    margin-bottom: 5px;
    color:black;
}

input, textarea, select {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
}

button {
    width: 100%;
    padding: 10px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.3s;
}

button:hover {
    background: #0056b3;
}
</style>