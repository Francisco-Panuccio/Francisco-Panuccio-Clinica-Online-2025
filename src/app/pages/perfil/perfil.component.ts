import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { DatabaseUsersService } from '../../services/database-users.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { StorageService } from '../../services/storage.service';
import { FormatoDNIPipe } from '../../pipes/formato-dni.pipe';
import { Especialista } from '../../classes/especialista';
import { FormsModule } from '@angular/forms';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { TurnoService } from '../../services/turno.service';
import { Paciente } from '../../classes/paciente';
import { jsPDF } from 'jspdf';


@Component({
  selector: 'app-perfil',
  imports: [NavbarComponent, FormatoDNIPipe, FormsModule, TitleCasePipe, DatePipe],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit{
  auth = inject(AuthService);
  db = inject(DatabaseUsersService);
  router = inject(Router);
  storage = inject(StorageService);
  turnosDB = inject(TurnoService);

  id: number | undefined;
  nombre!: string;
  apellido!: string;
  dni!: string;
  email!: string;
  perfil!: string;
  avatar!: string;

  diasLaborables: string[] = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"];
  horasLaborables: string[] = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  diasSeleccionados: string[] = [];
  horasSeleccionadas: string[] = [];
  submitHabilitado = true;
  turnos: any[] = [];
  descargandoPDF: boolean = false;

  async ngOnInit() {
    const usuario = await this.auth.getUsuarioActual();
    if(usuario) {
      const email = usuario.email;
      const user = await this.db.listarUsuariosPorEmail(email!);
      if(user) {
        this.id = user[0].id;
        this.nombre = user[0].nombre;
        this.apellido = user[0].apellido;
        this.dni = String(user[0].dni);
        this.email = user[0].email;
        this.perfil = user[0].perfil;
        this.avatar = (await this.storage.listarArchivosPorEmail(this.email))[0];
        
        if(this.avatar === undefined) {
          this.avatar = "images/turno/foto_perfil_default.png";
        }

        if(user[0] instanceof Especialista) {
          this.diasSeleccionados = user[0].dias_laborables || [];
          this.horasSeleccionadas = user[0].horas_laborables || [];
        } else if(user[0] instanceof Paciente) {
          const idPaciente = user[0].id_paciente;
          this.turnos = await this.turnosDB.listarTurnosPaciente(String(idPaciente));
          this.turnos.sort((a,b) => {
            if(a.id_especialista !== b.id_especialista) {
              return (a.id_especialista - b.id_especialista);
            }
            return (new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
          });

          for(const turno of this.turnos) {
            const especialista = await this.db.listarUsuariosPorIdEspecialista(Number(turno.id_especialista));
            turno.nombreEsp = (`${especialista[0].nombre}`);
            turno.apellidoEsp = (`${especialista[0].apellido}`);
            turno.nombreCompletoEspecialista = (`${turno.nombreEsp} ${turno.apellidoEsp}`);
            turno.flagDescarga = false;
          }

          for(let i = 0; i < this.turnos.length - 1; i++) {
            const turnoActual = this.turnos[i];
            const turnoSiguiente = this.turnos[i+1];

            if(turnoActual.id_especialista !== turnoSiguiente.id_especialista) {
              turnoActual.flagDescarga = true;
            }
          }
          if(this.turnos.length > 0) {
            this.turnos[this.turnos.length-1].flagDescarga = true;
          }
        }
      }
    }
  }

  elegirDia(dia: string) {
    const index = this.diasSeleccionados.indexOf(dia);
    if(index > -1) {
      this.diasSeleccionados.splice(index, 1);
    } else {
      this.diasSeleccionados.push(dia);
    }
  }

  elegirHora(hora: string) {
    const index = this.horasSeleccionadas.indexOf(hora);
    if(index > -1) {
      this.horasSeleccionadas.splice(index, 1);
    } else {
      this.horasSeleccionadas.push(hora);
    }
  }

  async actualizarDisponibilidad() {
    if(this.id !== undefined) {
      this.diasSeleccionados.sort((a,b) => this.diasLaborables.indexOf(a) - this.diasLaborables.indexOf(b));
      this.horasSeleccionadas.sort();
      const actualizacion = await this.db.actualizarDisponibilidadEspecialistas(this.id!, this.diasSeleccionados, this.horasSeleccionadas);

      if(actualizacion) {
        window.location.reload();
        this.submitHabilitado = false;
      }
    } else {
      console.log("Error ID no definida");
    }
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  descargarPDF(especialistaID: any) {
    if(this.descargandoPDF) return;
    this.descargandoPDF = true;

    try {
      const doc = new jsPDF();
  
      const turnosEspecialista = this.turnos.filter(t => String(t.id_especialista) === String(especialistaID) && t.historia_clinica !== null);
  
      if(!turnosEspecialista.length) {
        return;
      }
  
      const nombreCompletoEspecialista = turnosEspecialista[0].nombreCompletoEspecialista;
  
      const logoUrl = "images/home/logo.png";
      doc.addImage(logoUrl, "PNG", 10, 10, 50, 20);
  
      doc.setFontSize(20);
      doc.text(`Historial Clínico con ${nombreCompletoEspecialista}`, 70, 20);
  
      const fecha = new Date().toLocaleDateString();
      doc.setFontSize(11);
      doc.text(`Fecha de Emisión: ${fecha}`, 70, 30);
      doc.line(10, 40, 200, 40);
  
      let y = 50;
      const centroX = 105;
  
      doc.setFontSize(16);
      const medidaTxt = doc.getTextWidth("Datos del Paciente: ");
      doc.text("Datos del Paciente: ", centroX, y, {align: "center"});
      doc.line((centroX-medidaTxt/2), (y+1), (centroX+medidaTxt/2), (y+1));
      y += 10;
      doc.setFontSize(13);
      doc.text(`Nombre: ${this.nombre}`, centroX, y, {align: "center"});
      y += 10;
      doc.text(`Apellido: ${this.apellido}`, centroX, y, {align: "center"});
      y += 10;
      doc.text(`DNI: ${this.dni}`, centroX, y, {align: "center"});
      y += 10;
      doc.text(`Email: ${this.email}`, centroX, y, {align: "center"});
      y += 10;
      doc.line(10, y-5, 200, y-5);
      y += 5;
  
      for(const turno of turnosEspecialista) {
        if(y > 270) {
          doc.addPage();
          y = 20;
        }
  
        doc.setFontSize(13);
        doc.text(`Fecha: ${turno.fecha}`, 10, y);
        y += 10;
        doc.text(`Altura: ${turno.historia_clinica.altura}cm`, 10, y);
        y += 10;
        doc.text(`Peso: ${turno.historia_clinica.peso}kg`, 10, y);
        y += 10;
        doc.text(`Temperatura: ${turno.historia_clinica.temperatura}°C`, 10, y);
        y += 10;
        doc.text(`Presión: ${turno.historia_clinica.presion}mmHg`, 10, y);
        y += 10;
  
        if(turno.historia_clinica.datosAdicionales?.length) {
          y += 5;
          const medidaTxt = doc.getTextWidth("Datos Adicionales: ");
          doc.text("Datos Adicionales: ", 10, y);
          doc.line((10), (y+1), (30+medidaTxt/2), (y+1));
          y += 10;
          for(const dato of turno.historia_clinica.datosAdicionales) {
            const claveCapitalizada = this.capitalizeFirstLetter(dato.clave);
            doc.text(`${claveCapitalizada}: ${dato.valor}`, 10, y);
            y += 10;
          }
        }
  
        doc.line(10, y, 200, y);
        y += 10;
      }
  
      doc.save(`Historia_Clinica_${nombreCompletoEspecialista.replace(/\s+/g, '_')}.pdf`);
    } catch(error) {
      console.log("Error en la Descarga del PDF: " + error);
    } finally { 
      this.descargandoPDF = false;
    }
  }
}
