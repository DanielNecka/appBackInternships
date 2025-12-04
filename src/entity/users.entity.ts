import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  login: string;

  @Column()
  password: string;

  @Column()
  role: 'admin' | 'user';

  @Column()
  date_add: string; 
}
