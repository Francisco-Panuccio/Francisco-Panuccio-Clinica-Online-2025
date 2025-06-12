import { Usuario } from "./usuario";

export class Paciente extends Usuario {
    id_paciente?:number;
    obra_social:string;
    fotos?: string[] = [];

    constructor(nombre: string, apellido: string, edad: number, dni: number, email: string, perfil: string, obra_social:string, id?: number, id_paciente?: number, fotos?: string[]) {
        super(nombre, apellido, edad, dni, email, perfil, id);
        this.obra_social = obra_social;
        this.id_paciente = id_paciente;
        this.fotos = fotos;
    }
}
