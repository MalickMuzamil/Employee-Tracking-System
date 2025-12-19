import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  imports: [CommonModule],
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.css',
})
export class Skeleton {
  @Input() lines: number = 5;

  createArray(count: number) {
    return Array.from({ length: count });
  }
}
