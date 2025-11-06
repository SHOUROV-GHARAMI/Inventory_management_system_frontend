import { Component } from '@angular/core';
import { LayoutComponent } from './components/layout/layout';

@Component({
  selector: 'app-root',
  imports: [LayoutComponent],
  template: '<app-layout></app-layout>',
  styleUrl: './app.scss'
})
export class App {}
