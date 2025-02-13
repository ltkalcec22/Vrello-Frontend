<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useApiService } from './stores/apiService';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

const apiService = useApiService();
const { token } = storeToRefs(apiService)
const router = useRouter();

const logout = () => {
    token.value = null;
    router.push('/login');
}
</script>

<template>
  <header>
    

    <div class="wrapper">
     
    
      <nav class="navigation">
        <h1>Vrello</h1>
        <div class="navigation-links">
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/about">About</RouterLink>

          <button to="/logout" v-if="token" @click="logout">Log out</button>

          <template v-else>
            <RouterLink to="/login">Log in</RouterLink>
            <RouterLink to="/signup">Sign up</RouterLink>
          </template>

          <RouterLink to="/tasks" v-if="token">Tasks</RouterLink>
        </div>
       
      </nav>
    
    </div>
  </header>

  <RouterView />
</template>


<style scoped>
nav button {
  all: unset;
  cursor: pointer;
}
</style>
