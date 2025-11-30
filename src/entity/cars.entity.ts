import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cars')
export class Cars {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  price: number;

  @Column({ name: 'imgScr', nullable: true })
  image?: string;

  @Column({ nullable: true })
  isRented?: boolean;

  @Column({ nullable: true })
  fuelType?: string;
}
