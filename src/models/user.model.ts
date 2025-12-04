export interface User {
    id: number;
    login: string;
    password: string;
    role: 'admin' | 'user'; 
    date_add: string; 
}