import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { DatabaseUsersService } from '../../services/database-users.service';
import { TurnoService } from '../../services/turno.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { LogsService } from '../../services/logs.service';
import { DatePipe, TitleCasePipe} from '@angular/common';
import { FormatoHoraPipe } from '../../pipes/formato-hora.pipe';
import { ColorearUsuarioDirective } from '../../directives/colorear-usuario.directive';
import { ApexAxisChartSeries, ApexChart, ApexTitleSubtitle, ApexXAxis, NgxApexchartsModule } from 'ngx-apexcharts';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [NavbarComponent, DatePipe, FormatoHoraPipe, ColorearUsuarioDirective, NgxApexchartsModule, FormsModule],
  providers: [DatePipe, TitleCasePipe],
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css']
})
export class EstadisticasComponent implements OnInit{
  auth = inject(AuthService);
  db = inject(DatabaseUsersService);
  turnosDB = inject(TurnoService);
  logsDB = inject(LogsService);
  datePipe = inject(DatePipe);
  titleCasePipe = inject(TitleCasePipe);

  cargando: boolean = true;
  usuarios: any[] = [];
  especialistas: {nombreCompleto: string, id_especialista: number}[] = [];
  especialistaSeleccionadoSolicitado!: string;
  fechaInicialSolicitado!: string;
  fechaFinalSolicitado!: string;
  especialistaSeleccionadoFinalizado!: string;
  fechaInicialFinalizado!: string;
  fechaFinalFinalizado!: string;
  descargandoPDF: boolean = false;

  logs: {usuario: string, fecha_hora: any, tipoUsuario: string}[] = [];
  contadorEspecialidad: {especialidad: string, cantidad: number}[] = [];
  contadorFechas: {fecha: string, cantidad: number}[] = [];
  contadorEspecialistaSolicitado: {fecha: string, cantidad: number}[] = [];
  contadorEspecialistaFinalizado: {fecha: string, cantidad: number}[] = [];

  chartEspecialidad!: ChartOptions;
  chartFecha!: ChartOptions;
  chartEspecialistaSolicitado!: ChartOptions;
  chartEspecialistaFinalizado!: ChartOptions;

  async ngOnInit() {
    const usuario = await this.auth.getUsuarioActual();
    try {
      if(usuario) {
        this.logs = await this.logsDB.listarLogs();
        for(const log of this.logs) {
          const tipoUsuario = await this.db.listarUsuariosPorEmail(log.usuario);
          log.tipoUsuario = (tipoUsuario[0].perfil);
        }

        const mapTurnos = await this.turnosDB.contarTurnosPorEspecialidad();
        this.contadorEspecialidad = Array.from(mapTurnos, ([especialidad, cantidad]) => ({
          especialidad, 
          cantidad
        }));

        const mapFechas = await this.turnosDB.contarTurnosPorFecha();
        this.contadorFechas = Array.from(mapFechas, ([fecha, cantidad]) => ({
          fecha, 
          cantidad
        }));

        this.usuarios = await this.db.listarUsuarios();
        for(const usuario of this.usuarios) {
          if(usuario.perfil === "Especialista") {
            this.especialistas.push({nombreCompleto: `${usuario.nombre} ${usuario.apellido}`, id_especialista: usuario.id_especialista});
          }
        }
        if(this.especialistas.length > 0) {
          this.especialistaSeleccionadoSolicitado = this.especialistas[0].id_especialista.toString();
          this.especialistaSeleccionadoFinalizado = this.especialistas[0].id_especialista.toString();
        }

        this.inicializarGraficos();
      }
    } finally {
      this.cargando = false;
    }
  }

