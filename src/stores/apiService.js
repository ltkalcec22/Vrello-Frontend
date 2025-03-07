import router from '@/router';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export const useApiService = defineStore('apiService', () => {
    const token = ref(null);
    const router = useRouter(); // Koristimo router iz useRouter()

    // Sprema korisničke podatke nakon prijave/registracije
    const userData = ref(null);

    // Početni workspaces objekt (ovo može biti prazan niz)
    const workspaces = ref([]);

    /**
     * Prijava korisnika
     */
    const login = async (username, password) => {
        try {
            const rawResponse = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password }),
            });
            const response = await rawResponse.json();
            console.log("Login response:", response);
            if (response.token && response.user) {
                token.value = response.token;
                userData.value = response.user;
                router.push('/tasks');
            } else {
                console.error("Login failed: No token or user received", response);
            }            
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    /**
     * Registracija korisnika
     */
    const signUp = async (username, email, password) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
        try {
            const rawResponse = await fetch('http://localhost:3000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password }),
            });
            const response = await rawResponse.json();
            console.log("SignUp response:", response);
            if (response.token && response.user) {
                token.value = response.token;
                userData.value = response.user;
                router.push('/tasks');
            } else {
                console.error("SignUp failed: No token or user received", response);
            }
        } catch (error) {
            console.error("SignUp error:", error);
        }
    };

    /**
     * Kreiranje workspacea
     */
    const submitWorkspace = async (userId, workspace) => {
        try {
          const rawResponse = await fetch(`http://localhost:3000/users/${userId}/workspaces`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token.value}`
            },
            body: JSON.stringify(workspace)
          });
      
          if (!rawResponse.ok) {
            const errorText = await rawResponse.text();
            throw new Error(`HTTP error! status: ${rawResponse.status}, response: ${errorText}`);
          }
      
          const contentType = rawResponse.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const responseData = await rawResponse.json();
            console.log("Workspace created:", responseData);
            return responseData;
          } else {
            const textData = await rawResponse.text();
            throw new Error(`Expected JSON but got: ${textData}`);
          }
        } catch (error) {
          console.error("Error creating workspace:", error);
        }
      };
    

    /**
     * Kreiranje zadataka
     */
    const submitTasks = async (tasks) => {
        try {
            const rawResponse = await fetch('http://localhost:3000/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.value}`,
                },
                body: JSON.stringify({ tasks }),
            });
            const response = await rawResponse.json();
            console.log("Tasks created:", response);
            return response;
        } catch (error) {
            console.error("Error creating tasks:", error);
        }
    };

    /**
     * Dohvaćanje workspaceova – GET zahtjev (bez body)
     * URL se generira pomoću userData.id
     */
    const fetchWorkspaces = async () => {
        try {
            if (!userData.value || !userData.value.id) {
                console.error("User data is not available.");
                return;
            }
            // Generiramo URL koristeći userData.id
            const rawResponse = await fetch(`http://localhost:3000/users/${userData.value.id}/workspaces`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.value}`
                }
            });
            const response = await rawResponse.json();
            console.log("Fetched workspaces:", response);
            workspaces.value = response.workspaces;
            return workspaces.value;
        } catch (error) {
            console.error("Error fetching workspaces:", error);
        }
    };

    /**
     * Ažuriranje zadatka
     */
    const updateTask = async (taskText, description, comments) => {
        try {
            const rawResponse = await fetch('http://localhost:3000//containers/:list_container_id/tasks/:id', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.value}`
                },
                body: JSON.stringify({
                    text: taskText,
                    description,
                    comments
                }),
            });
    
            if (!rawResponse.ok) {
                throw new Error('Error updating task');
            }
    
            const response = await rawResponse.json();
            console.log("Task updated:", response);
            return response;
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    return {
        token,
        workspaces,
        login,
        signUp,
        submitTasks,
        submitWorkspace,
        fetchWorkspaces,
        updateTask
    };
});
