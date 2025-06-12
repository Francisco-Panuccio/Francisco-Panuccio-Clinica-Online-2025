import { Usuario } from "./usuario";

export class Administrador extends Usuario{
    id_administrador?:number;
    fotos?: string[] = [];

    constructor(nombre: string, apellido: string, edad: number, dni: number, email: string, perfil: string, id?: number, id_administrador?: number, fotos?: string[]) {
        super(nombre, apellido, edad, dni, email, perfil, id);
        this.id_administrador = id_administrador;
        this.fotos = fotos;
    }
}
