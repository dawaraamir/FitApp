import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  type = 'doughnut';
  data = {
  labels: ["Carbs", "Proteins", "Fats"],
  datasets: [
    {
      label: "g",
      data: [25, 50, 25],
      backgroundColor: ["#5d4c45", "tomato", "sandybrown"],
      borderColor: [
        'black',
        'black',
        'black'
    ],
    borderWidth: 3
    }
  ]
};
options = {
  responsive: true,
  maintainAspectRatio: false
};

type2 = 'doughnut';
  data2 = {
  labels: ["Carbs", "Proteins", "Fats"],
  datasets: [
    {
      label: "maintain",
      data: [30, 40, 30],
      backgroundColor: ["#5d4c45", "tomato", "sandybrown"],
      borderColor: [
        'black',
        'black',
        'black'
    ],
    borderWidth: 3
    }
  ]
};
options2 = {
  responsive: true,
  maintainAspectRatio: false
};

type3 = 'doughnut';
  data3 = {
  labels: ["Carbs", "Proteins", "Fats"],
  datasets: [
    {
      label: "gain weight",
      data: [45, 35, 20],
      backgroundColor: ["#5d4c45", "tomato", "sandybrown"],
      borderColor: [
        'black',
        'black',
        'black'
    ],
    borderWidth: 3
    }
  ]
};
options3 = {
  responsive: true,
  maintainAspectRatio: false
};

  constructor() { }

  ngOnInit(): void {
  }

}

