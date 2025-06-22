import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trigger, transition, style, animate, query, group } from '@angular/animations';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [
    trigger('routeAnimations', [
      transition('* => RegistroPage', [
        query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
        group([
          query(':enter', [
            style({ transform: 'translateY(-100%)', opacity: 0 }),
            animate('500ms ease-out', style({ transform: 'translateY(0%)', opacity: 1 }))
          ], { optional: true }),
          query(':leave', [
            animate('300ms ease-in', style({ opacity: 0 }))
          ], { optional: true })
        ])
      ]),

      transition('* => LoginPage', [
        query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
        group([
          query(':enter', [
            style({ transform: 'translateY(100%)', opacity: 0 }),
            animate('500ms ease-out', style({ transform: 'translateY(0%)', opacity: 1 }))
          ], { optional: true }),
          query(':leave', [
            animate('300ms ease-in', style({ opacity: 0 }))
          ], { optional: true })
        ])
      ]),
    ])
  ]
})
export class AppComponent {
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
