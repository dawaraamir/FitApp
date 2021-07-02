import { Pipe, PipeTransform } from '@angular/core';
import { Exercise } from './exercise';

@Pipe({
  name: 'searchfilter'
})
export class SearchfilterPipe implements PipeTransform {

  transform(Exercises: Exercise[], searchValue: string): Exercise[]  {
    if(!Exercises || !searchValue || searchValue=="Show All"){
      return Exercises;
    }
    return Exercises.filter(exercise =>
      exercise.category.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()));
  }

}
