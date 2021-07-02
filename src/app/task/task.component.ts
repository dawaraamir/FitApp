import { Component, Input, Output, EventEmitter } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent {
  exercises = [
    'Lat Pulldown',
    'Dumbbell Bench Press',
    'Shoulder Shrug',
    'Bicep Curls',
    'Tricep Pulls',
    'Russian Twist',
    'Squats'
  ];

  sunday = [''];

  monday = [
    ''
  ];

  tuesday = [
    ''
  ];

  wednesday = [
    ''
  ];

  thursday = [
   ''
  ];

  friday = [
    ''
  ];

  saturday = [
    ''
  ];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
  }
}
