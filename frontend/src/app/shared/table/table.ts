import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Skeleton } from "../skeleton/skeleton";
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-table',
  imports: [CommonModule, Skeleton],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table {
  @Input() loading: boolean = false;
  @Input() columns: { field: string; title: string }[] = [];
  @Input() hiddenColumn: string = '';
  @Input() data: any[] = [];
  @Output() edit: EventEmitter<any> = new EventEmitter<any>();
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();

  base = environment.imageBaseUrl;
}
