<script setup>
import { RouterLink, RouterView } from 'vue-router'

</script>

<template>
  <header>
    

    <div class="wrapper">
     
    
      <nav class="navigation">
        <h1>Vrello</h1>
        <div class="navigation-links">
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/about">About</RouterLink>
          <RouterLink to="/login">Log in</RouterLink>
          <RouterLink to="/signup">Sign up</RouterLink>
          <RouterLink to="/tasks">Tasks</RouterLink>
        </div>
       
      </nav>
    
    </div>
  </header>

  <RouterView />
</template>


<style scoped>

</style>
