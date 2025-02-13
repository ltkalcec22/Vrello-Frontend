<template>

    <form class="form-login" @submit.prevent="login" >
        <h1>Login</h1>
    <label>Username</label>
    <input v-model="username" type="text"   placeholder="Enter your username"> 

    <label>Password</label>
    <input v-model="password" type="password"  placeholder="Enter your password">

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
    color: rgb(208, 219, 225);
    display: flex; 
    flex-direction: column; 
    width: 300px;
    max-width: 400px;
    margin: 20px auto;
    padding: 20px;
    background-color: rgba(9, 56, 64, 0.8);
    z-index: 1000;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.finput textarea {
   
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

label {
    display: block;
    margin-bottom: 5px;
    color: rgb(225, 233, 237);
}

input, textarea, select {
    width: 90%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    background-color: #093840;
    color:#0056b3;
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
</style>