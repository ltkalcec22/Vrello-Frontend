<script setup>
import LoginForm from '../components/LoginForm.vue';
import SignUpForm from '../components/SignUpForm.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToAuth = (route) => {
  router.push(route);
};
</script>

<template>
  <main class="main-container">
    <div class="home-container">
      <div class="text-content">
        <h3>Welcome to Vrello – Your Ultimate Project Management Solution!</h3>
        <p>
          Vrello is an intuitive platform designed to streamline project management 
          and enhance team collaboration. Inspired by Trello, Vrello offers a familiar 
          yet uniquely tailored experience to meet your specific needs.
        </p>
      </div>
      <div class="button-container">
        <button class="auth-button" @click="navigateToAuth('/login')">Login</button>
        <button class="auth-button" @click="navigateToAuth('/signup')">Sign Up</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Glavni kontejner koji centrira sadržaj */
.main-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh-60px);
  background-color: #f5f5f5;
}

/* Kontejner za početnu stranicu */
.home-container {
  text-align: center;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
}

/* Stilizacija teksta */
.text-content h3 {
  font-size: 22px;
  margin-bottom: 15px;
  color: #0a4a54;
}

.text-content p {
  font-size: 16px;
  color: #333;
  line-height: 1.6;
}

/* Kontejner za gumbe */
.button-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

/* Stilizacija gumba */
.auth-button {
  background-color: #0a4a54;
  color: rgb(86, 137, 169);
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.auth-button:hover {
  background-color: #005a8e;
  transform: scale(1.05);
}
</style>
