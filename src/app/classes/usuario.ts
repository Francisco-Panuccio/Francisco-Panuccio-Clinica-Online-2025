export abstract class Usuario {
    id?: number;
    nombre: string;
    apellido: string;
    edad: number;
    dni: number;
    email: string;
    perfil: string;

    constructor(nombre: string, apellido: string, edad: number, dni: number, email: string, perfil:string, id?: number) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.dni = dni;
        this.email = email;
        this.perfil = perfil;
        this.id = id;
    }
}
