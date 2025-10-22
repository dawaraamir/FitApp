import { Component } from '@angular/core';

interface MacroSplit {
  title: string;
  carbs: number;
  protein: number;
  fats: number;
}

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent {
  readonly splits: MacroSplit[] = [
    { title: 'Losing weight', carbs: 25, protein: 50, fats: 25 },
    { title: 'Maintaining weight', carbs: 30, protein: 40, fats: 30 },
    { title: 'Gaining weight', carbs: 45, protein: 35, fats: 20 },
  ];
}
