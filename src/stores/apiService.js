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
    const containers = ref({});

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
    const submitWorkspace = async (name) => {
        try {
          const rawResponse = await fetch(`http://localhost:3000/workspaces`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token.value}`
            },
            body: JSON.stringify({ name })
          });
      
          if (!rawResponse.ok) {
            const errorText = await rawResponse.text();
            throw new Error(`HTTP error! status: ${rawResponse.status}, response: ${errorText}`);
          }
      
          const contentType = rawResponse.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const responseData = await rawResponse.json();
            console.log("Workspace created:", responseData);
            fetchWorkspaces();
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
     * Kreiranje containera
     */
    const submitContainer = async (workspaceId, name) => {
        try {
            const rawResponse = await fetch('http://localhost:3000/containers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.value}`,
                },
                body: JSON.stringify({ workspace_id: workspaceId, name }),
            });
            const response = await rawResponse.json();
            console.log("Container created:", response);
            fetchContainers(workspaceId);
            return response;
        } catch (error) {
            console.error("Error creating container:", error);
        }
    };

    /**
     * Fetchanje containera
     */
    const fetchContainers = async (workspaceId) => {
        try {
            const rawResponse = await fetch(`http://localhost:3000/workspaces/${workspaceId}/containers`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.value}`
                }
            });
            const response = await rawResponse.json();
            containers.value = response.containers;
            return containers.value;
        } catch (error) {
            console.error("Error fetching containers:", error);
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
                body: JSON.stringify( tasks ),
            });
            const response = await rawResponse.json();
            console.log("Tasks created:", response);
            console.log("New task data:", newTask);

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
            const rawResponse = await fetch(`http://localhost:3000/workspaces`, {
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

    const fetchTasks = async (containerId) => {
        try {
            const rawResponse = await fetch(`http://localhost:3000/containers/${containerId}/tasks`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.value}`
                }
            });
            const response = await rawResponse.json();
            // Pronađemo container po ID-u
            const containerToAdd = containers.value.find(container => container.id == containerId);
            // Dodajemo dohvaćene taskove tom containeru
            containerToAdd.tasks = response.tasks;
            console.log("Fetched tasks for container:", containerToAdd);
            // Vraćamo taskove, a ne containerToAdd.value.tasks
            return containerToAdd.tasks;
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };
    
    
    /**
     * Ažuriranje zadatka
     */
    const updateTask = async (task, newListContainerId) => {
        try {
            const { text, description, comments, list_container_id, id } = task
            const rawResponse = await fetch(`http://localhost:3000/containers/${list_container_id}/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.value}`
                },
                body: JSON.stringify({
                    text,
                    description,
                    comments,
                    list_container_id: newListContainerId
                }),
            });
    
            if (!rawResponse.ok) {
                throw new Error('Error updating task');
            }
    
            const response = await rawResponse.json();
            console.log("Task updated:", response);
            await fetchTasks(newListContainerId)
            return response;
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const deleteTask = async (task) => {
        try {
            const { list_container_id, id } = task;
            const rawResponse = await fetch(`http://localhost:3000/containers/${list_container_id}/tasks/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.value}`
                },
                
            });
    
            if (!rawResponse.ok) {
                throw new Error('Error updating task');
            }
    
            const response = await rawResponse.json();
            console.log("Task updated:", response);
            return response;
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const deleteWorkspace = async (workspace_id) => {
        try {
            const rawResponse = await fetch(`http://localhost:3000/workspaces/${workspace_id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.value}`
                },
                
            });
    
            if (!rawResponse.ok) {
                throw new Error('Error updating task');
            }
    
            const response = await rawResponse.json();
            console.log("workspace updated:", response);
            return response;
        } catch (error) {
            console.error("Error deleting workspace:", error);
        }
    };
    const updateWorkspace = async (workspaces_id, name) => {
        try {
            const rawResponse = await fetch(`http://localhost:3000/workspaces/${workspaces_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.value}`
                },
                body: JSON.stringify({
                   name
                }),
            });
    
            if (!rawResponse.ok) {
                throw new Error('Error updating task');
            }
    
            const response = await rawResponse.json();
            console.log("Workspace updated:", response);
            return response;
        } catch (error) {
            console.error("Error updating Workspace:", error);
        }
    };


    /* ===== FUNKCIJE ZA KOMENTARE ===== */

    /**
     * Kreiranje komentara za zadani task
     */
    const submitComment = async (taskId, commentText) => {
        try {
            const rawResponse = await fetch('http://localhost:3000/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.value}`
                },
                body: JSON.stringify({ task_id: taskId, text: commentText }),
            });
            const response = await rawResponse.json();
            console.log("Comment created:", response);
            return response;
        } catch (error) {
            console.error("Error creating comment:", error);
        }
    };

    /**
     * Dohvaćanje komentara za određeni task
     */
    const fetchComments = async (taskId) => {
        try {
            const rawResponse = await fetch(`http://localhost:3000/tasks/${taskId}/comments`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.value}`
                }
            });
            const response = await rawResponse.json();
            console.log("Fetched comments:", response);
            // Pretpostavljamo da API vraća polje 'comments'
            return response.comments;
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    /**
     * Ažuriranje komentara
     */
    const updateComment = async (commentId, commentText) => {
        try {
            const rawResponse = await fetch(`http://localhost:3000/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.value}`
                },
                body: JSON.stringify({ text: commentText }),
            });
            const response = await rawResponse.json();
            console.log("Comment updated:", response);
            return response;
        } catch (error) {
            console.error("Error updating comment:", error);
        }
    };

    /**
     * Brisanje komentara
     */
    const deleteComment = async (commentId) => {
        try {
            const rawResponse = await fetch(`http://localhost:3000/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.value}`
                }
            });
            if (!rawResponse.ok) {
                throw new Error("Error deleting comment");
            }
            const response = await rawResponse.json();
            console.log("Comment deleted:", response);
            return response;
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    return {
        token,
        workspaces,
        containers,
        login,
        signUp,
        submitTasks,
        submitWorkspace,
        fetchWorkspaces,
        updateWorkspace,
        deleteWorkspace,
        fetchTasks,
        updateTask,
        deleteTask,
        submitContainer,
        fetchContainers,
        submitComment,
        fetchComments,
        updateComment,
        deleteComment,
    };
});
