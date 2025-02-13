import router from '@/router';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export const useApiService = defineStore('apiService', () => {
    const token = ref(null);

    const route = useRouter();

    const login = async (username, password) => {
        try {
            // const response = await fetch('http://localhost:3000/login', {
            //     method: 'POST',
            //     body: JSON.stringify({ username, password }),
            // });
            // token.value = await response.json();
            token.value = "some-token";
            router.push('/tasks');
        } catch (error) {
            console.error(error);
        }
    };

    // Dodana funkcija za sign up s provjerom ispravnosti emaila
    const signUp = async (username, email, password) => {
        // Provjera ispravnosti emaila
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }

        try {
            const response = await fetch('http://localhost:3000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password }),
            });
            token.value = await response.json();
        } catch (error) {
            console.error(error);
        }
    };

    const submitTasks = async (tasks) => {
        try {
            const response = await fetch('http://localhost:3000/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.value}`,
                },
                body: JSON.stringify({ tasks }),
            });
            return await response.json();
        } catch (error) {
            console.error(error);
        }
    }

    return {
        token,
        login,
        signUp,
        submitTasks
    }
});
