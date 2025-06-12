import { Usuario } from "./usuario";

export class Especialista extends Usuario{
    id_especialista?: number
    estado: string;
    especialidades:string[] = [];
    fotos?: string[] = [];
    dias_laborables?: string[] = [];
    horas_laborables?: string[] = [];

    constructor(nombre: string, apellido: string, edad: number, dni: number, email: string, perfil: string, especialidades:string[], estado: string, id?: number, id_especialista?: number, dias_laborables?: string[], horas_laborables?: string[], fotos?: string[]) {
        super(nombre, apellido, edad, dni, email, perfil, id);
        this.especialidades = especialidades;
        this.estado = estado;
        this.id_especialista = id_especialista;
        this.fotos = fotos;
        this.dias_laborables = dias_laborables;
        this.horas_laborables = horas_laborables;
    }
}
