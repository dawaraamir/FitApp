import { User } from "./user";

export class Exercise {
    id!: number;
    exerciseName!: string;
    category!: string;
    description!: string;
    sets!: number;
    reps!: number;
    image!: string;
}