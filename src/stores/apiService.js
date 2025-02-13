import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useApiService = defineStore('apiService', () => {
    const token = ref(null);

    const login = async (username, password) => {
        try {
            const response = fetch('http://localhost:3000/login', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            })
            token.value = await response.json();
        } catch (error) {
            console.error(error);
        }
    }

    return {
        token,
        login,
    }
});