  async filtrarTurnos(eleccion: string) {
    if(eleccion === "Solicitado") {
      if (!this.especialistaSeleccionadoSolicitado || !this.fechaInicialSolicitado || !this.fechaFinalSolicitado) return;

      const turnosEspecialista = await this.turnosDB.listarTurnosEspecialista(String(this.especialistaSeleccionadoSolicitado));
      const turnosFiltradosSolicitados = turnosEspecialista.filter(t => t.estado === "Pendiente" || t.estado === "Aceptado" || t.estado === "Cancelado");
      const fechaInicialDate = new Date(this.fechaInicialSolicitado);
      const fechaFinalDate = new Date(this.fechaFinalSolicitado);
      
      const turnosEnRangoDeFechas = turnosFiltradosSolicitados.filter(turno => {
        const fechaTurno = new Date(turno.fecha);
        return fechaTurno >= fechaInicialDate && fechaTurno <= fechaFinalDate;
      });
      
      const mapEspecialistasSolicitados = new Map<string, number>();
      for(const turno of turnosEnRangoDeFechas) {
        const fechaNormalizada = this.datePipe.transform(turno.fecha, "yyyy-MM-dd");
        mapEspecialistasSolicitados.set(fechaNormalizada!, (mapEspecialistasSolicitados.get(fechaNormalizada!) || 0) + 1);
      }

      this.contadorEspecialistaSolicitado = Array.from(mapEspecialistasSolicitados, ([fecha, cantidad]) => ({
        fecha, 
        cantidad
      }));

      //Turnos por Especialista Solicitado
      this.chartEspecialistaSolicitado = {
        series: [{
          name: "Turnos Solicitados con Especialista",
          data: this.contadorEspecialistaSolicitado.map(e => e.cantidad)
        }],
        chart: {
          type: "bar",
          width: 800,
          height: 500
        },
        title: {
          text: `Turnos Solicitados de ${this.datePipe.transform(this.fechaInicialSolicitado, "dd-MM-yyyy")} a ${this.datePipe.transform(this.fechaFinalSolicitado, "dd-MM-yyyy")}`
        },
        xaxis: {
          categories: this.contadorEspecialistaSolicitado.map(e => this.datePipe.transform(e.fecha, "dd-MM-yyyy"))
        }
      };
    } else {
      if (!this.especialistaSeleccionadoFinalizado || !this.fechaInicialFinalizado || !this.fechaFinalFinalizado) return;

      const turnosEspecialista = await this.turnosDB.listarTurnosEspecialista(String(this.especialistaSeleccionadoFinalizado));
      const turnosFiltradosFinalizados = turnosEspecialista.filter(t => t.estado === "Realizado");
      const fechaInicialDate = new Date(this.fechaInicialFinalizado);
      const fechaFinalDate = new Date(this.fechaFinalFinalizado);
      
      const turnosEnRangoDeFechas = turnosFiltradosFinalizados.filter(turno => {
        const fechaTurno = new Date(turno.fecha);
        return fechaTurno >= fechaInicialDate && fechaTurno <= fechaFinalDate;
      });
      
      const mapEspecialistasFinalizados = new Map<string, number>();
      for(const turno of turnosEnRangoDeFechas) {
        const fechaNormalizada = this.datePipe.transform(turno.fecha, "yyyy-MM-dd");
        mapEspecialistasFinalizados.set(fechaNormalizada!, (mapEspecialistasFinalizados.get(fechaNormalizada!) || 0) + 1);
      }

      this.contadorEspecialistaFinalizado = Array.from(mapEspecialistasFinalizados, ([fecha, cantidad]) => ({
        fecha, 
        cantidad
      }));

      //Turnos por Especialista Finalizado
      this.chartEspecialistaFinalizado = {
        series: [{
          name: "Turnos Finalizados con Especialista",
          data: this.contadorEspecialistaFinalizado.map(e => e.cantidad)
        }],
        chart: {
          type: "bar",
          width: 800,
          height: 500
        },
        title: {
          text: `Turnos Finalizados de ${this.datePipe.transform(this.fechaInicialFinalizado, "dd-MM-yyyy")} a ${this.datePipe.transform(this.fechaFinalFinalizado, "dd-MM-yyyy")}`
        },
        xaxis: {
          categories: this.contadorEspecialistaFinalizado.map(e => this.datePipe.transform(e.fecha, "dd-MM-yyyy"))
        }
      };
    }
  }

  inicializarGraficos() {
    //Turnos por Especialidad
    this.chartEspecialidad = {
      series: [{
        name: "Turnos",
        data: this.contadorEspecialidad.map(e => e.cantidad)
      }],
      chart: {
        type: "bar",
        width: 800,
        height: 500
      },
      title: {
        text: "Turnos por Especialidad"
      },
      xaxis: {
        categories: this.contadorEspecialidad.map(e => this.titleCasePipe.transform(e.especialidad))
      }
    };

    //Turnos por Fecha
    this.chartFecha = {
      series: [{
        name: "Turnos por Fecha",
        data: this.contadorFechas.map(f => f.cantidad)
      }],
      chart: {
        type: "line",
        width: 800,
        height: 500
      },
      title: {
        text: "Turnos por Fecha"
      },
      xaxis: {
        categories: this.contadorFechas.map(f => this.datePipe.transform(f.fecha, "dd-MM-yyyy"))
      }
    };
  }

  async exportChartToPDF(divId: string, pdf: jsPDF): Promise<void> {
    const element = document.getElementById(divId);
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const imgProps = pdf.getImageProperties(imgData);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const maxWidth = pageWidth - 20;
    const maxHeight = pageHeight - 20;
    let imgWidth = maxWidth;
    let imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    
    if (imgHeight > maxHeight) {
      imgHeight = maxHeight;
      imgWidth = (imgProps.width * imgHeight) / imgProps.height;
    }

    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
  }

  agregarPaginaLogs(pdf: jsPDF) {
    pdf.addPage();
    pdf.setFontSize(40);
    pdf.text('Logs del Sistema', pdf.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    pdf.setFontSize(12);
    const marginX = 10;
    const startY = 30;
    const lineHeight = 8;

    let posY = startY;

    pdf.setFont("Times New Roman", "bold")
    pdf.text('Usuario', marginX, posY);
    pdf.text('Perfil', 80, posY);
    pdf.text('Fecha y Hora', 130, posY);
    pdf.setFont("Courier New", "normal");

    posY += lineHeight;

    for (const log of this.logs) {
      if (posY > 280) {
        pdf.addPage();
        posY = startY;
      }

      pdf.text(log.usuario, marginX, posY);
      pdf.text(log.tipoUsuario, 80, posY);
      const fechaHora = this.datePipe.transform(log.fecha_hora, 'dd/MM/yyyy - HH:mm');
      pdf.text(fechaHora ?? '', 130, posY);

      posY += lineHeight;
    }
  }

  async descargarPDF() {
    if(this.descargandoPDF) return;
    this.descargandoPDF = true;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
  
      pdf.setFontSize(30);
      pdf.text('Estadísticas', pdf.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
  
      this.agregarPaginaLogs(pdf);
  
      const graficos: { id: string, condition: boolean }[] = [
        { id: 'graficoEspecialidad', condition: true },
        { id: 'graficoFecha', condition: true },
        { id: 'graficoEspecialistaSolicitado', condition: !!this.chartEspecialistaSolicitado },
        { id: 'graficoEspecialistaFinalizado', condition: !!this.chartEspecialistaFinalizado }
      ];
  
      for (const grafico of graficos) {
        if (grafico.condition) {
          pdf.addPage();
          await this.exportChartToPDF(grafico.id, pdf);
        }
      }
  
      pdf.save('estadisticas.pdf');
    } catch(error) {
      console.log("Error en la Descarga del PDF: " + error);
    } finally {
      this.descargandoPDF = false;
    }
  }
}
