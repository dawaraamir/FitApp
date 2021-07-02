import { Exercise } from "./exercise";

export class User {
    userId!: number;
    name!: string;
    email!: string;
    password!: string;
    exercise!: Exercise;
}