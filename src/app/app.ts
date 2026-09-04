import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './shared/components/nav-bar/nav-bar';
import { ToastComponent } from './shared/components/toast/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
